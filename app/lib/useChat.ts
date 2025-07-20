// "use client"
// import { useState, useEffect, useRef } from 'react';
// import io, { Socket } from 'socket.io-client';
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie';
// interface JwtPayload {
//   sub: string;
//   exp: number;
// }

// interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   details?: {
//     original_text?: string;
//     translated_text?: string;
//     pinyin?: string;
//     explanation?: string;
//     audio?: string;
//   };
// }

// export function useChat() {
//   const [chatInput, setChatInput] = useState('');
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const socketRef = useRef<any | null>(null);
//   const [userID, setUserID] = useState('');
//   const userIdRef = useRef<string | null>(null);

//   useEffect(() => {
    

// const token = Cookies.get('token');
// console.log(token)
//     if (!token) {
//       console.error('No JWT found, please login');
//       return;
//     }

//     try {
//       const decoded: JwtPayload = jwtDecode(token);
//       setUserID(decoded.sub);
//       userIdRef.current = decoded.sub;
//       console.log('Decoded userId:', userIdRef.current);
//     } catch (error) {
//       console.error('Error decoding JWT:', error);
//       return;
//     }

//     // const socket = io('http://localhost:8000', {
//     //   path: '/chat/socket.io', // đây là endpoint bạn mount ở server
//     //   auth: { token },
//     //   transports: ['websocket', 'polling'],
//     // });
//     console.log('Connecting to WebSocket with token:', token);
//     const socket = io("http://localhost:8000", {
//       path: '/socket.io/socket.io', // Khớp với endpoint server
//       query: { service: "chat" },   // Giữ query parameter
//       auth: { token },
//       transports: ["websocket"],
//     });
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Socket.IO connected for chat');
//     });

//     socket.on('response', (data: any) => {
//       console.log('Received response:', data);
//       if (data.error) {
//         console.error('Chat error:', data.error);
//         setIsLoading(false);
//         return;
//       }

//       // Độ trễ tối thiểu 500ms để đảm bảo loading hiển thị
//       setTimeout(() => {
//         const assistantMessage = {
//           role: 'assistant',
//           content: data.translated_text || data.response || 'No response',
//           timestamp: new Date().toISOString(),
//           details: {
//             original_text: data.original_text,
//             translated_text: data.translated_text,
//             pinyin: data.pinyin,
//             explanation: data.explanation,
//             audio: data.audio,
//           },
//         };
//         setChatMessages((prev:any) => {
//           const newMessages = [...prev, assistantMessage];
//           console.log('Chat messages:', JSON.stringify(newMessages, null, 2));
//           return newMessages;
//         });
//         console.log('Turning off loading');
//         setIsLoading(false);
//       }, 500);
//     });

//     socket.on('connect_error', (error: any) => {
//       console.error('Socket.IO connect_error:', error.message);
//       setIsLoading(false);
//     });


//     socket.on('disconnect', () => {
//       console.log('Socket.IO disconnected for chat');
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleChatSubmit = () => {
//     if (chatInput.trim() && socketRef.current?.connected) {
//       const userMessage: ChatMessage = {
//         role: 'user',
//         content: chatInput,
//         timestamp: new Date().toISOString(),
//       };

//       setChatMessages((prev) => {
//         const newMessages = [...prev, userMessage];
//         console.log('Chat messages:', JSON.stringify(newMessages, null, 2));
//         return newMessages;
//       });

//       socketRef.current.emit('message', {
//         text: chatInput,
//         explain: true,
//       });

//       setChatInput('');
//       console.log('Turning on loading');
//       setIsLoading(true);
//     } else {
//       console.error('Socket.IO is not connected or chat input is empty');
//     }
//   };

//   return {
//     chatInput,
//     setChatInput,
//     chatMessages,
//     handleChatSubmit,
//     isLoading,
//     userId: userID || 'unknown',
//   };
// }

//compoent/lib/useChat.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  sub: string;
  exp: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  details?: {
    original_text?: string;
    translated_text?: string;
    pinyin?: string;
    explanation?: string;
    audio?: string;
    audio_b64?: string;
    original_audio_b64?: string;
    original_audio_mime_type?: string;
  };
}

export function useChat() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMessage, setRecordingMessage] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const socketRef = useRef<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const [userID, setUserID] = useState('');
  const userIdRef = useRef<string | null>(null);
  const MAX_AUDIO_DURATION = 60;

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      console.error('No JWT found, please login');
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      setUserID(decoded.sub);
      userIdRef.current = decoded.sub;
      console.log('Decoded userId:', userIdRef.current);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return;
    }

    const socket = io('http://localhost:8000', {
      path: '/socket.io',
      query: { service: 'chat' },
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected for chat, SID:', socket.id);
      heartbeatRef.current = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping', { timestamp: Date.now() });
          console.log('Sent ping to keep connection alive');
        }
      }, 10000);
    });

    socket.on('pong', (data: any) => {
      console.log('Received pong:', data);
    });

    socket.on('response', (data: any) => {
      console.log('Received response:', JSON.stringify(data, null, 2));
      if (data.error) {
        console.error('Chat error:', data.error);
        setIsLoading(false);
        setIsProcessing(false);
        setRecordingMessage(data.error);
        setChatMessages((prev) => {
          const updatedMessages = [...prev];
          const lastUserMessageIndex = updatedMessages
            .slice()
            .reverse()
            .findIndex((msg) => msg.role === 'user');
          if (lastUserMessageIndex !== -1) {
            const index = updatedMessages.length - 1 - lastUserMessageIndex;
            if (updatedMessages[index].content === 'Đang xử lý âm thanh...') {
              updatedMessages[index] = {
                ...updatedMessages[index],
                content: 'Lỗi xử lý âm thanh',
              };
            }
          }
          return updatedMessages;
        });
        return;
      }

      setChatMessages((prev) => {
        const updatedMessages = [...prev];
        const lastUserMessageIndex = updatedMessages
          .slice()
          .reverse()
          .findIndex((msg) => msg.role === 'user');
        if (lastUserMessageIndex !== -1) {
          const index = updatedMessages.length - 1 - lastUserMessageIndex;
          if (updatedMessages[index].content === 'Đang xử lý âm thanh...') {
            updatedMessages[index] = {
              ...updatedMessages[index],
              content: data.original_text || 'N/A',
              details: {
                ...updatedMessages[index].details,
                original_text: data.original_text,
                audio_b64: data.audio_b64 || updatedMessages[index].details?.audio_b64,
                original_audio_b64: data.original_audio_b64 || updatedMessages[index].details?.original_audio_b64,
                original_audio_mime_type:
                  data.original_audio_mime_type || updatedMessages[index].details?.original_audio_mime_type,
              },
            };
          }
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.translated_text || data.response || 'No response',
          timestamp: new Date().toISOString(),
          details: {
            original_text: data.original_text,
            translated_text: data.translated_text,
            pinyin: data.pinyin,
            explanation: data.explanation,
            audio: data.audio_b64,
            audio_b64: data.audio_b64,
            original_audio_b64: data.original_audio_b64,
            original_audio_mime_type: data.original_audio_mime_type,
          },
        };
        const newMessages = [...updatedMessages, assistantMessage];
        console.log('Updated chatMessages (response):', JSON.stringify(newMessages, null, 2));
        return newMessages;
      });

      if (data.audio_b64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
        audio.play().catch((error) => {
          console.error('Autoplay failed:', error);
          setRecordingMessage('Click to play audio');
        });
      }
      setIsLoading(false);
      setIsProcessing(false);
    });

    socket.on('translate_result', (data: any) => {
      console.log('Received translate_result:', JSON.stringify(data, null, 2));
      if (data.error) {
        console.error('Translate error:', data.error);
        setIsProcessing(false);
        setRecordingMessage(data.error);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.translated_text || data.original_text || 'No response',
        timestamp: new Date().toISOString(),
        details: {
          original_text: data.original_text,
          pinyin: data.pinyin,
          translated_text: data.translated_text,
          audio: data.audio_b64,
          original_audio_b64: data.original_audio_b64,
          original_audio_mime_type: data.original_audio_mime_type,
        },
      };
      setChatMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        console.log('Updated chatMessages (translate_result):', JSON.stringify(newMessages, null, 2));
        return newMessages;
      });
      if (data.audio_b64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
        audio.play().catch((error) => {
          console.error('Autoplay failed:', error);
          setRecordingMessage('Click to play audio');
        });
      }
      setIsProcessing(false);
    });

    socket.on('error', (data: any) => {
      console.error('Socket error:', data.message);
      setIsLoading(false);
      setIsProcessing(false);
      setRecordingMessage(data.message || 'An error occurred');
      setChatMessages((prev) => {
        const updatedMessages = [...prev];
        const lastUserMessageIndex = updatedMessages
          .slice()
          .reverse()
          .findIndex((msg) => msg.role === 'user');
        if (lastUserMessageIndex !== -1) {
          const index = updatedMessages.length - 1 - lastUserMessageIndex;
          if (updatedMessages[index].content === 'Đang xử lý âm thanh...') {
            updatedMessages[index] = {
              ...updatedMessages[index],
              content: 'Lỗi xử lý âm thanh',
            };
          }
        }
        return updatedMessages;
      });
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connect_error:', error.message);
      setIsLoading(false);
      setIsProcessing(false);
      setRecordingMessage('Connection error. Retrying...');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected for chat');
      setRecordingMessage('Disconnected from server. Reconnecting...');
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    });

    socket.on('reconnect', (attempt: number) => {
      console.log('Socket.IO reconnected after', attempt, 'attempts');
      setRecordingMessage('');
      heartbeatRef.current = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping', { timestamp: Date.now() });
          console.log('Sent ping to keep connection alive');
        }
      }, 10000);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  const handleChatSubmit = () => {
    if (chatInput.trim() && socketRef.current?.connected) {
      const userMessage: ChatMessage = {
        role: 'user',
        content: chatInput,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => {
        const newMessages = [...prev, userMessage];
        console.log('Updated chatMessages (user):', JSON.stringify(newMessages, null, 2));
        return newMessages;
      });

      socketRef.current.emit('message', {
        text: chatInput,
        explain: true,
      });

      setChatInput('');
      setIsLoading(true);
    } else {
      console.error('Socket.IO is not connected or chat input is empty');
      setRecordingMessage('Cannot send message. Please check connection or input.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm; codecs=opus') 
        ? 'audio/webm; codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/ogg') 
          ? 'audio/ogg' 
          : 'audio/webm';
      console.log('Selected mimeType:', mimeType);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => handleAudioStop(mimeType);
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingMessage(`Ghi âm tối đa ${MAX_AUDIO_DURATION} giây`);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= MAX_AUDIO_DURATION) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          console.log(`Recording stopped after ${MAX_AUDIO_DURATION}s`);
        }
      }, MAX_AUDIO_DURATION * 1000);
    } catch (error) {
      console.error('Start recording error:', error);
      setRecordingMessage('Không thể truy cập micro. Vui lòng kiểm tra quyền.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingMessage('');
    setRecordingTime(0);
    setIsProcessing(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAudioStop = (mimeType: string) => {
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString();
      const base64 = result?.startsWith(`data:${mimeType};base64,`) ? result.split(',')[1] : result;
      console.log('Base64 audio:', base64?.substring(0, 50));
      console.log('Base64 length:', base64?.length);
      console.log('Audio mimeType:', mimeType);

      const userMessage: ChatMessage = {
        role: 'user',
        content: 'Đang xử lý âm thanh...',
        timestamp: new Date().toISOString(),
        details: {
          original_audio_b64: base64,
          original_audio_mime_type: mimeType,
        },
      };
      setChatMessages((prev) => {
        const newMessages = [...prev, userMessage];
        console.log('Added user message with audio:', JSON.stringify(newMessages, null, 2));
        return newMessages;
      });

      if (socketRef.current?.connected) {
        socketRef.current.emit('message', { audio: base64, mimeType });
      } else {
        console.error('Socket.IO is not connected. Cannot send audio.');
        setRecordingMessage('Cannot send audio. Please check connection.');
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const clearChatMessages = () => {
    setChatMessages([]);
    console.log('Cleared chatMessages');
  };

  return {
    chatInput,
    setChatInput,
    chatMessages,
    handleChatSubmit,
    isLoading,
    isRecording,
    startRecording,
    stopRecording,
    recordingMessage,
    recordingTime,
    isProcessing,
    userId: userID || 'unknown',
    clearChatMessages, // Expose the function to clear chat messages
  };
}