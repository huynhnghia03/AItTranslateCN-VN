"use client";
import { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  sub: string;
  exp: number;
}

interface PronunciationResult {
  original_text: string;
  spoken_text: string;
  normalized_original_text: string;
  normalized_spoken_text: string;
  original_pinyin: string;
  spoken_pinyin: string;
  accuracy: number;
  highlighted_text: string;
  errors: { char: string; expected_pinyin: string; spoken_pinyin: string; spoken_char: string; index: number }[];
  missing_chars: { char: string; expected_pinyin: string; index: number }[];
  extra_chars: { char: string; spoken_pinyin: string; index: number }[];
  reading_info: {
    char_count: number;
    hsk_level: string;
    reading_speed_cpm: number;
    minimum_speed_cpm: number;
    estimated_time_seconds: number;
    estimated_time_minutes: number;
    minimum_time_seconds: number;
    estimated_time_formatted: string;
    minimum_time_formatted: string;
    source: string;
  };
  speed_comparison: {
    expected_time: number;
    actual_time: number;
    speed_ratio: number;
    is_faster: boolean;
    time_difference: number;
  };
}

export function useAudio() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [recordingMessage, setRecordingMessage] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<SocketIOClient.Socket | null>(null);
  const userIdRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userID, setUserID] = useState<string>('');
  const MAX_AUDIO_DURATION = 30; // 30 seconds

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
      console.log('Decoded userId:', decoded.sub);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return;
    }

    const socket = io('http://localhost:8002', {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected for audio');
    });

    socket.on('pronunciation_result', (data: PronunciationResult) => {
      console.log('Received pronunciation_result:', data);
      setPronunciationResult(data);
      setIsProcessing(false);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setIsProcessing(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connect error:', error.message);
      setIsProcessing(false);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsProcessing(false);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

const startRecording = async (
  mode: 'pronunciation_check',
  originalText?: string,
  hskLevel: string = 'hsk3',
  maxDuration: number = 30
) => {
  if (mode !== 'pronunciation_check' || !originalText) {
    console.error('Invalid mode or missing original text for pronunciation check');
    return;
  }

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

    mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => handleAudioStop(mode, originalText, mimeType, hskLevel);
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordingMessage(`Ghi âm tối đa ${Math.ceil(maxDuration)} giây`);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;
        if (next >= maxDuration) {
          stopRecording();
        }
        return next;
      });
    }, 1000);

    setTimeout(() => {
      if (isRecording) {
        stopRecording();
        console.log(`Recording stopped after ${maxDuration}s`);
      }
    }, maxDuration * 1000);
  } catch (error) {
    console.error('Start recording error:', error);
    setRecordingMessage('Không thể truy cập micro. Vui lòng kiểm tra quyền.');
  }
};

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingMessage('');
    setRecordingTime(0);
    setIsProcessing(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

const handleAudioStop = (mode: 'pronunciation_check', originalText: string, mimeType: string, hskLevel: string) => {
  const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    const base64 = result.startsWith(`data:${mimeType};base64,`) ? result.split(',')[1] : result;
    console.log('Base64 audio:', base64.substring(0, 50));
    console.log('Base64 length:', base64.length);
    console.log('Audio mimeType:', mimeType);
    socketRef.current?.emit('check_pronunciation', { 
      audio: base64, 
      mimeType, 
      original_text: originalText, 
      hsk_level: hskLevel // Add HSK level
    });
  };
  reader.readAsDataURL(audioBlob);
};
return {
  isRecording,
  pronunciationResult,
  startRecording: (
    mode: 'pronunciation_check',
    originalText?: string,
    hskLevel?: string,
    maxDuration?: number
  ) => startRecording(mode, originalText, hskLevel || 'hsk3', maxDuration || 30),
  stopRecording,
  userId: userID || 'unknown',
  recordingMessage,
  recordingTime,
  isProcessing,
};
}
// "use client";
// import { useState, useRef, useEffect, useCallback } from 'react';
// import io from 'socket.io-client';
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie';

// interface JwtPayload {
//   sub: string;
//   exp: number;
// }

// interface AudioText {
//   task_id?: string;
//   original_text: string;
//   pinyin: string;
//   translated_text: string;
//   audio_b64: string;
//   audio:any
// }

// interface PronunciationResult {
//   task_id?: string;
//   original_text: string;
//   spoken_text: string;
//   original_pinyin: string;
//   spoken_pinyin: string;
//   accuracy: number;
//   errors: Array<{ index: number; char: string; expected_pinyin: string; spoken_pinyin: string }>;
//   missing_chars: Array<{ index: number; char: string; expected_pinyin: string; sample_audio?: string }>;
//   tone_errors: Array<{ index: number; char: string; expected_pinyin: string; spoken_pinyin: string }>;
//   highlighted_text: string;
//   note?: string;
//   error?: string;
// }

// interface QueueStatus {
//   pending: any;
// }

// interface TaskProgress {
//   task_id: string;
//   status: 'queued' | 'processing' | 'completed';
//   progress: number;
// }

// export function useAudio() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioText, setAudioText] = useState<AudioText | null>(null);
//   const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
//   const [recordingMessage, setRecordingMessage] = useState<string>('');
//   const [recordingTime, setRecordingTime] = useState<number>(0);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [userId, setUserId] = useState<string>('');
//   const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
//   const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
//   const [pendingError, setPendingError] = useState<{ message: string; task_id?: string } | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const socketRef = useRef<any>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const lastRequestRef = useRef<{ mode: 'translate' | 'pronunciation'; originalText?: string } | null>(null);
//   const MAX_AUDIO_DURATION = 15;
//   const QUEUE_LIMIT = 5;

//   // Kết nối WebSocket
//   useEffect(() => {
//     const token = Cookies.get('token');
//     if (!token) {
//       console.error('No JWT found, please login');
//       setPronunciationResult({ error: 'Vui lòng đăng nhập để sử dụng chức năng thu âm.' } as PronunciationResult);
//       return;
//     }

//     try {
//       const decoded: JwtPayload = jwtDecode(token);
//       setUserId(decoded.sub);
//     } catch (error) {
//       console.error('Error decoding JWT:', error);
//       setPronunciationResult({ error: 'Token không hợp lệ.' } as PronunciationResult);
//       return;
//     }

//     const socket = io('http://localhost:8000', {
//       path: '/socket.io',
//       query: { service: "audio" },
//       auth: { token },
//       transports: ["websocket"],
//     });
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Socket.IO connected for audio');
//     });

//     socket.on('queue_status', (data: QueueStatus) => {
//       console.log('Received queue_status:', data);
//       setQueueStatus(data);
//     });

//     socket.on('task_progress', (data: TaskProgress) => {
//       console.log('Received task_progress:', data);
//       setTaskProgress(data);
//       if (data.status === 'completed') {
//         setIsProcessing(false);
//         setPendingError(null);
//       }
//     });

//     socket.on('translate_result', (data: AudioText) => {
//       console.log('Received translate_result:', data);
//       setAudioText(data);
//       setIsProcessing(false);
//       setTaskProgress(null);
//       setPendingError(null);
//       if (data.audio_b64) {
//         const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
//         audio.play().catch((error) => {
//           console.error('Autoplay failed:', error);
//           setPronunciationResult({ error: 'Vui lòng tương tác với trang để bật tự động phát âm thanh.' } as PronunciationResult);
//         });
//       }
//     });

//     socket.on('pronunciation_result', (data: PronunciationResult) => {
//       console.log('Received pronunciation_result:', data);
//       setPronunciationResult(data);
//       setIsProcessing(false);
//       setTaskProgress(null);
//       setPendingError(null);
//     });

//     socket.on('error', (data: { message: string; task_id?: string }) => {
//       console.error('Socket error:', data.message);
//       if (taskProgress && taskProgress.status !== 'completed') {
//         setPendingError(data);
//       } else {
//         setPronunciationResult({ error: data.message, task_id: data.task_id } as PronunciationResult);
//         setIsProcessing(false);
//         setTaskProgress(null);
//         setPendingError(null);
//       }
//     });

//     socket.on('connect_error', (error: any) => {
//       console.error('Socket.IO connect error:', error.message);
//       setPronunciationResult({ error: 'Không thể kết nối đến server.' } as PronunciationResult);
//       setIsProcessing(false);
//     });

//     socket.on('disconnect', () => {
//       console.log('Socket.IO disconnected');
//       setIsProcessing(false);
//     });

//     return () => {
//       socket.disconnect();
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [taskProgress]);

//   // Đếm thời gian ghi âm
//   useEffect(() => {
//     if (isRecording) {
//       timerRef.current = setInterval(() => {
//         setRecordingTime((prev) => {
//           const next = prev + 1;
//           if (next >= MAX_AUDIO_DURATION) {
//             stopRecording();
//             return 0;
//           }
//           return next;
//         });
//       }, 1000);
//     }
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [isRecording]);

//   // Bắt đầu ghi âm
//   const startRecording = useCallback(
//     async (mode: 'translate' | 'pronunciation' = 'translate', originalText?: string) => {
//       if (!socketRef.current || queueStatus?.pending >= QUEUE_LIMIT) {
//         setPronunciationResult({
//           error: `Hàng đợi đầy (${queueStatus?.pending}/${QUEUE_LIMIT} yêu cầu). Vui lòng thử lại sau.`,
//         } as PronunciationResult);
//         return;
//       }

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mimeType = MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
//           ? 'audio/webm; codecs=opus'
//           : MediaRecorder.isTypeSupported('audio/ogg')
//           ? 'audio/ogg'
//           : 'audio/webm';
//         const recorder = new MediaRecorder(stream, { mimeType });
//         mediaRecorderRef.current = recorder;
//         audioChunksRef.current = [];

//         recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
//         recorder.onstop = () => handleAudioStop(mode, originalText, mimeType, stream);
//         recorder.start();
//         setIsRecording(true);
//         setRecordingMessage(mode === 'translate' ? 'Đang ghi âm để dịch...' : 'Đang ghi âm để kiểm tra phát âm...');
//         setRecordingTime(0);
//         setAudioText(null);
//         setPronunciationResult(null);
//         setTaskProgress(null);
//         setPendingError(null);
//         lastRequestRef.current = { mode, originalText };
//       } catch (error) {
//         console.error('Start recording error:', error);
//         setPronunciationResult({ error: 'Không thể truy cập micro. Vui lòng kiểm tra quyền.' } as PronunciationResult);
//       }
//     },
//     [queueStatus]
//   );

//   // Ngừng ghi âm
//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setRecordingMessage('');
//       setRecordingTime(0);
//       setIsProcessing(true);
//     }
//   }, []);

//   // Xử lý audio khi dừng
//   const handleAudioStop = (
//     mode: 'translate' | 'pronunciation',
//     originalText: string | undefined,
//     mimeType: string,
//     stream: MediaStream
//   ) => {
//     const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
//     const reader = new FileReader();
//     reader.onload = () => {
//       const result = reader.result?.toString();
//       const base64 = result?.startsWith(`data:${mimeType};base64,`) ? result.split(',')[1] : result;
//       if (base64) {
//         if (mode === 'translate') {
//           socketRef.current.emit('translate_audio', { audio: base64, mimeType });
//         } else if (mode === 'pronunciation' && originalText) {
//           socketRef.current.emit('check_pronunciation', { audio: base64, mimeType, original_text: originalText });
//         }
//       }
//     };
//     reader.readAsDataURL(audioBlob);
//     stream.getTracks().forEach((track) => track.stop());
//   };

//   // Thử lại task
//   const retryTask = useCallback(() => {
//     if (lastRequestRef.current) {
//       const { mode, originalText } = lastRequestRef.current;
//       startRecording(mode, originalText);
//     }
//   }, [startRecording]);

//   // Kiểm tra trạng thái task
//   const checkTaskStatus = useCallback(async (taskId: string) => {
//     try {
//       const response = await fetch(`http://localhost:8000/task_status/${taskId}`, {
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//       });
//       const data = await response.json();
//       setPronunciationResult({
//         error: data.error || `Task status: ${data.status}`,
//         task_id: taskId,
//       } as PronunciationResult);
//     } catch (error) {
//       console.error('Check task status error:', error);
//       setPronunciationResult({
//         error: 'Không thể kiểm tra trạng thái task.',
//         task_id: taskId,
//       } as PronunciationResult);
//     }
//   }, []);

//   return {
//     isRecording,
//     audioText,
//     pronunciationResult,
//     recordingMessage,
//     recordingTime,
//     isProcessing,
//     userId,
//     queueStatus,
//     taskProgress,
//     startRecording,
//     stopRecording,
//     retryTask,
//     checkTaskStatus,
//   };
// }