// 'use client';

// import { useState, useRef } from 'react';
// import { toast } from 'react-toastify';
// import Cookies from 'js-cookie';
// import { Upload, Loader2, Trash2, Download, FileVideo } from 'lucide-react';
// import { useHistory } from '../lib/useHistory';

// interface TranslationOptions {
//   vietnameseDub: boolean;
//   pinyin: boolean;
//   subtitles: boolean;
// }

// interface HistoryItem {
//   id: number;
//   timestamp: string;
//   data: {
//     file_name: string;
//     translated_file_name: string;
//     options?: {
//       dubbing_vi?: boolean;
//       pinyin?: boolean;
//       subtitle_vi?: boolean;
//     };
//   };
// }

// export default function VideoSection() {
//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [options, setOptions] = useState<TranslationOptions>({
//     vietnameseDub: false,
//     pinyin: false,
//     subtitles: false,
//   });
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [progress, setProgress] = useState<number>(0);
//   const [isDragging, setIsDragging] = useState<boolean>(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { getHistoryByType, clearHistory, fetchHistory } = useHistory('video_translate');
//   const history: HistoryItem[] = getHistoryByType('video_translate');

//   const supportedFormats: string[] = ['video/mp4', 'video/avi', 'video/x-matroska', 'video/quicktime'];

//   const handleFileChange = (file: File | null) => {
//     if (!file) return;

//     if (!supportedFormats.includes(file.type)) {
//       toast.error('Chỉ hỗ trợ file .mp4, .avi, .mkv, .mov!');
//       return;
//     }

//     setVideoFile(file);
//     setVideoUrl(URL.createObjectURL(file));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     handleFileChange(file);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files?.[0] || null;
//     handleFileChange(file);
//   };

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragging(false);
//   };

//   const handleOptionChange = (option: keyof TranslationOptions) => {
//     setOptions((prev) => ({
//       ...prev,
//       [option]: !prev[option],
//     }));
//   };

//   const handleProcessVideo = async () => {
//     if (!videoFile) {
//       toast.error('Vui lòng chọn file video!');
//       return;
//     }

//     if (!options.vietnameseDub && !options.pinyin && !options.subtitles) {
//       toast.error('Vui lòng chọn ít nhất một tùy chọn (lồng tiếng, pinyin, phụ đề)!');
//       return;
//     }

//     setIsProcessing(true);
//     setProgress(0);

//     try {
//       const token = Cookies.get('token');
//       if (!token) {
//         throw new Error('Vui lòng đăng nhập');
//       }

//       const formData = new FormData();
//       formData.append('file', videoFile);

//       const optionsData = {
//         dubbing_vi: options.vietnameseDub,
//         pinyin: options.pinyin,
//         subtitle_vi: options.subtitles,
//       };
//       const queryParams = new URLSearchParams(optionsData as any).toString();
//       const url = `http://localhost:8004/translate_video?${queryParams}`;

//       const progressInterval = setInterval(() => {
//         setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//       }, 500);

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       clearInterval(progressInterval);
//       setProgress(100);

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Xử lý video thất bại');
//       }

//       const data = await response.json();
//       const { translated_file_name } = data;

//       const downloadResponse = await fetch(
//         `http://localhost:8004/download/${encodeURIComponent(translated_file_name)}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!downloadResponse.ok) {
//         throw new Error('Tải video thất bại');
//       }

//       const blob = await downloadResponse.blob();
//       const urlBlob = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = urlBlob;
//       a.download = translated_file_name;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(urlBlob);

//       await fetchHistory('video_translate');
//       toast.success('Dịch video thành công!');
//     } catch (error: any) {
//       toast.error(`Dịch video thất bại: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//       setProgress(0);
//     }
//   };

//   const handleDeleteHistory = async (historyId: number) => {
//     try {
//       const token = Cookies.get('token');
//       if (!token) {
//         throw new Error('Vui lòng đăng nhập');
//       }

//       const response = await fetch(`http://localhost:8007/history/${historyId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Xóa lịch sử thất bại');
//       }

//       await fetchHistory('video_translate');
//       toast.success('Xóa lịch sử thành công!');
//     } catch (error: any) {
//       toast.error(`Xóa lịch sử thất bại: ${error.message}`);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg min-h-screen overflow-y-auto max-h-80 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Dịch Video (ZH → VI)</h2>

//       <div
//         className={`relative border-2 border-dashed rounded-xl p-8 mb-6 transition-colors ${
//           isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
//         }`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <input
//           type="file"
//           accept=".mp4,.avi,.mkv,.mov"
//           onChange={handleInputChange}
//           className="hidden"
//           ref={fileInputRef}
//           disabled={isProcessing}
//         />
//         <div className="text-center">
//           <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
//           <p className="mt-2 text-sm text-gray-600">
//             Kéo và thả video hoặc{' '}
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="text-blue-600 hover:underline focus:outline-none"
//               disabled={isProcessing}
//             >
//               chọn file
//             </button>
//           </p>
//           <p className="text-xs text-gray-500 mt-1">Hỗ trợ: .mp4, .avi, .mkv, .mov (Tối đa 2GB)</p>
//         </div>
//       </div>

//       {videoUrl && (
//         <div className="mb-6">
//           <div className="relative w-full" style={{ maxHeight: '400px' }}>
//             <video
//               src={videoUrl}
//               controls
//               className="w-full rounded-xl shadow-md object-contain"
//               style={{ maxHeight: '400px' }}
//             />
//           </div>
//           <p className="text-sm text-gray-600 mt-2">Video: {videoFile?.name}</p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//         {[
//           { key: 'vietnameseDub', label: 'Lồng tiếng Việt' },
//           { key: 'pinyin', label: 'Pinyin' },
//           { key: 'subtitles', label: 'Phụ đề' },
//         ].map(({ key, label }) => (
//           <label
//             key={key}
//             className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
//           >
//             <input
//               type="checkbox"
//               checked={options[key as keyof TranslationOptions]}
//               onChange={() => handleOptionChange(key as keyof TranslationOptions)}
//               className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
//               disabled={isProcessing}
//             />
//             <span className="text-gray-700">{label}</span>
//           </label>
//         ))}
//       </div>

//       {isProcessing && (
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-600">Đang xử lý video...</span>
//             <span className="text-sm text-gray-600">{progress}%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={handleProcessVideo}
//         disabled={!videoFile || isProcessing}
//         className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
//           videoFile && !isProcessing
//             ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
//             : 'bg-gray-400 cursor-not-allowed'
//         }`}
//       >
//         {isProcessing && <Loader2 className="animate-spin h-5 w-5" />}
//         <span>{isProcessing ? 'Đang xử lý...' : 'Bắt đầu xử lý'}</span>
//       </button>

//       <div className="mt-8">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-semibold text-gray-800">Lịch sử dịch video</h3>
//           <button
//             type="button"
//             onClick={() => clearHistory('video_translate')}
//             className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition focus:ring-4 focus:ring-red-300"
//           >
//             <Trash2 className="h-5 w-5" />
//             <span>Xóa tất cả lịch sử</span>
//           </button>
//         </div>
//         <div className="max-h-80 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//           {history.length > 0 ? (
//             history.map((item) => (
//               <div key={item.id} className="p-4 bg-gray-50 rounded-xl shadow-sm">
//                 <p className="text-xs text-gray-500 mb-1">
//                   {new Date(item.timestamp).toLocaleString('vi-VN')}
//                 </p>
//                 <p className="text-sm">
//                   <strong>File gốc:</strong> {item.data.file_name}
//                 </p>
//                 <p className="text-sm">
//                   <strong>File dịch:</strong> {item.data.translated_file_name}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Tùy chọn:</strong>{' '}
//                   {[
//                     item.data.options?.dubbing_vi && 'Lồng tiếng Việt',
//                     item.data.options?.pinyin && 'Pinyin',
//                     item.data.options?.subtitle_vi && 'Phụ đề',
//                   ]
//                     .filter(Boolean)
//                     .join(', ') || 'Không có'}
//                 </p>
//                 <div className="flex gap-4 mt-2">
//                   <a
//                     href={`http://localhost:8004/download/${encodeURIComponent(item.data.translated_file_name)}`}
//                     className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm focus:outline-none"
//                     onClick={async (e) => {
//                       e.preventDefault();
//                       const token = Cookies.get('token');
//                       if (!token) {
//                         toast.error('Vui lòng đăng nhập');
//                         return;
//                       }
//                       try {
//                         const response = await fetch(e.currentTarget.href, {
//                           headers: { Authorization: `Bearer ${token}` },
//                         });
//                         if (response.ok) {
//                           const blob = await response.blob();
//                           const url = window.URL.createObjectURL(blob);
//                           const a = document.createElement('a');
//                           a.href = url;
//                           a.download = item.data.translated_file_name;
//                           document.body.appendChild(a);
//                           a.click();
//                           document.body.removeChild(a);
//                           window.URL.revokeObjectURL(url);
//                         } else {
//                           toast.error('Tải file thất bại');
//                         }
//                       } catch (error: any) {
//                         toast.error(`Tải file thất bại: ${error.message}`);
//                       }
//                     }}
//                   >
//                     <Download className="h-4 w-4" />
//                     <span>Tải xuống</span>
//                   </a>
//                   <button
//                     type="button"
//                     onClick={() => handleDeleteHistory(item.id)}
//                     className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm focus:outline-none"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                     <span>Xóa</span>
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-600 text-center py-4">Chưa có lịch sử dịch video.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { 
  Upload, 
  Loader2, 
  Trash2, 
  Download, 
  FileVideo, 
  Sparkles, 
  ChevronDown, 
  Clock, 
  Settings, 
  RotateCcw,
  CheckCircle2,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { useHistory } from '../lib/useHistory';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationOptions {
  vietnameseDub: boolean;
  pinyin: boolean;
  subtitles: boolean;
}

interface HistoryItem {
  id: number;
  timestamp: string;
  data: {
    file_name: string;
    translated_file_name: string;
    options?: {
      dubbing_vi?: boolean;
      pinyin?: boolean;
      subtitle_vi?: boolean;
      extract_chinese_srt?: boolean;
      extract_vietnamese_srt?: boolean;
    };
  };
}
// 1. Thêm vào interface TranslationOptions
interface TranslationOptions {
  vietnameseDub: boolean;
  pinyin: boolean;
  subtitles: boolean;
  extractChineseSrt: boolean;  // Thêm mới
  extractVietnameseSrt: boolean;  // Thêm mới
}

export default function VideoSection() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<TranslationOptions>({
    vietnameseDub: false,
    pinyin: false,
    subtitles: false,
     extractChineseSrt: false,  // Thêm mới
  extractVietnameseSrt: false,  // Thêm mới
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getHistoryByType, clearHistory, fetchHistory } = useHistory('video_translate');
  const history: HistoryItem[] = getHistoryByType('video_translate');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Auto-detect system preference for theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeMode('dark');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeMode(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const supportedFormats: string[] = ['video/mp4', 'video/avi', 'video/x-matroska', 'video/quicktime'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!supportedFormats.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file .mp4, .avi, .mkv, .mov!', {
        position: 'bottom-right',
        theme: themeMode
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File vượt quá 2GB!', {
        position: 'bottom-right',
        theme: themeMode
      });
      return;
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleOptionChange = (option: keyof TranslationOptions) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const resetVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
  };

  const handleProcessVideo = async () => {
    if (!videoFile) {
      toast.error('Vui lòng chọn file video!', {
        position: 'bottom-right',
        theme: themeMode
      });
      return;
    }

    if (!options.vietnameseDub && !options.pinyin && !options.subtitles) {
      toast.error('Vui lòng chọn ít nhất một tùy chọn (lồng tiếng, pinyin, phụ đề)!', {
        position: 'bottom-right',
        theme: themeMode
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Vui lòng đăng nhập');
        }

        const formData = new FormData();
        formData.append('file', videoFile);

        const optionsData = {
  dubbing_vi: options.vietnameseDub,
  pinyin: options.pinyin,
  subtitle_vi: options.subtitles,
  extract_chinese_srt: options.extractChineseSrt,  // Thêm mới
  extract_vietnamese_srt: options.extractVietnameseSrt,  // Thêm mới
};
        const queryParams = new URLSearchParams(optionsData as any).toString();
        const url = `http://localhost:8004/translate_video?${queryParams}`;

        const progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 800);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Xử lý video thất bại');
        }

        const data = await response.json();
        const { translated_file_name } = data;

        const downloadResponse = await fetch(
          `http://localhost:8004/download/${encodeURIComponent(translated_file_name)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!downloadResponse.ok) {
          throw new Error('Tải video thất bại');
        }

        const blob = await downloadResponse.blob();
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = translated_file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlBlob);

        await fetchHistory('video_translate');
        toast.success('Dịch video thành công!', {
          position: 'bottom-right',
          theme: themeMode
        });

        // Reset form after successful processing
       setTimeout(() => {
  resetVideo();
  setOptions({
    vietnameseDub: false,
    pinyin: false,
    subtitles: false,
    extractChineseSrt: false,  // Thêm mới
    extractVietnameseSrt: false,  // Thêm mới
  });
}, 3000);

        return; // Success, exit loop
      } catch (error: any) {
        attempt++;
        if (attempt > maxRetries) {
          toast.error(`Dịch video thất bại: ${error.message}`, {
            position: 'bottom-right',
            theme: themeMode
          });
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      } finally {
        if (attempt > maxRetries || attempt === 0) {
          setIsProcessing(false);
          setProgress(0);
        }
      }
    }
  };

const handleDownloadSrt = async (fileName: string, type: 'chinese' | 'vietnamese') => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập', {
        position: 'bottom-right',
        theme: themeMode
      });
      return;
    }

    const endpoint = type === 'chinese' ? 'extract_chinese_srt' : 'extract_vietnamese_srt';
    const response = await fetch(`http://localhost:8004/${endpoint}/${encodeURIComponent(fileName)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Trích xuất file SRT ${type === 'chinese' ? 'tiếng Trung' : 'tiếng Việt'} thất bại`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(mp4|avi|mkv|mov)$/i, `_${type}.srt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Tải file SRT ${type === 'chinese' ? 'tiếng Trung' : 'tiếng Việt'} thành công!`, {
      position: 'bottom-right',
      theme: themeMode
    });
  } catch (error: any) {
    toast.error(`Tải file SRT thất bại: ${error.message}`, {
      position: 'bottom-right',
      theme: themeMode
    });
  }
};



  const handleDeleteHistory = async (historyId: number) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const response = await fetch(`http://localhost:8007/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Xóa lịch sử thất bại');
      }

      await fetchHistory('video_translate');
      toast.success('Xóa lịch sử thành công!', {
        position: 'bottom-right',
        theme: themeMode
      });
    } catch (error: any) {
      toast.error(`Xóa lịch sử thất bại: ${error.message}`, {
        position: 'bottom-right',
        theme: themeMode
      });
    }
  };

  const toggleTheme = (): void => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const confirmClearHistory = () => {
    clearHistory('video_translate');
    setShowConfirmClear(false);
    toast.success('Đã xóa tất cả lịch sử', {
      position: 'bottom-right',
      theme: themeMode
    });
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const themeClasses = {
    background: themeMode === 'light' 
      ? 'bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-violet-50' 
      : 'bg-gradient-to-br from-indigo-950 via-fuchsia-950 to-violet-950',
    text: themeMode === 'light' ? 'text-slate-800' : 'text-slate-200',
    subtext: themeMode === 'light' ? 'text-slate-600' : 'text-slate-400',
    header: themeMode === 'light' 
      ? 'from-white/80 to-indigo-50/80 text-indigo-950 border-indigo-100/30' 
      : 'from-slate-900/80 to-indigo-950/80 text-indigo-200 border-indigo-500/20',
    input: themeMode === 'light' 
      ? 'bg-white/80 shadow-md border-slate-200 focus:border-indigo-400' 
      : 'bg-slate-800/80 shadow-md border-slate-700 focus:border-indigo-500',
    button: themeMode === 'light'
      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white'
      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white',
    secondaryButton: themeMode === 'light'
      ? 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
      : 'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200',
    disabledButton: themeMode === 'light'
      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
      : 'bg-slate-800 text-slate-500 cursor-not-allowed',
    card: themeMode === 'light'
      ? 'bg-gradient-to-br from-white/90 to-indigo-50/90 border border-slate-200 shadow-sm'
      : 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border border-slate-800 shadow-md',
    progress: themeMode === 'light'
      ? 'from-indigo-500 to-violet-500'
      : 'from-indigo-600 to-violet-600',
    dragArea: themeMode === 'light'
      ? 'border-slate-200 bg-white/90 hover:bg-indigo-50/80'
      : 'border-slate-700 bg-slate-800/90 hover:bg-indigo-900/50',
    dragActive: themeMode === 'light'
      ? 'border-indigo-500 bg-indigo-50/80'
      : 'border-indigo-400 bg-indigo-900/50',
    checkboxBg: themeMode === 'light'
      ? 'bg-white border-slate-300'
      : 'bg-slate-800 border-slate-600',
    checkboxChecked: themeMode === 'light'
      ? 'bg-indigo-500 border-indigo-500'
      : 'bg-indigo-600 border-indigo-600',
    modal: themeMode === 'light'
      ? 'bg-white border-slate-200'
      : 'bg-slate-800 border-slate-700',
  };

  return (
    <div className={`h-full rounded-xl ${themeClasses.background} font-sans antialiased relative transition-colors duration-300`}>
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${
          themeMode === 'light' 
            ? 'from-indigo-500/5 via-fuchsia-500/5 to-violet-500/5' 
            : 'from-indigo-500/10 via-fuchsia-500/10 to-violet-500/10'
        } transition-all duration-1000`}/>
        <div className="absolute top-0 left-0 w-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-violet-400/10 to-transparent rounded-full filter blur-xl animate-blob" />
          <div className="absolute top-3/4 right-1/3 w-80 h-80 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-radial from-fuchsia-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-4 backdrop-blur-xl bg-gradient-to-r ${themeClasses.header} border rounded-2xl
                     shadow-lg shadow-indigo-500/5 flex justify-between items-center z-20
                     transition-all duration-300 mb-8 sticky top-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <FileVideo className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 tracking-tight">
              Dịch Video
              <span className="text-sm font-normal ml-2 opacity-80">(ZH → VI)</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full backdrop-blur-md bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300 shadow-sm"
              title={themeMode === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              aria-label={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {themeMode === 'light' ? (
                <Moon size={20} className="text-indigo-600" />
              ) : (
                <Sun size={20} className="text-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`p-2 rounded-full backdrop-blur-md ${historyOpen ? 'bg-indigo-500/30' : 'bg-indigo-500/10'} hover:bg-indigo-500/20 transition-all duration-300 shadow-sm flex items-center gap-1 sm:gap-2`}
              title="Lịch sử dịch"
              aria-label={historyOpen ? 'Ẩn lịch sử dịch' : 'Hiện lịch sử dịch'}
            >
              <Clock size={20} className={`${historyOpen ? 'text-indigo-200' : themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <span className={`hidden sm:inline text-sm font-medium ${historyOpen ? 'text-indigo-200' : themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                Lịch sử
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* File Upload */}
              {!videoUrl && (
                <div
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    isDragging ? themeClasses.dragActive : themeClasses.dragArea
                  } h-70 flex items-center justify-center cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".mp4,.avi,.mkv,.mov"
                    onChange={handleInputChange}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isProcessing}
                  />
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full flex items-center justify-center">
                      <Upload className={`h-10 w-10 ${themeMode === 'light' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${themeClasses.text}`}>
                      Tải video lên để dịch
                    </h3>
                    <p className={`mb-4 ${themeClasses.subtext}`}>
                      Kéo và thả video hoặc nhấp để chọn file
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs ${themeClasses.subtext} bg-slate-100 dark:bg-slate-800`}>
                      Hỗ trợ: .mp4, .avi, .mkv, .mov (Tối đa 200MB)
                    </div>
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {videoUrl && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-2xl overflow-hidden ${themeClasses.card} p-4`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-medium ${themeClasses.text}`}>Video của bạn</h3>
                    <button
                      onClick={resetVideo}
                      className={`p-2 rounded-full ${themeClasses.secondaryButton} flex items-center justify-center`}
                      disabled={isProcessing}
                      title="Chọn video khác"
                      aria-label="Chọn video khác"
                    >
                      <RotateCcw size={16} className={isProcessing ? 'text-slate-400 dark:text-slate-600' : ''} />
                    </button>
                  </div>
                  <div className="relative w-full rounded-xl overflow-hidden bg-slate-900">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full object-contain"
                      style={{ maxHeight: '450px' }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
                        <FileVideo className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-sm font-medium truncate max-w-sm ${themeClasses.text}`}>{videoFile?.name}</p>
                        <p className={`text-xs ${themeClasses.subtext}`}>
                          {videoFile && formatFileSize(videoFile.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Translation Options */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`mt-6 p-5 rounded-2xl ${themeClasses.card}`}
              >
                <div className="flex items-center mb-4">
                  <Settings className={`h-5 w-5 mr-2 ${themeClasses.text}`} />
                  <h3 className={`font-medium ${themeClasses.text}`}>Tùy chọn dịch</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                   { key: 'vietnameseDub', label: 'Lồng tiếng Việt', description: 'Thêm giọng đọc tiếng Việt' },
    { key: 'pinyin', label: 'Pinyin', description: 'Phiên âm tiếng Trung' },
    { key: 'subtitles', label: 'Phụ đề', description: 'Thêm phụ đề tiếng Việt' },
    { key: 'extractChineseSrt', label: 'Trích xuất SRT TQ', description: 'Tải file phụ đề tiếng Trung' },  // Thêm mới
    { key: 'extractVietnameseSrt', label: 'Trích xuất SRT VN', description: 'Tải file phụ đề tiếng Việt' },  // Thêm mới
                  ].map(({ key, label, description }) => (
                    <label
                      key={key}
                      className={`flex items-start space-x-3 p-4 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 
                        transition-all duration-200 cursor-pointer border ${
                        options[key as keyof TranslationOptions] 
                          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="relative flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={options[key as keyof TranslationOptions]}
                          onChange={() => handleOptionChange(key as keyof TranslationOptions)}
                          className="opacity-0 absolute h-5 w-5"
                          disabled={isProcessing}
                          id={`option-${key}`}
                        />
                        <div className={`h-5 w-5 ${
                          options[key as keyof TranslationOptions] 
                            ? themeClasses.checkboxChecked 
                            : themeClasses.checkboxBg
                        } rounded transition-all duration-200 flex items-center justify-center border`}>
                          {options[key as keyof TranslationOptions] && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${themeClasses.text}`}>{label}</span>
                        <p className={`text-xs ${themeClasses.subtext} mt-1`}>{description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${themeClasses.subtext} flex items-center`}>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý video...
                      </span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${themeClasses.progress} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Process Button */}
                <button
                  type="button"
                  onClick={handleProcessVideo}
                  disabled={!videoFile || isProcessing}
                  className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-3 ${
                    videoFile && !isProcessing
                      ? themeClasses.button
                      : themeClasses.disabledButton
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Bắt đầu dịch video</span>
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* History Section - Collapsible Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                height: historyOpen ? 'auto' : '80px'
              }}
              transition={{ duration: 0.4 }}
              className={`${themeClasses.card} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <div 
                className="flex justify-between items-center p-5 cursor-pointer"
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                <div className="flex items-center">
                  <Clock className={`h-5 w-5 mr-2 ${themeClasses.text}`} />
                  <h3 className={`font-medium ${themeClasses.text}`}>Lịch sử Dịch Video</h3>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 ${themeClasses.text} transform transition-transform duration-300 ${historyOpen ? 'rotate-180' : ''}`} 
                />
              </div>
              
              <AnimatePresence>
                {historyOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-sm ${themeClasses.subtext}`}>
                        {history.length} bản ghi
                      </span>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowConfirmClear(true)}
                          className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
                          aria-label="Xóa tất cả lịch sử"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Xóa tất cả</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                      {history.length > 0 ? (
                        history.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-xl ${themeClasses.card}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className={`text-xs ${themeClasses.subtext}`}>
                                  {formatTimestamp(item.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className={`text-sm ${themeClasses.text}`}>
                              <strong>File gốc:</strong> {item.data.file_name}
                            </p>
                            <p className={`text-sm ${themeClasses.text}`}>
                              <strong>File dịch:</strong> {item.data.translated_file_name}
                            </p>
                            <p className={`text-sm ${themeClasses.subtext}`}>
                              <strong>Tùy chọn:</strong>{' '}
                              {[
                                item.data.options?.dubbing_vi && 'Lồng tiếng Việt',
                                item.data.options?.pinyin && 'Pinyin',
                                item.data.options?.subtitle_vi && 'Phụ đề',
                                 item.data.options?.extract_chinese_srt && 'SRT Tiếng Trung',  // Thêm mới
    item.data.options?.extract_vietnamese_srt && 'SRT Tiếng Việt',  // Thêm mới
                              ]
                                .filter(Boolean)
                                .join(', ') || 'Không có'}
                            </p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              <a
                                href={`http://localhost:8004/download/${encodeURIComponent(item.data.translated_file_name)}`}
                                className={`flex items-center space-x-1 text-sm ${themeClasses.text} hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300`}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const token = Cookies.get('token');
                                  if (!token) {
                                    toast.error('Vui lòng đăng nhập', {
                                      position: 'bottom-right',
                                      theme: themeMode
                                    });
                                    return;
                                  }
                                  try {
                                    const response = await fetch(e.currentTarget.href, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = item.data.translated_file_name;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      window.URL.revokeObjectURL(url);
                                    } else {
                                      toast.error('Tải file thất bại', {
                                        position: 'bottom-right',
                                        theme: themeMode
                                      });
                                    }
                                  } catch (error: any) {
                                    toast.error(`Tải file thất bại: ${error.message}`, {
                                      position: 'bottom-right',
                                      theme: themeMode
                                    });
                                  }
                                }}
                                aria-label={`Tải xuống ${item.data.translated_file_name}`}
                              >
                                <Download className="h-4 w-4" />
    <span>Video</span>
                              </a>
                               <button
    type="button"
    onClick={() => handleDownloadSrt(item.data.translated_file_name, 'chinese')}
    className={`flex items-center space-x-1 text-sm ${themeClasses.text} hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300`}
    aria-label={`Tải SRT tiếng Trung cho ${item.data.translated_file_name}`}
  >
    <Download className="h-4 w-4" />
    <span>SRT TQ</span>
  </button>
  
  {/* Thêm nút tải SRT tiếng Việt */}
  <button
    type="button"
    onClick={() => handleDownloadSrt(item.data.translated_file_name, 'vietnamese')}
    className={`flex items-center space-x-1 text-sm ${themeClasses.text} hover:text-green-600 dark:hover:text-green-400 transition-all duration-300`}
    aria-label={`Tải SRT tiếng Việt cho ${item.data.translated_file_name}`}
  >
    <Download className="h-4 w-4" />
    <span>SRT VN</span>
  </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHistory(item.id)}
                                className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
                                aria-label={`Xóa lịch sử ${item.data.translated_file_name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className={`text-sm ${themeClasses.subtext} mb-4`}>Chưa có lịch sử dịch video.</p>
                          <button
                            onClick={() => fetchHistory('video_translate')}
                            className={`flex items-center justify-center mx-auto space-x-2 px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                            aria-label="Tải lại lịch sử"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Tải lại</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Confirm Clear History Modal */}
        <AnimatePresence>
          {showConfirmClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              role="dialog"
              aria-labelledby="clear-history-title"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`p-6 rounded-2xl ${themeClasses.modal} max-w-md w-full mx-4 shadow-xl border`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 id="clear-history-title" className={`text-lg font-medium ${themeClasses.text}`}>
                    Xóa tất cả lịch sử
                  </h3>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                    aria-label="Đóng"
                  >
                    <X className={`h-5 w-5 ${themeClasses.text}`} />
                  </button>
                </div>
                <p className={`text-sm ${themeClasses.subtext} mb-6`}>
                  Bạn có chắc muốn xóa toàn bộ lịch sử dịch video? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className={`px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                    aria-label="Hủy"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmClearHistory}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300"
                    aria-label="Xóa tất cả"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}