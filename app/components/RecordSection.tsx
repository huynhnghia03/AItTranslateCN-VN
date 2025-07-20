"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useAudio } from '../lib/useAudio';
import { useHistory } from '../lib/useHistory';
import { Sparkles, Upload, Mic, MicOff, Clock, CheckCircle2, XCircle, History, ChevronDown, ChevronUp, Moon, Sun, AlertTriangle, Trash2, RotateCcw, X, BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
interface HSKLevel {
  level: string;
  name: string;
  description: string;
}

interface SampleText {
  id: string;
  level: string;
  title: string;
  content: string;
  difficulty: string;
}
interface HistoryItem {
  id: string;
  type: 'pronunciation_check';
  timestamp: string;
  data: {
    original_text?: string;
    spoken_text?: string;
    normalized_original_text?: string;
    normalized_spoken_text?: string;
    original_pinyin?: string;
    spoken_pinyin?: string;
    accuracy?: number;
    highlighted_text?: string;
    errors?: { char: string; expected_pinyin: string; spoken_pinyin: string; spoken_char: string; index: number }[];
    missing_chars?: { char: string; expected_pinyin: string; index: number }[];
    extra_chars?: { char: string; spoken_pinyin: string; index: number }[];
    reading_info?: {
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
    speed_comparison?: {
      expected_time: number;
      actual_time: number;
      speed_ratio: number;
      is_faster: boolean;
      time_difference: number;
    };
  };
}

export default function RecordSection() {
  const { 
    isRecording, 
    pronunciationResult, 
    recordingMessage, 
    recordingTime, 
    isProcessing, 
    userId, 
    startRecording, 
    stopRecording 
  } = useAudio();
  const { getHistoryByType, fetchHistory, clearHistory } = useHistory("pronunciation_check");
  const history: HistoryItem[] = getHistoryByType('pronunciation_check');
  const [textInput, setTextInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [accuracyColor, setAccuracyColor] = useState<string>('text-gray-700');
const [selectedHSKLevel, setSelectedHSKLevel] = useState<string>('1');
const [sampleTexts, setSampleTexts] = useState<SampleText[]>([]);
const [selectedSampleText, setSelectedSampleText] = useState<SampleText | null>(null);
const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);
const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
const [maxRecordingTime, setMaxRecordingTime] = useState<number>(30); // Default to 30s initially
const [isResultModalOpen, setIsResultModalOpen] = useState(false);
const hskLevels: HSKLevel[] = [
  { level: '1', name: 'HSK 1', description: 'Cơ bản - 150 từ vựng' },
  { level: '2', name: 'HSK 2', description: 'Sơ cấp - 300 từ vựng' },
  { level: '3', name: 'HSK 3', description: 'Trung cấp thấp - 600 từ vựng' },
  { level: '4', name: 'HSK 4', description: 'Trung cấp - 1200 từ vựng' },
  { level: '5', name: 'HSK 5', description: 'Trung cấp cao - 2500 từ vựng' },
  { level: '6', name: 'HSK 6', description: 'Nâng cao - 5000+ từ vựng' }
];
  // Handle system theme preference and accuracy color
  useEffect(() => {
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
    
    // Update accuracy color based on result
    if (pronunciationResult) {
      const accuracy = (pronunciationResult as PronunciationResult).accuracy;
      if (accuracy > 90) {
        setAccuracyColor('text-emerald-500');
      } else if (accuracy > 70) {
        setAccuracyColor('text-amber-500');
      } else {
        setAccuracyColor('text-rose-500');
      }
    }

    // Apply theme to document
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode, pronunciationResult]);
useEffect(() => {
  if (pronunciationResult) {
    setIsResultModalOpen(true);
  }
}, [pronunciationResult]);
const calculateReadingTime = async (text: string, hskLevel: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch('http://localhost:8002/calculate_reading_time', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, hsk_level: hskLevel }),
    });

    if (!response.ok) {
      throw new Error('Không thể tính thời gian đọc');
    }

    const result = await response.json();
    setMaxRecordingTime(Math.ceil(result.estimated_time_seconds)); // Round up to nearest second
    return result.estimated_time_seconds;
  } catch (error) {
    console.error('Error calculating reading time:', error);
    toast.error('Không thể tính thời gian đọc', {
      position: 'bottom-right',
      theme: themeMode,
    });
    setMaxRecordingTime(30); // Fallback to 30s
    return 30;
  }
};


const fetchSampleTexts = async (level: string) => {
  setIsLoadingSamples(true);
  try {
    const token = Cookies.get('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Chuẩn hóa level
   

    // Gọi API với GET và query parameters
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10 giây

    const response = await fetch(
      `http://localhost:8002/hsk-recommend?level=${encodeURIComponent(level)}&num_results=5`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Không thể tải danh sách văn bản mẫu');
    }

    const data = await response.json();
    const formattedTexts = data.texts.map((item: any, index: number) => ({
      id: `${index + 1}`,
      level: data.level,
      title: item.CHINESE.slice(0, 10) + (item.CHINESE.length > 10 ? '...' : ''),
      content: item.CHINESE,
      translation: item.vietnamese_translation || '',
      difficulty: data.level,
    }));

    setSampleTexts(formattedTexts);
  } catch (error: any) {
    console.error('Lỗi khi tải văn bản mẫu:', error);
    let errorMessage = 'Lỗi khi tải văn bản mẫu';
    if (error.name === 'AbortError') {
      errorMessage = 'Yêu cầu hết thời gian, vui lòng thử lại';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Không thể kết nối đến server, kiểm tra server hoặc mạng';
    } else {
      errorMessage = error.message || errorMessage;
    }
    toast.error(errorMessage, {
      position: 'bottom-right',
      theme: themeMode,
    });
    setSampleTexts([]);
  } finally {
    setIsLoadingSamples(false);
  }
};

useEffect(() => {
  fetchSampleTexts(selectedHSKLevel);
}, [selectedHSKLevel]);

const handleSelectSampleText = (sample: SampleText) => {
  setTextInput(sample.content);
  setSelectedSampleText(sample);
  setShowSampleModal(false);
  calculateReadingTime(sample.content, sample.level); // Calculate reading time
  toast.success(`Đã chọn văn bản: ${sample.title}`, {
    position: 'bottom-right',
    theme: themeMode
  });
};
const handleUploadText = async () => {
  const formData = new FormData();
  formData.append('hsk_level', selectedHSKLevel);
  if (file) {
    formData.append('file', file);
  } else if (textInput) {
    formData.append('text', textInput);
  } else {
    toast.error('Vui lòng cung cấp văn bản hoặc file.', {
      position: 'bottom-right',
      theme: themeMode,
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:8002/upload_text', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Tải văn bản thất bại');
    }
    const result = await response.json();
    setTextInput(result.text);
    setMaxRecordingTime(Math.ceil(result.reading_info.estimated_time_seconds)); // Update max recording time
    toast.success(`Tải văn bản thành công. Thời gian đọc ước tính: ${result.reading_info.estimated_time_formatted}`, {
      position: 'bottom-right',
      theme: themeMode,
    });
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(`Tải văn bản thất bại: ${error}`, {
      position: 'bottom-right',
      theme: themeMode,
    });
    setMaxRecordingTime(30); // Fallback to 30s
  }
};
const handleStartRecording = () => {
  if (isProcessing) {
    toast.error('Đang xử lý tác vụ khác. Vui lòng đợi.', {
      position: 'bottom-right',
      theme: themeMode,
    });
    return;
  }
  startRecording('pronunciation_check', textInput, selectedHSKLevel, maxRecordingTime);
};

  const handleDeleteHistory = async (historyId: string) => {
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

      await fetchHistory('pronunciation_check');
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

  const confirmClearHistory = () => {
    clearHistory('pronunciation_check');
    setShowConfirmClear(false);
    toast.success('Đã xóa tất cả lịch sử', {
      position: 'bottom-right',
      theme: themeMode
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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

  const toggleTheme = (): void => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleExpandHistory = (id: string) => {
    setExpandedHistory(expandedHistory === id ? null : id);
  };

  const toggleHistoryVisibility = () => {
    setIsHistoryVisible(!isHistoryVisible);
    setHistoryOpen(!historyOpen)
   
  };
useEffect(()=>{
   if(historyOpen){
       fetchHistory('pronunciation_check')
    }
},[historyOpen])
  // Get accuracy color based on score
  const getAccuracyColor = (accuracy: number | undefined): string => {
    if (!accuracy) return 'text-gray-500';
    return accuracy > 90 
      ? 'text-emerald-500 dark:text-emerald-400' 
      : accuracy > 70 
        ? 'text-amber-500 dark:text-amber-400' 
        : 'text-rose-500 dark:text-rose-400';
  };

  const themeClasses = {
    background: themeMode === 'light' 
      ? 'bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-violet-50' 
      : 'bg-gradient-to-br from-indigo-950 via-fuchsia-950 to-violet-950',
    text: themeMode === 'light' ? 'text-slate-800' : 'text-slate-200',
    subtext: themeMode === 'light' ? 'text-slate-600' : 'text-slate-400',
    header: themeMode === 'light' 
      ? 'bg-gradient-to-r from-white/80 to-indigo-50/80 border-indigo-100/30' 
      : 'bg-gradient-to-r from-slate-900/80 to-indigo-950/80 border-indigo-500/20',
    input: themeMode === 'light' 
      ? 'bg-white/80 shadow-md border-slate-200 focus:border-indigo-400 focus:ring-indigo-200' 
      : 'bg-slate-800/80 shadow-md border-slate-700 focus:border-indigo-500 text-white',
    button: themeMode === 'light'
      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white'
      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white',
    secondaryButton: themeMode === 'light'
      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
      : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700',
    disabledButton: themeMode === 'light'
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gray-800 text-gray-500 cursor-not-allowed',
    recordButton: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    stopButton: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white',
    card: themeMode === 'light'
      ? 'bg-gradient-to-br from-white/90 to-indigo-50/90 border border-slate-200 shadow-sm'
      : 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border border-slate-800 shadow-md',
    processing: themeMode === 'light'
      ? 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700'
      : 'bg-indigo-900/30 border-l-4 border-indigo-600 text-indigo-300',
    resultPanels: themeMode === 'light'
      ? 'bg-gradient-to-br from-white to-indigo-50/50'
      : 'bg-gradient-to-br from-gray-800 to-indigo-900/50',
    scrollbar: themeMode === 'light'
      ? 'scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent'
      : 'scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent',
    modal: themeMode === 'light'
      ? 'bg-white border-slate-200'
      : 'bg-slate-800 border-slate-700',
  };

  return (
    <div className={`h-full rounded-xl ${themeClasses.background} font-sans antialiased relative transition-colors duration-300`}>
      
      {/* Glass morphism background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-violet-500/5 transition-all duration-1000" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-blob opacity-50" />
          <div className="absolute top-2/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000 opacity-50" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-fuchsia-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000 opacity-50" />
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-1">
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
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 tracking-tight">
            Kiểm Tra Phát Âm
              
            </h2>
          </div>
          <div className="flex items-center space-x-2">
                 {recordingMessage && (
  <div className={`${themeClasses.processing} rounded-lg p-3 flex items-center shadow-md animate-pulse mb-4`}>
    <div className="mr-3 flex-shrink-0">
      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
    </div>
    <div className="flex-1">
      <p className="font-medium text-sm">{recordingMessage}</p>
      <div className="mt-1 flex items-center">
        <Clock size={14} className="mr-1" />
        <p className="font-mono text-xs">
          {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
        </p>
      </div>
    </div>
  </div>
)}
              {isProcessing && (
                <div className={`${themeClasses.card} rounded-lg p-3 flex items-center shadow-md animate-fade-in`}>
                  <svg className="animate-spin h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className={`${themeClasses.subtext} text-sm`}>Đang xử lý phát âm...</span>
                </div>
        )} 
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
              onClick={toggleHistoryVisibility}
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
          {/* Main Panel */}
        
                <div className="lg:col-span-2 flex flex-col justify-between h-full">
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
            <div className={`${themeClasses.card} rounded-xl p-4 flex-1 flex flex-col overflow-hidden`}>
              {/* Status Section */}
       
              {/* Input Section */}
                <div className="mb-4">
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2 flex items-center`}>
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-1 h-5 rounded mr-2"></span>
                  Văn bản Tiếng Trung
                </h3>
                {/* <p className={`${themeClasses.subtext} text-sm mb-3`}>Chọn cấp độ HSK và văn bản mẫu hoặc nhập văn bản tùy chỉnh.</p> */}
                
                {/* HSK Level Selection */}
              <div className="mb-4">
    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
      Chọn cấp độ HSK
    </label>
    <div className="flex items-center gap-4">
      <select
        value={selectedHSKLevel}
        onChange={(e) => {
          setSelectedHSKLevel(e.target.value);
          if (e.target.value && textInput) {
            calculateReadingTime(textInput, e.target.value); // Calculate reading time on change
          }
        }}
        className={`w-3/5 p-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
      >
        {hskLevels.map((level) => (
          <option key={level.level} value={level.level}>
            {level.name} - {level.description}
          </option>
        ))}
      </select>
      {/* Sample Text Button */}
      <div className="w-2/5">
        <button
          onClick={() => setShowSampleModal(true)}
          disabled={isLoadingSamples}
          className={`w-full flex items-center justify-center px-4 py-3 ${themeClasses.button} rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg ${isLoadingSamples ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoadingSamples ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Đang tải văn bản mẫu...
            </>
          ) : (
            <>
              <BookOpen size={16} className="mr-2" />
              Bản mẫu {hskLevels.find(h => h.level === selectedHSKLevel)?.name}
            </>
          )}
        </button>
      </div>
    </div>
  </div>

           

               <textarea
                className={`flex-1 w-full p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${themeMode === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-800 text-slate-200 border-slate-700'}`}
      rows={10} // Tăng số hàng để textarea cao hơn
      style={{ maxHeight: '200px' }} // Đảm bảo chiều cao tối thiểu
 placeholder="Nhập hoặc tải văn bản tiếng Trung cần kiểm tra phát âm hoặc chọn văn bản mẫu ở trên..."
  value={textInput}
  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    if (e.target.value) {
      calculateReadingTime(e.target.value, selectedHSKLevel); // Calculate reading time on change
    } else {
      setMaxRecordingTime(30); // Reset to default if text is empty
    }
  }}
/>
                
                {selectedSampleText && (
                  <div className={`mt-2 p-2 rounded-lg ${themeMode === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'} flex items-center justify-between`}>
                    <div className="flex items-center">
                      <BookOpen size={14} className="text-blue-500 mr-1" />
                      <span className={`text-xs ${themeMode === 'light' ? 'text-blue-700' : 'text-blue-300'}`}>
                        Đang sử dụng gợi ý:({hskLevels.find(h => h.level === selectedSampleText.level)?.level})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSampleText(null);
                        setTextInput('');
                      }}
                      className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      title="Xóa văn bản mẫu"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".txt,.pdf"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <label 
                      htmlFor="file-upload"
                      className={`w-full flex items-center justify-center px-4 py-2 ${themeClasses.secondaryButton} rounded-lg cursor-pointer transition-all duration-300 text-sm`}
                    >
                      <Upload size={16} className="mr-2" />
                      {file ? file.name.slice(0, 15) + (file.name.length > 15 ? '...' : '') : 'Chọn file'}
                    </label>
                  </div>
                  <button
                    onClick={handleUploadText}
                    className={`w-full sm:w-auto px-5 py-2 ${themeClasses.button} rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-sm`}
                  >
                    <Upload size={16} className="mr-1" />
                    Tải lên
                  </button>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording || isProcessing || !textInput}
                  className={`w-full sm:flex-1 px-5 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium ${
                    isRecording || isProcessing || !textInput
                      ? themeClasses.disabledButton
                      : themeClasses.recordButton
                  }`}
                >
                  <Mic size={16} className="mr-2" />
                  Bắt đầu ghi âm
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={`w-full sm:w-auto px-5 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium ${
                    !isRecording
                      ? themeClasses.disabledButton
                      : themeClasses.stopButton
                  }`}
                >
                  <MicOff size={16} className="mr-2" />
                  Dừng
                </button>
              </div>
            </div>
</motion.div>
            {/* Pronunciation Result */}
          {/* Pronunciation Result */}
{/* Pronunciation Result */}
{/* Pronunciation Result */}
{/* Pronunciation Result */}
  {pronunciationResult && (
    <AnimatePresence>
      {isResultModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="pronunciation-result-title"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeClasses.modal} rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl border`}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h3 id="pronunciation-result-title" className={`text-lg font-semibold ${themeClasses.text} flex items-center`}>
                  <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
                  Kết quả Phát Âm
                </h3>
                <button
                  onClick={() => setIsResultModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                  aria-label="Đóng"
                >
                  <X className={`h-5 w-5 ${themeClasses.text}`} />
                </button>
              </div>
              <p className={`text-sm ${themeClasses.subtext} mt-2`}>
                Kết quả phân tích phát âm của bạn. Độ chính xác: <span className={accuracyColor}>{(pronunciationResult as PronunciationResult).accuracy.toFixed(2)}%</span>
              </p>
            </div>

            <div className={`p-6 overflow-y-auto max-h-[60vh] ${themeClasses.scrollbar}`}>
              <div className="grid gap-4">
                {/* Original Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                      <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                      Văn bản gốc
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${themeMode === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'}`}>
                      {hskLevels.find(h => h.level === (pronunciationResult as PronunciationResult).reading_info.hsk_level)?.name || (pronunciationResult as PronunciationResult).reading_info.hsk_level}
                    </span>
                  </div>
                  <p className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                    {(pronunciationResult as PronunciationResult).original_text}
                  </p>
                  <p className={`text-xs mt-1 ${themeClasses.subtext}`}>
                    Pinyin: {(pronunciationResult as PronunciationResult).original_pinyin}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nhấn để xem chi tiết
                    </span>
                    <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                  </div>
                </motion.div>

                {/* Spoken Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                      <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                      Văn bản nghe được
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${themeMode === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'}`}>
                      {hskLevels.find(h => h.level === (pronunciationResult as PronunciationResult).reading_info.hsk_level)?.name || (pronunciationResult as PronunciationResult).reading_info.hsk_level}
                    </span>
                  </div>
                  <p className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                    {(pronunciationResult as PronunciationResult).spoken_text}
                  </p>
                  <p className={`text-xs mt-1 ${themeClasses.subtext}`}>
                    Pinyin: {(pronunciationResult as PronunciationResult).spoken_pinyin}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nhấn để xem chi tiết
                    </span>
                    <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                  </div>
                </motion.div>

                {/* Highlighted Errors */}
                {(pronunciationResult as PronunciationResult).highlighted_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                        Hiển thị lỗi
                      </h4>
                    </div>
                    <div className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                      <div dangerouslySetInnerHTML={{ __html: (pronunciationResult as PronunciationResult).highlighted_text }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấn để xem chi tiết
                      </span>
                      <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                    </div>
                  </motion.div>
                )}

                {/* Reading Info */}
                {(pronunciationResult as PronunciationResult).reading_info && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                        Thông tin thời gian đọc
                      </h4>
                    </div>
                    <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                      <p>Số ký tự: {(pronunciationResult as PronunciationResult).reading_info.char_count}</p>
                      <p>Thời gian đọc ước tính: {(pronunciationResult as PronunciationResult).reading_info.estimated_time_formatted}</p>
                      <p>Tốc độ đọc thực tế: {formatTime((pronunciationResult as PronunciationResult).speed_comparison.actual_time)}</p>
                      <p>So sánh tốc độ: {(pronunciationResult as PronunciationResult).speed_comparison.is_faster ? 'Nhanh hơn' : 'Chậm hơn'} ({(pronunciationResult as PronunciationResult).speed_comparison.speed_ratio.toFixed(2)}x)</p>
                      <p>Chênh lệch: {formatTime((pronunciationResult as PronunciationResult).speed_comparison.time_difference)}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấn để xem chi tiết
                      </span>
                      <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                    </div>
                  </motion.div>
                )}

                {/* Pronunciation Errors */}
                {(pronunciationResult as PronunciationResult).errors && (pronunciationResult as PronunciationResult).errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                        Lỗi phát âm ({(pronunciationResult as PronunciationResult).errors.length})
                      </h4>
                    </div>
                    <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-rose-50' : 'bg-rose-900/20'}`}>
                      <ul className="space-y-1">
                        {(pronunciationResult as PronunciationResult).errors.map((error, index) => (
                          <li key={index} className={`text-xs ${themeClasses.text}`}>
                            <span className="font-medium">Ký tự (vị trí {error.index}):</span> {error.char} 
                            <span className="mx-1">|</span>
                            <span className="font-medium">Phát âm đúng:</span> {error.expected_pinyin}
                            <span className="mx-1">|</span>
                            <span className="font-medium">Phát âm của bạn:</span> {error.spoken_pinyin} ({error.spoken_char})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấn để xem chi tiết
                      </span>
                      <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                    </div>
                  </motion.div>
                )}

                {/* Missing Characters */}
                {(pronunciationResult as PronunciationResult).missing_chars && (pronunciationResult as PronunciationResult).missing_chars.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                        Ký tự thiếu ({(pronunciationResult as PronunciationResult).missing_chars.length})
                      </h4>
                    </div>
                    <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(pronunciationResult as PronunciationResult).missing_chars.map((missing, index) => (
                          <li key={index} className={`text-xs ${themeClasses.text}`}>
                            <span className="font-medium">Ký tự (vị trí {missing.index}):</span> {missing.char}
                            <div><span className="font-medium">Pinyin:</span> {missing.expected_pinyin}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấn để xem chi tiết
                      </span>
                      <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                    </div>
                  </motion.div>
                )}

                {/* Extra Characters */}
                {(pronunciationResult as PronunciationResult).extra_chars && (pronunciationResult as PronunciationResult).extra_chars.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                        Ký tự dư ({(pronunciationResult as PronunciationResult).extra_chars.length})
                      </h4>
                    </div>
                    <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(pronunciationResult as PronunciationResult).extra_chars.map((extra, index) => (
                          <li key={index} className={`text-xs ${themeClasses.text}`}>
                            <span className="font-medium">Ký tự (vị trí {extra.index}):</span> {extra.char}
                            <div><span className="font-medium">Pinyin:</span> {extra.spoken_pinyin}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nhấn để xem chi tiết
                      </span>
                      <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsResultModalOpen(false)}
                  className={`px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )}
          </div>

          {/* History Panel */}
         {/* History Panel */}
 <div className="lg:col-span-1">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isHistoryVisible ? 'auto' : '80px'
      }}
      transition={{ duration: 0.3 }}
      className={`${themeClasses.card} rounded-xl overflow-hidden transition-all duration-300 max-h-[calc(100vh-200px)] flex flex-col`}
    >
      <div 
        className="flex justify-between items-center p-5 cursor-pointer"
        onClick={toggleHistoryVisibility}
        aria-label={isHistoryVisible ? 'Ẩn lịch sử phát âm' : 'Hiện lịch sử phát âm'}
      >
        <div className="flex items-center">
          <Clock className={`h-5 w-5 mr-2 ${themeClasses.text}`} />
          <h3 className={`font-medium ${themeClasses.text}`}>Lịch sử Phát Âm</h3>
        </div>
        <ChevronDown 
          className={`h-5 w-5 ${themeClasses.text} transform transition-transform duration-300 ${historyOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      <AnimatePresence>
        {isHistoryVisible && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5 flex-1 overflow-y-auto"
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
            <div className={`space-y-4 max-h-[450px] overflow-y-auto ${themeClasses.scrollbar}`}>
              {history.length > 0 ? (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-xl ${themeClasses.card} overflow-hidden cursor-pointer`}
                    onClick={() => setExpandedHistory(item.id !== expandedHistory ? item.id : null)}
                    aria-label={`Xem chi tiết lịch sử ${item.data.original_text?.slice(0, 30) || 'phát âm'} ${item.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className={`text-xs ${themeClasses.subtext}`}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${getAccuracyColor(item.data.accuracy)}`}>
                        {item.data.accuracy ? `${item.data.accuracy.toFixed(2)}%` : '0.0%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${themeClasses.text} truncate flex-1`}>
                        <strong>Văn bản:</strong> {item.data.original_text?.slice(0, 30)}{item.data.original_text && item.data.original_text.length > 30 ? '...' : ''}
                      </p>
                      <ChevronDown 
                        className={`h-5 w-5 ${themeClasses.text} transform transition-transform duration-300 ${expandedHistory === item.id ? 'rotate-180' : ''}`} 
                      />
                    </div>
                    <div className="flex gap-4 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the modal
                          handleDeleteHistory(item.id);
                        }}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
                        aria-label={`Xóa lịch sử ${item.data.original_text?.slice(0, 30) || 'phát âm'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className={`text-sm ${themeClasses.subtext} mb-4`}>Chưa có lịch sử phát âm.</p>
                  <button
                    onClick={() => fetchHistory('pronunciation_check')}
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

    {/* History Detail Modal */}
    <AnimatePresence>
      {expandedHistory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="history-detail-title"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`${themeClasses.modal} rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl border`}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h3 id="history-detail-title" className={`text-lg font-semibold ${themeClasses.text} flex items-center`}>
                  <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
                  Chi tiết Lịch sử Phát Âm
                </h3>
                <button
                  onClick={() => setExpandedHistory(null)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                  aria-label="Đóng"
                >
                  <X className={`h-5 w-5 ${themeClasses.text}`} />
                </button>
              </div>
              <p className={`text-sm ${themeClasses.subtext} mt-2`}>
                Xem chi tiết kết quả phát âm của bạn. Độ chính xác: <span className={getAccuracyColor(history.find(item => item.id === expandedHistory)?.data.accuracy)}>
                  {history.find(item => item.id === expandedHistory)?.data.accuracy?.toFixed(2)}%
                </span>
              </p>
            </div>

            <div className={`p-6 overflow-y-auto max-h-[60vh] ${themeClasses.scrollbar}`}>
              <div className="grid gap-4">
                {history.filter(item => item.id === expandedHistory).map(item => (
                  <div key={item.id}>
                    {/* Original Text */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                          Văn bản gốc
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${themeMode === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'}`}>
                          {hskLevels.find(h => h.level === item.data.reading_info?.hsk_level)?.name || item.data.reading_info?.hsk_level}
                        </span>
                      </div>
                      <p className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                        {item.data.original_text}
                      </p>
                      <p className={`text-xs mt-1 ${themeClasses.subtext}`}>
                        Pinyin: {item.data.original_pinyin}
                      </p>
                      {/* <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Nhấn để xem chi tiết
                        </span>
                        <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                      </div> */}
                    </motion.div>

                    {/* Spoken Text */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                          Văn bản nghe được
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${themeMode === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'}`}>
                          {hskLevels.find(h => h.level === item.data.reading_info?.hsk_level)?.name || item.data.reading_info?.hsk_level}
                        </span>
                      </div>
                      <p className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                        {item.data.spoken_text}
                      </p>
                      <p className={`text-xs mt-1 ${themeClasses.subtext}`}>
                        Pinyin: {item.data.spoken_pinyin}
                      </p>
                      {/* <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Nhấn để xem chi tiết
                        </span>
                        <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                      </div> */}
                    </motion.div>

                    {/* Highlighted Errors */}
                    {item.data.highlighted_text && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                            Hiển thị lỗi
                          </h4>
                        </div>
                        <div className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                          <div dangerouslySetInnerHTML={{ __html: item.data.highlighted_text }} />
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhấn để xem chi tiết
                          </span>
                          <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                        </div> */}
                      </motion.div>
                    )}

                    {/* Reading Info */}
                    {item.data.reading_info && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                            Thông tin thời gian đọc
                          </h4>
                        </div>
                        <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                          <p>Số ký tự: {item.data.reading_info.char_count}</p>
                          <p>Thời gian đọc ước tính: {item.data.reading_info.estimated_time_formatted}</p>
                          <p>Tốc độ đọc thực tế: {formatTime(item.data.speed_comparison?.actual_time || 0)}</p>
                          <p>So sánh tốc độ: {item.data.speed_comparison?.is_faster ? 'Nhanh hơn' : 'Chậm hơn'} ({item.data.speed_comparison?.speed_ratio.toFixed(2)}x)</p>
                          <p>Chênh lệch: {formatTime(item.data.speed_comparison?.time_difference || 0)}</p>
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhấn để xem chi tiết
                          </span>
                          <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                        </div> */}
                      </motion.div>
                    )}

                    {/* Pronunciation Errors */}
                    {item.data.errors && item.data.errors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                            Lỗi phát âm ({item.data.errors.length})
                          </h4>
                        </div>
                        <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-rose-50' : 'bg-rose-900/20'}`}>
                          <ul className="space-y-1">
                            {item.data.errors.map((error, index) => (
                              <li key={index} className={`text-xs ${themeClasses.text}`}>
                                <span className="font-medium">Ký tự (vị trí {error.index}):</span> {error.char} 
                                <span className="mx-1">|</span>
                                <span className="font-medium">Phát âm đúng:</span> {error.expected_pinyin}
                                <span className="mx-1">|</span>
                                <span className="font-medium">Phát âm của bạn:</span> {error.spoken_pinyin} ({error.spoken_char})
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhấn để xem chi tiết
                          </span>
                          <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                        </div> */}
                      </motion.div>
                    )}

                    {/* Missing Characters */}
                    {item.data.missing_chars && item.data.missing_chars.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                            Ký tự thiếu ({item.data.missing_chars.length})
                          </h4>
                        </div>
                        <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {item.data.missing_chars.map((missing, index) => (
                              <li key={index} className={`text-xs ${themeClasses.text}`}>
                                <span className="font-medium">Ký tự (vị trí {missing.index}):</span> {missing.char}
                                <div><span className="font-medium">Pinyin:</span> {missing.expected_pinyin}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhấn để xem chi tiết
                          </span>
                          <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                        </div> */}
                      </motion.div>
                    )}

                    {/* Extra Characters */}
                    {item.data.extra_chars && item.data.extra_chars.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${themeClasses.card} rounded-xl p-4 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                            Ký tự dư ({item.data.extra_chars.length})
                          </h4>
                        </div>
                        <div className={`text-sm ${themeClasses.text} leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {item.data.extra_chars.map((extra, index) => (
                              <li key={index} className={`text-xs ${themeClasses.text}`}>
                                <span className="font-medium">Ký tự (vị trí {extra.index}):</span> {extra.char}
                                <div><span className="font-medium">Pinyin:</span> {extra.spoken_pinyin}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhấn để xem chi tiết
                          </span>
                          <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                        </div> */}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setExpandedHistory(null)}
                  className={`px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
              aria-modal="true"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`p-6 rounded-2xl ${themeClasses.modal} max-w-md w-full mx-4 shadow-xl border max-h-[80vh] overflow-y-auto ${themeClasses.scrollbar}`}
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
                  Bạn có chắc muốn xóa toàn bộ lịch sử phát âm? Hành động này không thể hoàn tác.
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
         <AnimatePresence>
          {showSampleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-labelledby="sample-text-title"
              aria-modal="true"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`${themeClasses.modal} rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl border`}
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <h3 id="sample-text-title" className={`text-lg font-semibold ${themeClasses.text} flex items-center`}>
                      <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
                      Chọn văn bản mẫu {hskLevels.find(h => h.level === selectedHSKLevel)?.name}
                    </h3>
                    <button
                      onClick={() => setShowSampleModal(false)}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                      aria-label="Đóng"
                    >
                      <X className={`h-5 w-5 ${themeClasses.text}`} />
                    </button>
                  </div>
                  <p className={`text-sm ${themeClasses.subtext} mt-2`}>
                    Chọn một văn bản phù hợp với trình độ của bạn để luyện tập phát âm.
                  </p>
                </div>
                
                <div className={`p-6 overflow-y-auto max-h-[60vh] ${themeClasses.scrollbar}`}>
                  {isLoadingSamples ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
                      <span className={themeClasses.subtext}>Đang tải văn bản mẫu...</span>
                    </div>
                  ) : sampleTexts.length > 0 ? (
                    <div className="grid gap-4">
                      {sampleTexts.map((sample) => (
                        <motion.div
                          key={sample.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${themeClasses.card} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700`}
                          onClick={() => handleSelectSampleText(sample)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 w-2 h-2 rounded-full mr-2"></span>
                              {sample.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${themeMode === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'}`}>
                              {hskLevels.find(h => h.level === sample.level)?.name}
                            </span>
                          </div>
                          <p className={`${themeClasses.text} text-sm leading-relaxed p-3 rounded-lg ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                            {sample.content}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              Nhấn để chọn văn bản này
                            </span>
                            <ChevronDown className={`h-4 w-4 ${themeClasses.subtext} transform rotate-[-90deg]`} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className={`h-12 w-12 ${themeClasses.subtext} mx-auto mb-3`} />
                      <p className={`text-sm ${themeClasses.subtext} mb-4`}>
                        Không có văn bản mẫu cho cấp độ này.
                      </p>
                      <button
                        onClick={() => fetchSampleTexts(selectedHSKLevel)}
                        className={`flex items-center justify-center mx-auto space-x-2 px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Thử lại</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowSampleModal(false)}
                      className={`px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => fetchSampleTexts(selectedHSKLevel)}
                      disabled={isLoadingSamples}
                      className={`px-4 py-2 ${themeClasses.button} rounded-xl transition-all duration-300 flex items-center ${isLoadingSamples ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw size={16} className={`mr-1 ${isLoadingSamples ? 'animate-spin' : ''}`} />
                      Tải lại
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
// import { useState } from 'react';
// import Cookies from 'js-cookie';
// import { toast } from 'react-toastify';
// import { useAudio } from '../lib/useAudio';
// import { useHistory } from '../lib/useHistory';

// export default function RecordSection() {
//   const { 
//     isRecording, 
//     audioText, 
//     pronunciationResult, 
//     recordingMessage, 
//     recordingTime, 
//     isProcessing, 
//     userId, 
//     startRecording, 
//     stopRecording 
//   } = useAudio();
//   const { getHistoryByType } = useHistory( "record");
//   const history = getHistoryByType('audio_translate').concat(getHistoryByType('pronunciation_check'));
//   const [textInput, setTextInput] = useState('');
//   const [file, setFile] = useState<File | null>(null);

//   const handleUploadText = async () => {
//     const formData = new FormData();
//     if (file) {
//       formData.append('file', file);
//     } else if (textInput) {
//       formData.append('text', textInput);
//     } else {
//       alert('Please provide text or a file.');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:8002/upload_text', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//         body: formData,
//       });
//       const result = await response.json();
//       setTextInput(result.text);
//       toast.success('Text uploaded successfully.');
//       // alert('Text uploaded successfully.');
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error(`Failed to upload text: error`);
   
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const secs = seconds.toString().padStart(2, '0');
//     return `00:${secs}`;
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-semibold mb-4 text-blue-700">Record</h2>

//       {/* Thông báo và bộ đếm thời gian */}
//       {recordingMessage && (
//         <div className="bg-blue-100 border-l-4 border-blue-600 text-blue-700 p-3 rounded-lg mb-4">
//           <p className="font-medium">{recordingMessage}</p>
//           <p className="font-mono text-sm">
//             Thời gian: {formatTime(recordingTime)} / 00:30
//           </p>
//         </div>
//       )}

//       {/* Trạng thái loading */}
//       {isProcessing && (
//         <div className="flex items-center bg-gray-100 p-3 rounded-lg mb-4">
//           <svg
//             className="animate-spin h-5 w-5 mr-2 text-blue-600"
//             viewBox="0 0 24 24"
//           >
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             />
//           </svg>
//           <span className="text-gray-700">Đang xử lý...</span>
//         </div>
//       )}

//       {/* Upload văn bản */}
//       <div className="mb-6">
//         <h3 className="text-lg font-semibold mb-1">Upload file or type chinese content</h3>
//         <p className="text-sm text-gray-500 mb-1">Type of upload txt, pdf.</p>
//         <textarea
//           className="w-full p-2 border rounded-lg mb-2"
//           placeholder="Nhập văn bản tiếng Trung..."
//           value={textInput}
//           onChange={(e) => setTextInput(e.target.value)}
//         />
//         <input
//           type="file"
//           accept=".txt,.pdf"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//           className="mb-2"
//         />
//         <button
//           onClick={handleUploadText}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Tải lên văn bản
//         </button>
//       </div>

//       {/* Thu âm */}
//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={() => startRecording('translate')}
//           disabled={isRecording}
//           className={`px-6 py-3 rounded-lg ${
//             isRecording ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
//           } text-white transition`}
//         >
//           Thu âm để dịch
//         </button>
//         <button
//           onClick={() => startRecording('pronunciation', textInput)}
//           disabled={isRecording || !textInput}
//           className={`px-6 py-3 rounded-lg ${
//             isRecording || !textInput ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
//           } text-white transition`}
//         >
//           Thu âm để kiểm tra phát âm
//         </button>
//         <button
//           onClick={stopRecording}
//           disabled={!isRecording}
//           className={`px-6 py-3 rounded-lg ${
//             !isRecording ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
//           } text-white transition`}
//         >
//           Ngừng
//         </button>
//       </div>

//       {/* Kết quả dịch */}
//       {audioText && (
//         <div className="p-4 bg-gray-50 rounded-lg mb-6">
//           <p><strong>Gốc:</strong> {audioText.original_text}</p>
//           <p><strong>Pinyin:</strong> {audioText.pinyin}</p>
//           <p><strong>Dịch:</strong> {audioText.translated_text}</p>
//           <audio controls src={`data:audio/mp3;base64,${audioText.audio}`} className="mt-2" />
//         </div>
//       )}

//       {/* Kết quả kiểm tra phát âm */}
//       {pronunciationResult && (
//         <div className="p-4 bg-gray-50 rounded-lg mb-6 max-h-64 overflow-y-auto space-y-4">
//           <p><strong>Văn bản gốc:</strong> {pronunciationResult.original_text}</p>
//           <p><strong>Văn bản nói:</strong> {pronunciationResult.spoken_text}</p>
//           <p><strong>Độ chính xác:</strong> {pronunciationResult.accuracy.toFixed(2)}%</p>
//           <div>
//             <strong>Hiển thị:</strong>
//             <div dangerouslySetInnerHTML={{ __html: pronunciationResult.highlighted_text }} />
//           </div>
//           {pronunciationResult.errors.length > 0 && (
//             <div>
//               <strong>Lỗi:</strong>
//               <ul>
//                 {pronunciationResult.errors.map((error: any, index: number) => (
//                   <li key={index}>
//                     Ký tự: {error.char}, Pinyin mong đợi: {error.expected_pinyin}, Pinyin nói: {error.spoken_pinyin}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Lịch sử */}
//       <h3 className="text-xl font-semibold mb-2 text-gray-800">Lịch sử</h3>
//       <div className="max-h-64 overflow-y-auto space-y-4">
//         {history.length > 0 ? (
//           history.map((item: any) => (
//             <div key={item.id} className="p-4 bg-gray-100 rounded-lg">
//               <p className="text-sm text-gray-500">{item.timestamp}</p>
//               {item.type === 'audio_translate' && (
//                 <>
//                   <p><strong>Gốc:</strong> {item.data.original_text}</p>
//                   <p><strong>Pinyin:</strong> {item.data.pinyin}</p>
//                   <p><strong>Dịch:</strong> {item.data.translated_text}</p>
//                   <audio controls autoPlay src={`data:audio/mp3;base64,${item.data.audio_b64}`} className="mt-2" />
//                 </>
//               )}
//               {item.type === 'pronunciation_check' && (
//                 <>
//                   <p><strong>Văn bản gốc:</strong> {item.data.original_text}</p>
//                   <p><strong>Văn bản nói:</strong> {item.data.spoken_text}</p>
//                   <p><strong>Độ chính xác:</strong> {item.data.accuracy.toFixed(2)}%</p>
//                   <div>
//                     <strong>Hiển thị:</strong>
//                     <div dangerouslySetInnerHTML={{ __html: item.data.highlighted_text }} />
//                   </div>
//                 </>
//               )}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">Chưa có lịch sử.</p>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import { useAudio } from '../lib/useAudio';
// import { useHistory } from '../lib/useHistory';

// export default function RecordSection() {
//   const { 
//     isRecording, 
//     audioText, 
//     pronunciationResult, 
//     recordingMessage, 
//     recordingTime, 
//     isProcessing, 
//     userId, 
//     startRecording, 
//     stopRecording,
//     queueStatus // Thêm trạng thái hàng đợi
//   } = useAudio();
//   const { getHistoryByType } = useHistory("record");
//   const history = getHistoryByType('audio_translate').concat(getHistoryByType('pronunciation_check'));
//   const [textInput, setTextInput] = useState('');
//   const [file, setFile] = useState<File | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   // Xử lý upload văn bản
//   const handleUploadText = async () => {
//     setErrorMessage(null);
//     const formData = new FormData();
//     if (file) {
//       formData.append('file', file);
//     } else if (textInput) {
//       formData.append('text', textInput);
//     } else {
//       setErrorMessage('Vui lòng cung cấp văn bản hoặc tệp.');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:8000/upload_text', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//         body: formData,
//       });
//       if (!response.ok) throw new Error('Upload failed');
//       const result = await response.json();
//       setTextInput(result.text);
//       alert('Tải lên văn bản thành công.');
//     } catch (error) {
//       console.error('Upload error:', error);
//       setErrorMessage('Tải lên văn bản thất bại.');
//     }
//   };

//   // Định dạng thời gian
//   const formatTime = (seconds: number) => {
//     const secs = seconds.toString().padStart(2, '0');
//     return `00:${secs}`;
//   };

//   // Xử lý lỗi timeout hoặc hàng đợi
//   useEffect(() => {
//     if (pronunciationResult?.error) {
//       setErrorMessage(pronunciationResult.error);
//     }
//   }, [pronunciationResult]);

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-semibold mb-4 text-blue-700">Thu âm</h2>

//       {/* Thông báo lỗi */}
//       {errorMessage && (
//         <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-3 rounded-lg mb-4">
//           <p className="font-medium">Lỗi: {errorMessage}</p>
//         </div>
//       )}

//       {/* Trạng thái hàng đợi */}
//       {queueStatus && (
//         <div className="bg-yellow-100 border-l-4 border-yellow-600 text-yellow-700 p-3 rounded-lg mb-4">
//           <p className="font-medium">Hàng đợi: {queueStatus.pending} yêu cầu đang chờ xử lý.</p>
//           <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
//             <div
//               className="bg-yellow-600 h-2.5 rounded-full"
//               style={{ width: `${Math.min((queueStatus.pending / 5) * 100, 100)}%` }}
//             ></div>
//           </div>
//         </div>
//       )}

//       {/* Thông báo và bộ đếm thời gian */}
//       {recordingMessage && (
//         <div className="bg-blue-100 border-l-4 border-blue-600 text-blue-700 p-3 rounded-lg mb-4">
//           <p className="font-medium">{recordingMessage}</p>
//           <p className="font-mono text-sm">
//             Thời gian: {formatTime(recordingTime)} / 00:15
//           </p>
//         </div>
//       )}

//       {/* Trạng thái xử lý */}
//       {isProcessing && (
//         <div className="flex items-center bg-gray-100 p-3 rounded-lg mb-4">
//           <svg
//             className="animate-spin h-5 w-5 mr-2 text-blue-600"
//             viewBox="0 0 24 24"
//           >
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             />
//           </svg>
//           <span className="text-gray-700">Đang xử lý...</span>
//         </div>
//       )}

//       {/* Upload văn bản */}
//       <div className="mb-6">
//         <h3 className="text-lg font-semibold mb-1">Tải lên văn bản hoặc nhập nội dung tiếng Trung</h3>
//         <p className="text-sm text-gray-500 mb-1">Hỗ trợ định dạng txt, pdf.</p>
//         <textarea
//           className="w-full p-2 border rounded-lg mb-2"
//           placeholder="Nhập văn bản tiếng Trung..."
//           value={textInput}
//           onChange={(e) => setTextInput(e.target.value)}
//         />
//         <input
//           type="file"
//           accept=".txt,.pdf"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//           className="mb-2"
//         />
//         <button
//           onClick={handleUploadText}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Tải lên văn bản
//         </button>
//       </div>

//       {/* Thu âm */}
//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={() => startRecording('translate')}
//           disabled={isRecording || queueStatus?.pending > 5}
//           className={`px-6 py-3 rounded-lg ${
//             isRecording || queueStatus?.pending > 5 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
//           } text-white transition`}
//         >
//           Thu âm để dịch
//         </button>
//         <button
//           onClick={() => startRecording('pronunciation', textInput)}
//           disabled={isRecording || !textInput || queueStatus?.pending > 5}
//           className={`px-6 py-3 rounded-lg ${
//             isRecording || !textInput || queueStatus?.pending > 5 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
//           } text-white transition`}
//         >
//           Thu âm để kiểm tra phát âm
//         </button>
//         <button
//           onClick={stopRecording}
//           disabled={!isRecording}
//           className={`px-6 py-3 rounded-lg ${
//             !isRecording ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
//           } text-white transition`}
//         >
//           Ngừng
//         </button>
//       </div>

//       {/* Kết quả dịch */}
//       {audioText && (
//         <div className="p-4 bg-gray-50 rounded-lg mb-6">
//           <p><strong>Gốc:</strong> {audioText.original_text}</p>
//           <p><strong>Pinyin:</strong> {audioText.pinyin}</p>
//           <p><strong>Dịch:</strong> {audioText.translated_text}</p>
//           <audio controls src={`data:audio/mp3;base64,${audioText?.audio}`} className="mt-2" />
//         </div>
//       )}

//       {/* Kết quả kiểm tra phát âm */}
//       {pronunciationResult && !pronunciationResult.error && (
//         <div className="p-4 bg-gray-50 rounded-lg mb-6">
//           <p><strong>Văn bản gốc:</strong> {pronunciationResult.original_text}</p>
//           <p><strong>Văn bản nói:</strong> {pronunciationResult.spoken_text}</p>
//           <p><strong>Độ chính xác:</strong> {pronunciationResult.accuracy.toFixed(2)}%</p>
//           {pronunciationResult.note && (
//             <p className="text-yellow-600"><strong>Ghi chú:</strong> {pronunciationResult.note}</p>
//           )}
//           <div>
//             <strong>Hiển thị:</strong>
//             <div dangerouslySetInnerHTML={{ __html: pronunciationResult.highlighted_text }} />
//           </div>
//           {pronunciationResult.errors.length > 0 && (
//             <div>
//               <strong>Lỗi phát âm:</strong>
//               <ul>
//                 {pronunciationResult.errors.map((error: any, index: number) => (
//                   <li key={index}>
//                     Ký tự: {error.char}, Pinyin mong đợi: {error.expected_pinyin}, Pinyin nói: {error.spoken_pinyin}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           {pronunciationResult.missing_chars.length > 0 && (
//             <div>
//               <strong>Ký tự thiếu:</strong>
//               <ul>
//                 {pronunciationResult.missing_chars.map((missing: any, index: number) => (
//                   <li key={index}>
//                     Ký tự: {missing.char}, Pinyin: {missing.expected_pinyin}
//                     {missing.sample_audio && (
//                       <audio controls src={`data:audio/mp3;base64,${missing.sample_audio}`} className="ml-2" />
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           {pronunciationResult.tone_errors.length > 0 && (
//             <div>
//               <strong>Lỗi thanh điệu:</strong>
//               <ul>
//                 {pronunciationResult.tone_errors.map((tone: any, index: number) => (
//                   <li key={index}>
//                     Ký tự: {tone.char}, Pinyin mong đợi: {tone.expected_pinyin}, Pinyin nói: {tone.spoken_pinyin}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Lịch sử */}
//       <h3 className="text-xl font-semibold mb-2 text-gray-800">Lịch sử</h3>
//       <div className="max-h-64 overflow-y-auto space-y-4">
//         {history.length > 0 ? (
//           history.map((item: any) => (
//             <div key={item.id} className="p-4 bg-gray-100 rounded-lg">
//               <p className="text-sm text-gray-500">{item.timestamp}</p>
//               {item.type === 'audio_translate' && (
//                 <>
//                   <p><strong>Gốc:</strong> {item.data.original_text}</p>
//                   <p><strong>Pinyin:</strong> {item.data.pinyin}</p>
//                   <p><strong>Dịch:</strong> {item.data.translated_text}</p>
//                   <audio controls src={`data:audio/mp3;base64,${item.data.audio_b64}`} className="mt-2" />
//                 </>
//               )}
//               {item.type === 'pronunciation_check' && (
//                 <>
//                   <p><strong>Văn bản gốc:</strong> {item.data.original_text}</p>
//                   <p><strong>Văn bản nói:</strong> {item.data.spoken_text}</p>
//                   <p><strong>Độ chính xác:</strong> {item.data.accuracy.toFixed(2)}%</p>
//                   <div>
//                     <strong>Hiển thị:</strong>
//                     <div dangerouslySetInnerHTML={{ __html: item.data.highlighted_text }} />
//                   </div>
//                 </>
//               )}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">Chưa có lịch sử.</p>
//         )}
//       </div>
//     </div>
//   );
// }