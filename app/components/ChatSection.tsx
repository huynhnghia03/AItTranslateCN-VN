// "use client";
// import { useState, useEffect, useRef } from 'react';
// import { useChat } from '../lib/useChat';
// import { useHistory } from '../lib/useHistory';
// import { Copy, Trash2, Send, RefreshCw, Mic, MicOff, X, Sparkles, Globe, MessageSquare } from 'lucide-react';

// // Enhanced TypeScript interfaces with strict typing
// interface MessageDetails {
//   original_text?: string;
//   translated_text?: string;
//   pinyin?: string;
//   explanation?: string;
//   audio?: string;
//   original_audio_b64?: string;
//   original_audio_mime_type?: string;
// }

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   details?: MessageDetails;
// }

// interface HistoryItemData {
//   original_text?: string;
//   translated_text?: string;
//   pinyin?: string;
//   explanation?: string;
//   response?: string;
//   audio?: string;
//   audio_b64?: string;
//   original_audio_b64?: string;
//   original_audio_mime_type?: string;
// }

// interface HistoryItem {
//   timestamp: string;
//   data: HistoryItemData;
// }

// export default function ChatSection() {
//   // Hooks from custom libraries
//   const {
//     chatInput,
//     setChatInput,
//     chatMessages,
//     handleChatSubmit,
//     isLoading,
//     userId,
//     isRecording,
//     startRecording,
//     stopRecording,
//     recordingMessage,
//     recordingTime,
//     isProcessing,
//     clearChatMessages,
//   } = useChat();
  
//   const { getHistoryByType, clearHistory, fetchHistory, history } = useHistory("chat");
  
//   // Component state
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(true);
//   const [showClearModal, setShowClearModal] = useState<boolean>(false);
//   const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
//   const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
//   const [animateBackground, setAnimateBackground] = useState<boolean>(false);
  
//   // Refs
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const chatContainerRef = useRef<HTMLDivElement>(null);

//   // Normalize message data and combine history with current messages
//   useEffect(() => {
//     const normalizeTimestamp = (ts: string): string => {
//       try {
//         return new Date(ts).toISOString();
//       } catch {
//         return new Date().toISOString();
//       }
//     };

//     const messageSet = new Map<string, Message>();
    
//     // Process history items
//     (history as HistoryItem[]).forEach((item) => {
//       const data = item.data;
//       const normalizedTimestamp = normalizeTimestamp(item.timestamp);
      
//       // Create user message
//       const userMsg: Message = {
//         role: 'user',
//         content: data.original_text || 'N/A',
//         timestamp: normalizedTimestamp,
//         details: {
//           original_text: data.original_text,
//           original_audio_b64: data.original_audio_b64,
//           original_audio_mime_type: data.original_audio_mime_type,
//         },
//       };
      
//       // Create assistant message
//       const assistantMsg: Message = {
//         role: 'assistant',
//         content: data.translated_text || data.response || 'No response',
//         timestamp: normalizedTimestamp,
//         details: {
//           original_text: data.original_text,
//           translated_text: data.translated_text,
//           pinyin: data.pinyin,
//           explanation: data.explanation,
//           audio: data.audio || data.audio_b64,
//           original_audio_b64: data.original_audio_b64,
//           original_audio_mime_type: data.original_audio_mime_type,
//         },
//       };
      
//       // Create unique keys for deduplication
//       const userKey = `${userMsg.role}-${userMsg.content}-${userMsg.timestamp}-${userMsg.details?.original_audio_b64 || ''}`;
//       const assistantKey = `${assistantMsg.role}-${assistantMsg.content}-${assistantMsg.timestamp}`;
      
//       messageSet.set(userKey, userMsg);
//       messageSet.set(assistantKey, assistantMsg);
//     });

//     // Process current chat messages
//     chatMessages.forEach((msg: Message) => {
//       const key = `${msg.role}-${msg.content}-${normalizeTimestamp(msg.timestamp)}-${msg.details?.original_audio_b64 || ''}`;
//       messageSet.set(key, { ...msg, timestamp: normalizeTimestamp(msg.timestamp) });
//     });

//     // Sort messages by timestamp
//     const combinedMessages = Array.from(messageSet.values()).sort(
//       (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//     );

//     setMessages(combinedMessages);
//     setShowQuickPrompts(combinedMessages.length === 0);
    
//     // Trigger background animation when new messages arrive
//     if (combinedMessages.length > 0) {
//       setAnimateBackground(true);
//       setTimeout(() => setAnimateBackground(false), 800);
//     }
//   }, [history, JSON.stringify(chatMessages)]);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, isLoading, isProcessing]);

//   // Event handlers
//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
//     if (e.key === 'Enter' && chatInput.trim() && !isLoading && !isRecording) {
//       handleChatSubmit();
//       setShowQuickPrompts(false);
//     }
//   };

//   const handleCopy = (content: string): void => {
//     navigator.clipboard.writeText(content).then(() => {
//       setCopiedMessage("Đã sao chép!");
//       setTimeout(() => setCopiedMessage(null), 2000);
//     });
//   };

//   const handleClearHistory = (): void => {
//     clearHistory("chat");
//     clearChatMessages();
//     setMessages([]);
//     setShowQuickPrompts(true);
//     setShowClearModal(false);
//   };

//   const handleRefreshHistory = (): void => {
//     fetchHistory("chat");
//   };

//   const toggleTheme = (): void => {
//     setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
//   };

//   // Quick prompt suggestions
//   const quickPrompts: string[] = [
//     '你好 (Xin chào)',
//     '今天的天气怎么样？',
//     'Dịch: 我爱你',
//     'Giải thích từ 朋友',
//   ];

//   // Determine theme classes
//   const themeClasses = {
//     background: themeMode === 'light' 
//       ? 'from-indigo-50 via-fuchsia-50 to-purple-50' 
//       : 'from-gray-900 via-indigo-950 to-purple-950',
//     text: themeMode === 'light' ? 'text-gray-800' : 'text-gray-100',
//     subtext: themeMode === 'light' ? 'text-gray-600' : 'text-gray-400',
//     header: themeMode === 'light' 
//       ? 'from-indigo-50/95 to-purple-50/95 text-indigo-800' 
//       : 'from-gray-900/95 to-indigo-950/95 text-indigo-300',
//     footer: themeMode === 'light' 
//       ? 'from-indigo-50/95 to-purple-50/95 shadow-inner' 
//       : 'from-gray-900/95 to-indigo-950/95 shadow-lg shadow-purple-900/10',
//     input: themeMode === 'light' 
//       ? 'bg-gradient-to-br from-gray-100/90 to-indigo-50/80 focus:ring-indigo-500' 
//       : 'bg-gradient-to-br from-gray-800/80 to-indigo-900/80 text-white focus:ring-purple-500',
//     userMessage: themeMode === 'light'
//       ? 'from-indigo-500 to-violet-600 text-white'
//       : 'from-violet-700 to-indigo-900 text-white',
//     assistantMessage: themeMode === 'light'
//       ? 'from-white/90 to-indigo-50/90 text-gray-800'
//       : 'from-gray-800/90 to-indigo-900/90 text-gray-100',
//     modal: themeMode === 'light'
//       ? 'from-white/95 to-indigo-50/95 text-gray-800'
//       : 'from-gray-800/95 to-indigo-900/95 text-gray-100',
//     button: themeMode === 'light'
//       ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//       : 'bg-gray-700 text-gray-200 hover:bg-gray-600',
//     deleteButton: themeMode === 'light'
//       ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
//       : 'from-red-700 to-red-800 hover:from-red-800 hover:to-red-900',
//   };

//   return (
//     <div 
//       className={`flex flex-col h-full bg-gradient-to-br ${themeClasses.background} font-sans antialiased relative`}
//     >
//       {/* Animated background effects */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div 
//           className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-purple-500/5 
//                      ${animateBackground ? 'animate-pulse' : ''} transition-all duration-1000`}
//         />
//         <div className="absolute top-0 left-0 w-full h-full">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-purple-400/10 to-transparent rounded-full filter blur-xl animate-blob" />
//           <div className="absolute top-3/4 right-1/3 w-80 h-80 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-2000" />
//           <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-radial from-fuchsia-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-4000" />
//         </div>
//       </div>

//       {/* Header */}
//       <header 
//         className={`p-4 backdrop-blur-xl bg-gradient-to-r ${themeClasses.header} border-b border-indigo-100/20 
//                   shadow-lg shadow-indigo-500/5 flex justify-between items-center sticky top-0 z-20
//                   transition-all duration-300`}
//       >
//         <div className="flex items-center space-x-3">
//           <div className="flex h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/20">
//             <Globe size={20} className="text-white" />
//           </div>
//           <h1 className="text-2xl font-bold tracking-tight flex items-center">
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">LingvoChat</span>
//             <span className="ml-2 px-2 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full text-xs font-medium uppercase tracking-wider">2025</span>
//           </h1>
//         </div>
        
//         <div className="flex gap-3">
//           <button
//             onClick={toggleTheme}
//             className="p-2 rounded-full backdrop-blur-md bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300 shadow-sm"
//             title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
//             aria-label={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
//           >
//             <Sparkles size={20} className={themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
//           </button>
//           <button
//             onClick={handleRefreshHistory}
//             className="p-2 rounded-full backdrop-blur-md bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300 shadow-sm"
//             title="Tải lại lịch sử"
//             aria-label="Tải lại lịch sử chat"
//           >
//             <RefreshCw size={20} className={themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
//           </button>
//           <button
//             onClick={() => setShowClearModal(true)}
//             className="p-2 rounded-full backdrop-blur-md bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 shadow-sm"
//             title="Xóa lịch sử"
//             aria-label="Xóa lịch sử chat"
//           >
//             <Trash2 size={20} className={themeMode === 'light' ? 'text-red-600' : 'text-red-400'} />
//           </button>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <div 
//         ref={chatContainerRef}
//         className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent scroll-smooth"
//       >
//         <div className="max-w-5xl mx-auto flex flex-col space-y-6">
//           {messages.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-center py-20">
//               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-pulse">
//                 <MessageSquare size={36} className="text-indigo-500 dark:text-purple-400" />
//               </div>
//               <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
//                 Chinese-Vietnamese Translator
//               </h2>
//               <p className={`${themeClasses.subtext} text-lg font-medium mb-8 max-w-md animate-fade-in`}>
//                 Chào bạn! Bắt đầu trò chuyện bằng cách nhập câu hỏi hoặc thử gợi ý dưới đây.
//               </p>
//               {showQuickPrompts && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
//                   {quickPrompts.map((prompt, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => {
//                         setChatInput(prompt);
//                         handleChatSubmit();
//                         setShowQuickPrompts(false);
//                       }}
//                       className="px-6 py-4 backdrop-blur-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10 
//                                 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-2xl 
//                                 hover:from-indigo-500/20 hover:to-purple-500/20 hover:scale-105 
//                                 transition-all duration-300 shadow-lg shadow-indigo-500/5"
//                       aria-label={`Thử gợi ý: ${prompt}`}
//                     >
//                       {prompt}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ) : (
//             messages.map((msg: Message, index: number) => (
//               <div
//                 key={`${msg.role}-${msg.content}-${msg.timestamp}`}
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
//               >
//                 <div
//                   className={`max-w-xs sm:max-w-lg p-5 rounded-3xl shadow-lg relative group 
//                             backdrop-blur-md border ${msg.role === 'user' ? 'border-indigo-500/20' : 'border-gray-200/20'} 
//                             ${msg.role === 'user' 
//                               ? `bg-gradient-to-br ${themeClasses.userMessage}` 
//                               : `bg-gradient-to-br ${themeClasses.assistantMessage}`} 
//                             transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
//                   role="region"
//                   aria-label={msg.role === 'user' ? 'Tin nhắn của bạn' : 'Tin nhắn từ trợ lý'}
//                 >
//                   <p className="text-xs opacity-70 mb-2">
//                     {new Date(msg.timestamp).toLocaleString('vi-VN')}
//                   </p>
//                   {msg.role === 'user' && msg.details?.original_audio_b64 ? (
//                     <div className="flex items-center gap-3">
//                       <Mic size={16} className="text-indigo-200 dark:text-purple-200" />
//                       <div className="flex-1">
//                         <p className="text-xs text-indigo-200 dark:text-purple-200 mb-1">🔊 Âm thanh gốc:</p>
//                         <div className="flex items-center gap-3">
//                           <audio
//                             controls
//                             src={`data:${msg.details.original_audio_mime_type || 'audio/webm'};base64,${msg.details.original_audio_b64}`}
//                             className="w-56 rounded-lg shadow-sm"
//                             style={{ height: '36px' }}
//                             aria-label="Phát âm thanh gốc"
//                           />
//                           {msg.content === 'Processing audio...' && (
//                             <div className="flex space-x-1">
//                               <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
//                               <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-100" />
//                               <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-200" />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="break-words text-base">{msg.content}</p>
//                   )}
                  
//                   {msg.role === 'assistant' && msg.details && (
//                     <div className="mt-1 text-sm border-t border-gray-200/20 pt-3 space-y-3">
//                       {msg.details.original_text && (
//                         <div className="transition-all duration-300 hover:bg-indigo-500/5 rounded-lg">
//                           <p><strong className="text-indigo-500 dark:text-purple-400">🇨🇳 Gốc:</strong> {msg.details.original_text}</p>
//                         </div>
//                       )}
//                       {msg.details.pinyin && (
//                         <div className="transition-all duration-300 hover:bg-indigo-500/5 rounded-lg">
//                           <p><strong className="text-indigo-500 dark:text-purple-400">🈶 Pinyin:</strong> {msg.details.pinyin}</p>
//                         </div>
//                       )}
//                       {msg.details.translated_text && (
//                         <div className="transition-all duration-300 hover:bg-indigo-500/5 rounded-lg">
//                           <p><strong className="text-indigo-500 dark:text-purple-400">🇻🇳 Dịch:</strong> {msg.details.translated_text}</p>
//                         </div>
//                       )}
//                       {msg.details.explanation && (
//                         <div className="transition-all duration-300 hover:bg-indigo-500/5 rounded-lg">
//                           <p><strong className="text-indigo-500 dark:text-purple-400">📝 Giải thích:</strong> {msg.details.explanation}</p>
//                         </div>
//                       )}
//                       {msg.details.audio && (
//                         <div className="mt-3 transition-all duration-300 hover:bg-indigo-500/5 rounded-lg">
//                           <p className="text-xs text-indigo-500 dark:text-purple-400 mb-1">🔈 Âm thanh dịch:</p>
//                           <audio
//                             controls
//                             src={`data:audio/mp3;base64,${msg.details.audio}`}
//                             className="w-64 rounded-lg shadow-sm"
//                             style={{ height: '36px' }}
//                             aria-label="Phát âm thanh dịch"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
                  
//                   <button
//                     onClick={() => handleCopy(msg.content)}
//                     className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 
//                               ${msg.role === 'user' ? 'text-indigo-200 hover:text-white dark:hover:text-purple-200' : 'text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400'} 
//                               transition-all duration-300 transform hover:scale-110`}
//                     title="Sao chép nội dung"
//                     aria-label="Sao chép nội dung tin nhắn"
//                   >
//                     <Copy size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
          
//           {isLoading && (
//             <div className="flex justify-start animate-fade-in">
//               <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-indigo-500/20">
//                 <div className="flex space-x-2">
//                   <div className="w-3 h-3 bg-indigo-500 dark:bg-purple-600 rounded-full animate-pulse" />
//                   <div className="w-3 h-3 bg-indigo-600 dark:bg-purple-700 rounded-full animate-pulse delay-150" />
//                   <div className="w-3 h-3 bg-purple-600 dark:bg-purple-800 rounded-full animate-pulse delay-300" />
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {isProcessing && (
//             <div className="flex justify-start animate-fade-in">
//               <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-indigo-500/20">
//                 <div className="flex items-center gap-3">
//                   <div className="relative w-6 h-6">
//                     <div className="absolute inset-0 border-2 border-indigo-500 dark:border-purple-600 border-t-transparent rounded-full animate-spin" />
//                   </div>
//                   <p className={`${themeClasses.subtext} text-sm`}>Processing audio...</p>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input Area */}
//       <footer 
//         className={`p-5 backdrop-blur-xl bg-gradient-to-r ${themeClasses.footer} border-t border-indigo-100/20 
//                   flex items-center gap-4 sticky bottom-0 z-10 transition-all duration-300`}
//       >
//         <div className="flex-1 relative group">
//           <input
//             value={chatInput}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Nhập tiếng Trung hoặc tiếng Việt..."
//             className={`w-full py-4 px-6 ${themeClasses.input} rounded-full focus:outline-none focus:ring-2 
//                       transition-all duration-300 text-base shadow-inner`}
//             disabled={isLoading || isRecording}
//             aria-label="Nhập tin nhắn"
//           />
//           <div className="absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-md animate-gradient-x"></div>
//         </div>
        
//         <button
//           onClick={() => {
//             if (chatInput.trim() && !isLoading && !isRecording) {
//               handleChatSubmit();
//               setShowQuickPrompts(false);
//             }
//           }}
//           className={`p-4 rounded-full ${
//             isLoading || isRecording || !chatInput.trim()
//               ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
//               : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
//           } text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}
//           disabled={isLoading || isRecording || !chatInput.trim()}
//           title="Gửi tin nhắn"
//           aria-label="Gửi tin nhắn"
//         >
//           <Send size={20} />
//         </button>
        
//         <button
//           onClick={isRecording ? stopRecording : startRecording}
//           className={`p-4 rounded-full ${
//             isRecording
//               ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
//               : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
//           } text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}
//           disabled={isLoading || isProcessing}
//           title={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
//           aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
//         >
//           {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
//         </button>
//       </footer>

//       {/* Floating Notifications */}
//       {(recordingMessage || copiedMessage) && (
//         <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 
//                       bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white 
//                       px-6 py-3 rounded-xl shadow-xl z-50 animate-bounce-in 
//                       backdrop-blur-md border border-indigo-500/30">
//           <p className="flex items-center gap-2">
//             {recordingMessage ? 
//               <>
//                 <Mic size={16} className="text-red-400" />
//                 {`${recordingMessage} ${isRecording ? `(${recordingTime}s)` : ''}`}
//               </> : 
//               <>
//                 <Copy size={16} className="text-green-400" />
//                 {copiedMessage}
//               </>
//             }
//           </p>
//         </div>
//       )}

//       {/* Clear History Modal */}
//       {showClearModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
//           <div 
//             className={`bg-gradient-to-br ${themeClasses.modal} rounded-3xl p-8 max-w-md w-full shadow-2xl
//                       border border-indigo-500/20 animate-scale-in`}
//             role="dialog"
//             aria-labelledby="clear-history-title"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h2 id="clear-history-title" className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
//                 Xóa lịch sử chat
//               </h2>
//               <button
//                 onClick={() => setShowClearModal(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
//                 title="Đóng"
//                 aria-label="Đóng hộp thoại"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <p className={`${themeClasses.subtext} mb-8`}>
//               Bạn có chắc muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.
//             </p>
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={() => setShowClearModal(false)}
//                 className={`px-5 py-3 ${themeClasses.button} rounded-xl transition-all duration-300 transform hover:scale-105`}
//                 aria-label="Hủy xóa lịch sử"
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={handleClearHistory}
//                 className={`px-5 py-3 bg-gradient-to-r ${themeClasses.deleteButton} text-white rounded-xl transition-all duration-300 transform hover:scale-105`}
//                 aria-label="Xác nhận xóa lịch sử"
//               >
//                 Xóa
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
    
//     </div>
//   );
// }
//component/ChatSection.tsx
"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../lib/useChat';
import { useHistory } from '../lib/useHistory';
import { Globe, Moon, Sun, RefreshCw, Trash2, Send, Mic, MicOff, X, Menu, MessageSquare, User, Bot, Copy } from 'lucide-react';

// Enhanced TypeScript interfaces
interface MessageDetails {
  original_text?: string;
  translated_text?: string;
  pinyin?: string;
  explanation?: string;
  audio?: string;
  audio_b64?: string;
  original_audio_b64?: string;
  original_audio_mime_type?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  details?: MessageDetails;
}

interface HistoryItemData {
  original_text?: string;
  translated_text?: string;
  pinyin?: string;
  explanation?: string;
  response?: string;
  audio?: string;
  audio_b64?: string;
  original_audio_b64?: string;
  original_audio_mime_type?: string;
}

interface HistoryItem {
  timestamp: string;
  data: HistoryItemData;
}

export default function ChatSection() {
  // Hooks from custom libraries
  const {
    chatInput,
    setChatInput,
    chatMessages,
    handleChatSubmit,
    isLoading,
    userId,
    isRecording,
    startRecording,
    stopRecording,
    recordingMessage,
    recordingTime,
    isProcessing,
    clearChatMessages,
  } = useChat();
  
  const { getHistoryByType, clearHistory, fetchHistory, history } = useHistory("chat");
  
  // Component state
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(true);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState('light');
  const [animateBackground, setAnimateBackground] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize and combine messages with memoization
  const combinedMessages = useMemo(() => {
    const normalizeTimestamp = (ts: string): string => {
      try {
        return new Date(ts).toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    const messageSet = new Map<string, Message>();
    
    // Process history items
    (history || []).forEach((item: HistoryItem) => {
      const data = item.data;
      const normalizedTimestamp = normalizeTimestamp(item.timestamp);
      
      // Create user message
      const userMsg: Message = {
        role: 'user',
        content: data.original_text || 'N/A',
        timestamp: normalizedTimestamp,
        details: {
          original_text: data.original_text,
          original_audio_b64: data.original_audio_b64,
          original_audio_mime_type: data.original_audio_mime_type,
        },
      };
      
      // Create assistant message
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.translated_text || data.response || 'No response',
        timestamp: normalizedTimestamp,
        details: {
          original_text: data.original_text,
          translated_text: data.translated_text,
          pinyin: data.pinyin,
          explanation: data.explanation,
          audio: data.audio || data.audio_b64,
          original_audio_b64: data.original_audio_b64,
          original_audio_mime_type: data.original_audio_mime_type,
        },
      };
      
      // Create unique keys for deduplication
      const userKey = `${userMsg.role}-${userMsg.content}-${userMsg.timestamp}-${userMsg.details?.original_audio_b64 || ''}`;
      const assistantKey = `${assistantMsg.role}-${assistantMsg.content}-${assistantMsg.timestamp}`;
      
      messageSet.set(userKey, userMsg);
      messageSet.set(assistantKey, assistantMsg);
    });

    // Process current chat messages
    (chatMessages || []).forEach((msg: Message) => {
      const key = `${msg.role}-${msg.content}-${normalizeTimestamp(msg.timestamp)}-${msg.details?.original_audio_b64 || ''}`;
      messageSet.set(key, { ...msg, timestamp: normalizeTimestamp(msg.timestamp) });
    });

    // Sort messages by timestamp
    return Array.from(messageSet.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [history, chatMessages]);

  // Update messages and UI state
  useEffect(() => {
    setMessages(combinedMessages);
    setShowQuickPrompts(combinedMessages.length === 0);
    
    // Trigger background animation
    if (combinedMessages.length > 0) {
      setAnimateBackground(true);
      setTimeout(() => setAnimateBackground(false), 800);
    }
  }, [combinedMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isProcessing]);

  // Set up theme based on user preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('lingvoChat-theme') || 'system';
    if (savedTheme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(isDarkMode ? 'dark' : 'light');
    } else {
      setThemeMode(savedTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('lingvoChat-theme') === 'system') {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Event handlers
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && chatInput.trim() && !isLoading && !isRecording) {
      handleChatSubmit();
      setShowQuickPrompts(false);
    }
  };

  const handleCopy = (content: string): void => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessage("Đã sao chép!");
      setTimeout(() => setCopiedMessage(null), 2000);
    });
  };

  const handleClearHistory = (): void => {
    clearHistory("chat");
    clearChatMessages();
    setMessages([]);
    setShowQuickPrompts(true);
    setShowClearModal(false);
  };

  const handleRefreshHistory = (): void => {
    fetchHistory("chat");
  };

  const toggleTheme = (): void => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('lingvoChat-theme', newTheme);
  };

  const focusInput = (): void => {
    inputRef.current?.focus();
  };

  // Quick prompt suggestions
  // const quickPrompts: string[] = [
  //   '你好 (Xin chào)',
  //   '今天的天气怎么样？',
  //   'Dịch: 我爱你',
  //   'Giải thích từ 朋友',
  // ];

  // Theme classes
  const themeClasses = {
    background: themeMode === 'light' 
      ? 'from-slate-50 via-purple-50/30 to-blue-50/40' 
      : 'from-slate-950 via-purple-950/40 to-blue-950/50',
    text: themeMode === 'light' ? 'text-slate-800' : 'text-slate-100',
    subtext: themeMode === 'light' ? 'text-slate-600' : 'text-white',
    header: themeMode === 'light' 
      ? 'bg-white/80 shadow-lg shadow-purple-200/20 border-b border-slate-200' 
      : 'bg-slate-900/80 shadow-lg shadow-purple-950/30 border-b border-slate-800',
    footer: themeMode === 'light' 
      ? 'bg-white/80 border-t border-slate-200' 
      : 'bg-slate-900/80 border-t border-slate-800',
    input: themeMode === 'light' 
      ? 'bg-white focus:ring-purple-500 border border-slate-200' 
      : 'bg-slate-800 focus:ring-purple-400 border border-slate-700 text-white',
    userMessage: themeMode === 'light'
      ? 'from-purple-500 to-blue-600 text-white'
      : 'from-purple-600 to-blue-800 text-white',
    assistantMessage: themeMode === 'light'
      ? 'from-white to-slate-50 text-slate-800 border border-slate-200'
      : 'from-slate-800 to-slate-900 text-slate-100 border border-slate-700',
    modal: themeMode === 'light'
      ? 'bg-white text-slate-800 border border-slate-200'
      : 'bg-slate-900 text-slate-100 border border-slate-700',
    button: themeMode === 'light'
      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
    accent: themeMode === 'light'
      ? 'from-purple-500 to-blue-600'
      : 'from-purple-600 to-blue-700',
    accentHover: themeMode === 'light'
      ? 'from-purple-600 to-blue-700'
      : 'from-purple-700 to-blue-800',
    deleteButton: themeMode === 'light'
      ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
      : 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
    blur: themeMode === 'light'
      ? 'backdrop-blur-xl'
      : 'backdrop-blur-xl',
    ring: themeMode === 'light'
      ? 'ring-purple-500/30'
      : 'ring-purple-500/20',
    audioPlayer: themeMode === 'light'
      ? 'accent-purple-500'
      : 'accent-purple-600',
  };

  return (
    <div 
      className={`flex flex-col h-full bg-gradient-to-br ${themeClasses.background} font-sans antialiased relative overflow-hidden`}
    >
      {/* Glass morphism background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 
                     ${animateBackground ? 'animate-pulse' : ''} transition-all duration-1000`}
        />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full filter blur-3xl opacity-20 bg-purple-400 animate-blob" />
          <div className="absolute top-3/4 right-1/3 w-80 h-80 rounded-full filter blur-3xl opacity-20 bg-blue-400 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full filter blur-3xl opacity-20 bg-indigo-400 animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Header */}
      <header 
        className={`py-3 px-4 sm:px-6 ${themeClasses.blur} ${themeClasses.header} flex justify-between items-center sticky top-0 z-10 transition-all duration-300`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 rounded-full bg-gradient-to-br ${themeClasses.accent} items-center justify-center shadow-lg shadow-purple-500/20">
          <Globe size={20} className="text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeClasses.accent}`}>LingvoChat</span>
            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full text-xs font-medium uppercase tracking-wider hidden sm:inline-flex">2025</span>
          </h1>
        </div>
        
        {/* Desktop buttons */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 shadow-sm"
            title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          >
            {themeMode === 'light' ? (
              <Moon size={20} className="text-purple-600" />
            ) : (
              <Sun size={20} className="text-purple-400" />
            )}
          </button>
          <button
            onClick={handleRefreshHistory}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 shadow-sm"
            title="Tải lại lịch sử"
            aria-label="Tải lại lịch sử chat"
          >
            <RefreshCw size={20} className={themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'} />
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 shadow-sm"
            title="Xóa lịch sử"
            aria-label="Xóa lịch sử chat"
          >
            <Trash2 size={20} className={themeMode === 'light' ? 'text-red-600' : 'text-red-400'} />
          </button>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 shadow-sm md:hidden"
          aria-label={showMobileMenu ? 'Đóng menu' : 'Mở menu'}
        >
          {showMobileMenu ? (
            <X size={20} className={themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'} />
          ) : (
            <Menu size={20} className={themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'} />
          )}
        </button>
      </header>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className={`${themeClasses.blur} ${themeClasses.header} py-3 px-4 flex justify-around md:hidden z-20 animate-fade-down`}>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 shadow-sm flex flex-col items-center gap-1"
            title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          >
            {themeMode === 'light' ? (
              <Moon size={18} className="text-purple-600" />
            ) : (
              <Sun size={18} className="text-purple-400" />
            )}
            <span className="text-xs">{themeMode === 'light' ? 'Tối' : 'Sáng'}</span>
          </button>
          <button
            onClick={handleRefreshHistory}
            className="p-3 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 shadow-sm flex flex-col items-center gap-1"
            title="Tải lại lịch sử"
            aria-label="Tải lại lịch sử chat"
          >
            <RefreshCw size={18} className={themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'} />
            <span className="text-xs">Làm mới</span>
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 shadow-sm flex flex-col items-center gap-1"
            title="Xóa lịch sử"
            aria-label="Xóa lịch sử chat"
          >
            <Trash2 size={18} className={themeMode === 'light' ? 'text-red-600' : 'text-red-400'} />
            <span className="text-xs">Xóa hết</span>
          </button>
          <button
            onClick={focusInput}
            className="p-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300 shadow-sm flex flex-col items-center gap-1"
            title="Nhập tin nhắn"
            aria-label="Tập trung vào ô nhập tin nhắn"
          >
            <MessageSquare size={18} className={themeMode === 'light' ? 'text-blue-600' : 'text-blue-400'} />
            <span className="text-xs">Nhập</span>
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent scroll-smooth"
      >
        <div className="max-w-5xl mx-auto flex flex-col space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare size={32} className="text-purple-500 dark:text-purple-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${themeClasses.accent}">
                Chinese-Vietnamese Translator
              </h2>
              <p className={`${themeClasses.subtext} text-base sm:text-lg font-medium mb-6 sm:mb-8 max-w-md animate-fade-in`}>
                Chào bạn! Bắt đầu trò chuyện bằng cách nhập câu hỏi dưới đây.
              </p>
              {/* {showQuickPrompts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full px-4 sm:px-0">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(prompt);
                        handleChatSubmit();
                        setShowQuickPrompts(false);
                      }}
                      className={`px-4 py-3 sm:px-6 sm:py-4 ${themeClasses.blur} bg-gradient-to-br from-purple-500/10 to-blue-500/10 
                                border border-purple-500/20 ${themeMode === 'light' ? 'text-purple-700' : 'text-white'} rounded-xl 
                                hover:from-purple-500/20 hover:to-blue-500/20 hover:scale-105 
                                transition-all duration-300 shadow-lg shadow-purple-500/5`}
                      aria-label={`Thử gợi ý: ${prompt}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )} */}
            </div>
          ) : (
            messages.map((msg: Message, index: number) => (
              <div
                key={`${msg.role}-${msg.content}-${msg.timestamp}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
              >
                <div
                  className={`max-w-xs sm:max-w-md md:max-w-lg p-4 sm:p-5 rounded-2xl shadow-lg relative group 
                            ${themeClasses.blur} ${msg.role === 'user' 
                              ? `bg-gradient-to-br ${themeClasses.userMessage}` 
                              : `bg-gradient-to-br ${themeClasses.assistantMessage}`} 
                            transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
                  role="region"
                  aria-label={msg.role === 'user' ? 'Tin nhắn của bạn' : 'Tin nhắn từ trợ lý'}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {msg.role === 'user' ? (
                        <User size={14} className="text-white opacity-70" />
                      ) : (
                        <Bot size={14} className={themeMode === 'light' ? 'text-purple-500' : 'text-purple-400'} />
                      )}
                      <p className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className={`opacity-0 group-hover:opacity-100 
                                ${msg.role === 'user' ? 'text-white/70 hover:text-white' : `${themeMode === 'light' ? 'text-slate-400 hover:text-purple-600' : 'text-slate-400 hover:text-purple-400'}`} 
                                transition-all duration-300 transform hover:scale-110 p-1 rounded-full hover:bg-white/10`}
                      title="Sao chép nội dung"
                      aria-label="Sao chép nội dung tin nhắn"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  
                  {msg.role === 'user' && msg.details?.original_audio_b64 ? (
                    <div className="flex items-center gap-3">
                      <Mic size={16} className="text-white/80" />
                      <div className="flex-1">
                        <p className="text-xs text-white/80 mb-1">🔊 Âm thanh gốc:</p>
                        <div className="flex items-center gap-3">
                          {msg.details.original_audio_b64 ? (
                            <audio
                              controls
                              src={`data:${msg.details.original_audio_mime_type || 'audio/webm'};base64,${msg.details.original_audio_b64}`}
                              className={`w-56 rounded-lg shadow-sm ${themeClasses.audioPlayer}`}
                              style={{ height: '36px' }}
                              aria-label="Phát âm thanh gốc"
                            />
                          ) : (
                            <p className="text-xs text-red-400">Không thể tải âm thanh</p>
                          )}
                          {msg.content === 'Processing audio...' && (
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse delay-100" />
                              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse delay-200" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="break-words text-base">{msg.content}</p>
                  )}
                  
                  {msg.role === 'assistant' && msg.details && (
                    <div className="mt-3 text-sm border-t border-slate-200/20 dark:border-slate-700/30 pt-3 space-y-3">
                      {msg.details.original_text && (
                        <div className="transition-all duration-300 hover:bg-purple-500/5 rounded-lg p-1">
                          <p><strong className={themeMode === 'light' ? 'text-purple-500' : 'text-purple-400'}>🇨🇳 Gốc:</strong> {msg.details.original_text}</p>
                        </div>
                      )}
                      {msg.details.pinyin && (
                        <div className="transition-all duration-300 hover:bg-purple-500/5 rounded-lg p-1">
                          <p><strong className={themeMode === 'light' ? 'text-purple-500' : 'text-purple-400'}>🈶 Pinyin:</strong> {msg.details.pinyin}</p>
                        </div>
                      )}
                      {msg.details.translated_text && (
                        <div className="transition-all duration-300 hover:bg-purple-500/5 rounded-lg p-1">
                          <p><strong className={themeMode === 'light' ? 'text-purple-500' : 'text-purple-400'}>🇻🇳 Dịch:</strong> {msg.details.translated_text}</p>
                        </div>
                      )}
                      {/* {msg.details.explication && (
                        <div className="transition-all duration-300 hover:bg-purple-500/5 rounded-lg p-1">
                          <p><strong className={themeMode === 'light' ? 'text-purple-500' : 'text-purple-400'}>📝 Giải thích:</strong> {msg.details.explanation}</p>
                        </div>
                      )} */}
                      {msg.details.audio && (
                        <div className="mt-2 transition-all duration-300 hover:bg-purple-500/5 rounded-lg p-1">
                          <p className="text-xs text-purple-500 dark:text-purple-400 mb-1">🔈 Âm thanh dịch:</p>
                          {msg.details.audio ? (
   <audio
        controls
        src={`data:audio/mp3;base64,${msg.details.audio}`} // Thêm prefix data URL
        className={`w-full max-w-xs rounded-lg shadow-sm ${themeClasses.audioPlayer}`}
        style={{ height: '36px' }}
      
        aria-label="Phát âm thanh dịch"
        onError={(e) => {
          console.error('Audio error:', e);
          // console.log('Audio base64 length:', msg.details.audio?.length);
        }}
      />
                          ) : (
                            <p className="text-xs text-red-400">Không thể tải âm thanh</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className={`${themeClasses.blur} bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-500/20`}>
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-500 dark:bg-purple-600 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-purple-600 dark:bg-purple-700 rounded-full animate-bounce delay-150" />
                    <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-700 rounded-full animate-bounce delay-300" />
                  </div>
                  <p className={`${themeClasses.subtext} text-sm`}>Đang trả lời...</p>
                </div>
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex justify-start animate-fade-in">
              <div className={`${themeClasses.blur} bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-500/20`}>
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 border-2 border-purple-500 dark:border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className={`${themeClasses.subtext} text-sm`}>Processing audio...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <footer 
        className={`p-4 sm:p-5 ${themeClasses.blur} ${themeClasses.footer} sticky bottom-0 z-10 transition-all duration-300`}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3 sm:gap-4">
          <div className={`flex-1 relative rounded-full shadow-lg ${inputFocused ? `ring-2 ${themeClasses.ring}` : ''} transition-all duration-300 group`}>
            <input
              ref={inputRef}
              value={chatInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Nhập tiếng Trung hoặc tiếng Việt..."
              className={`w-full py-3 px-5 sm:py-4 sm:px-6 ${themeClasses.input} rounded-full focus:outline-none text-base shadow-inner disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isLoading || isRecording}
              aria-label="Nhập tin nhắn"
            />
            <div className="absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-md animate-gradient-x"></div>
          </div>
          
          <button
            onClick={() => {
              if (chatInput.trim() && !isLoading && !isRecording) {
                handleChatSubmit();
                setShowQuickPrompts(false);
              }
            }}
            className={`p-3 sm:p-4 rounded-full ${
              isLoading || isRecording || !chatInput.trim()
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : `bg-gradient-to-r ${themeClasses.accent} hover:${themeClasses.accentHover}`
            } text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}
            disabled={isLoading || isRecording || !chatInput.trim()}
            title="Gửi tin nhắn"
            aria-label="Gửi tin nhắn"
          >
            <Send size={20} />
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 sm:p-4 rounded-full ${
              isRecording
                ? `bg-gradient-to-r ${themeClasses.deleteButton} animate-pulse`
                : `bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`
            } text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}
            disabled={isLoading || isProcessing}
            title={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
            aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </footer>

      {/* Floating Notifications */}
      {(recordingMessage || copiedMessage) && (
        <div className={`fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 
                        ${themeClasses.blur} bg-gradient-to-r ${themeClasses.accent} text-white 
                        px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-xl z-50 animate-bounce-in 
                        border border-purple-500/30 max-w-xs sm:max-w-sm w-full text-center`}
        >
          <p className="flex items-center justify-center gap-2 text-sm">
            {recordingMessage ? (
              <>
                <Mic size={16} className="text-white" />
                {`${recordingMessage} ${isRecording ? `(${recordingTime}s)` : ''}`}
              </>
            ) : (
              <>
                <Copy size={16} className="text-white" />
                {copiedMessage}
              </>
            )}
          </p>
        </div>
      )}

      {/* Clear History Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div 
            className={`${themeClasses.modal} ${themeClasses.blur} rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in`}
            role="dialog"
            aria-labelledby="clear-history-title"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 id="clear-history-title" className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r ${themeClasses.accent}">
                Xóa lịch sử chat
              </h2>
              <button
                onClick={() => setShowClearModal(false)}
                className={`p-2 rounded-full hover:bg-${themeMode === 'light' ? 'slate-100' : 'slate-800'} transition-all duration-300`}
                title="Đóng"
                aria-label="Đóng hộp thoại"
              >
                <X size={20} className={themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} />
              </button>
            </div>
            <p className={`${themeClasses.subtext} mb-6 sm:mb-8 text-sm sm:text-base`}>
              Bạn có chắc muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowClearModal(false)}
                className={`px-4 sm:px-5 py-2 sm:py-3 ${themeClasses.button} rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base`}
                aria-label="Hủy xóa lịch sử"
              >
                Hủy
              </button>
              <button
                onClick={handleClearHistory}
                className={`px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r ${themeClasses.deleteButton} text-white rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base`}
                aria-label="Xác nhận xóa lịch sử"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}