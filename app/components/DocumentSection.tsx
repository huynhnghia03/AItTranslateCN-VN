// "use client";
// import { useState, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import { useHistory } from '../lib/useHistory';
// import { toast } from 'react-toastify';
// import { Sparkles, Upload, FileText, History, Download, Moon, Sun, Clock, ChevronDown, Trash2, RotateCcw, CheckCircle2, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const fontStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');
// `;

// interface TranslatedResult {
//   original_text: string;
//   translated_text: string;
//   file_name: string;
//   translated_file_name: string;
//   formatting_preserved: boolean;
//   ocr_used: boolean;
// }

// interface OCRStatus {
//   ocr_available: boolean;
//   supported_languages: string[];
//   max_file_size_mb: number;
//   supported_formats: string[];
// }

// interface HistoryItem {
//   id: string;
//   type: 'document_translate' | 'image_ocr' | 'image_translate';
//   timestamp: string;
//   data: {
//     file_name: string;
//     original_text: string;
//     translated_text: string;
//     translated_file_name: string;
//     ocr_results?: Array<{ text: string; bbox: number[]; confidence: number }>;
//     preserve_layout?: boolean;
//   };
// }

// export default function DocumentSection() {
//   const [documentFile, setDocumentFile] = useState<File | null>(null);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [progress, setProgress] = useState<number>(0);
//   const [translatedResult, setTranslatedResult] = useState<TranslatedResult | null>(null);
//   const [preserveFormatting, setPreserveFormatting] = useState<boolean>(true);
//   const [useOCR, setUseOCR] = useState<boolean>(true);
//   const [ocrStatus, setOcrStatus] = useState<OCRStatus | null>(null);
//   const [targetLanguage, setTargetLanguage] = useState<string>('vi');
//   const { getHistoryByType, fetchHistory } = useHistory("document");
//   const history: HistoryItem[] = getHistoryByType('document_translate');
//   const imageHistory: HistoryItem[] = getHistoryByType('image_translate');
//   const ocrHistory: HistoryItem[] = getHistoryByType('image_ocr');
//   const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
//   const [isDragging, setIsDragging] = useState<boolean>(false);
//   const [historyOpen, setHistoryOpen] = useState<boolean>(false);
//   const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
//   const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
//   const [activeTab, setActiveTab] = useState<'document' | 'image'>('document');

//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isProcessing) {
//       interval = setInterval(() => {
//         setProgress((prev) => {
//           if (prev >= 90) return prev;
//           return prev + 10;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isProcessing]);

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('document-theme');
//     if (savedTheme) {
//       setThemeMode(savedTheme as 'light' | 'dark');
//     }
//     fetchOCRStatus();
//   }, []);

//   const fetchOCRStatus = async () => {
//     try {
//       const response = await fetch('http://localhost:8003/ocr_status', {
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//       });
//       if (!response.ok) throw new Error('Failed to fetch OCR status');
//       const data = await response.json();
//       setOcrStatus(data);
//       setUseOCR(data.ocr_available);
//     } catch (error: any) {
//       console.error('OCR status error:', error);
//       toast.error('Failed to fetch OCR status');
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       validateAndSetFile(file);
//     }
//   };

//   const validateAndSetFile = (file: File) => {
//     if (file.size > (ocrStatus?.max_file_size_mb || 10) * 1024 * 1024) {
//       toast.error(`File vượt quá giới hạn ${ocrStatus?.max_file_size_mb || 10}MB!`);
//       return;
//     }
//     setDocumentFile(file);
//     setFileName(file.name);
//     setTranslatedResult(null);
//     setProgress(0);
//   };

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       validateAndSetFile(file);
//     }
//   };

//   const toggleHistoryVisibility = () => {
//     setIsHistoryVisible(!isHistoryVisible);
//     setHistoryOpen(!historyOpen);
//   };

//   const handleProcessDocument = async () => {
//     if (!documentFile) {
//       toast.error('Vui lòng chọn file để dịch!');
//       return;
//     }

//     setIsProcessing(true);
//     setProgress(0);
//     try {
//       const formData = new FormData();
//       formData.append('file', documentFile);
//       formData.append('preserve_formatting', preserveFormatting.toString());
//       const response = await fetch('http://localhost:8003/translate_document', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Xử lý thất bại: ${errorText}`);
//       }
//       const result = await response.json();
//       setTranslatedResult({
//         original_text: result.original_text,
//         translated_text: result.translated_text,
//         file_name: result.file_name,
//         translated_file_name: result.translated_file_name,
//         formatting_preserved: result.formatting_preserved,
//         ocr_used: result.ocr_used,
//       });
//       setProgress(100);
//       toast.success('Dịch tài liệu thành công!');
//       if (result.translated_file_name) {
//         await downloadTranslatedFile(result.translated_file_name);
//       }
//       await fetchHistory('document_translate');
//     } catch (error: any) {
//       console.error('Document translation error:', error);
//       toast.error(`Dịch tài liệu thất bại: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleProcessImage = async () => {
//     if (!documentFile) {
//       toast.error('Vui lòng chọn file ảnh để xử lý!');
//       return;
//     }

//     setIsProcessing(true);
//     setProgress(0);
//     try {
//       const formData = new FormData();
//       formData.append('file', documentFile);
//       formData.append('target_language', targetLanguage);
//       formData.append('preserve_layout', preserveFormatting.toString());
//       const response = await fetch('http://localhost:8003/translate_with_ocr', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Xử lý thất bại: ${errorText}`);
//       }
//       const result = await response.json();
//       setTranslatedResult({
//         original_text: result.original_text,
//         translated_text: result.translated_text,
//         file_name: result.file_name,
//         translated_file_name: result.result_file_name,
//         formatting_preserved: result.layout_preserved,
//         ocr_used: true,
//       });
//       setProgress(100);
//       toast.success('Dịch ảnh thành công!');
//       if (result.result_file_name) {
//         await downloadTranslatedFile(result.result_file_name);
//       }
//       await fetchHistory('image_translate');
//     } catch (error: any) {
//       console.error('Image translation error:', error);
//       toast.error(`Dịch ảnh thất bại: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const downloadTranslatedFile = async (file_name: string) => {
//     try {
//       const response = await fetch(`http://localhost:8003/download/${encodeURIComponent(file_name)}`, {
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//       });
//       if (!response.ok) {
//         throw new Error('Không thể tải file.');
//       }
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = file_name;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success('Tải file dịch thành công!');
//     } catch (error) {
//       console.error('Download error:', error);
//       toast.error('Không thể tải file dịch!');
//     }
//   };

//   const handleDeleteHistory = async (id: string, type: string) => {
//     try {
//       const response = await fetch(`http://localhost:8003/history/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//       });
//       if (!response.ok) {
//         throw new Error('Xóa lịch sử thất bại');
//       }
//       await fetchHistory(type);
//       toast.success('Xóa lịch sử thành công!');
//     } catch (error: any) {
//       console.error('Delete history error:', error);
//       toast.error(`Xóa lịch sử thất bại: ${error.message}`);
//     }
//   };

//   const confirmClearHistory = async () => {
//     try {
//       const response = await fetch('http://localhost:8003/history', {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//       });
//       if (!response.ok) {
//         throw new Error('Xóa tất cả lịch sử thất bại');
//       }
//       await fetchHistory('document_translate');
//       await fetchHistory('image_translate');
//       await fetchHistory('image_ocr');
//       toast.success('Xóa tất cả lịch sử thành công!');
//       setShowConfirmClear(false);
//     } catch (error: any) {
//       console.error('Clear history error:', error);
//       toast.error(`Xóa tất cả lịch sử thất bại: ${error.message}`);
//     }
//   };

//   const toggleTheme = (): void => {
//     const newTheme = themeMode === 'light' ? 'dark' : 'light';
//     setThemeMode(newTheme);
//     localStorage.setItem('document-theme', newTheme);
//   };

//   const formatTimestamp = (timestamp: string): string => {
//     return new Date(timestamp).toLocaleString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const themeClasses = {
//     background: themeMode === 'light' 
//       ? 'from-indigo-50 via-fuchsia-50 to-purple-50' 
//       : 'from-gray-900 via-indigo-950 to-purple-950',
//     text: themeMode === 'light' ? 'text-gray-800' : 'text-gray-100',
//     subtext: themeMode === 'light' ? 'text-gray-600' : 'text-gray-400',
//     header: themeMode === 'light' 
//       ? 'from-white/80 to-indigo-50/80 text-indigo-950 border-indigo-100/30' 
//       : 'from-slate-900/80 to-indigo-950/80 text-indigo-200 border-indigo-500/20',
//     card: themeMode === 'light'
//       ? 'bg-white/60 backdrop-blur-md shadow-xl'
//       : 'bg-gray-800/60 backdrop-blur-md shadow-xl',
//     input: themeMode === 'light' 
//       ? 'bg-gradient-to-br from-gray-100/80 to-indigo-50/80 focus:ring-indigo-500' 
//       : 'bg-gradient-to-br from-gray-800/80 to-indigo-900/80 text-white focus:ring-purple-500',
//     button: themeMode === 'light'
//       ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
//       : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
//     secondaryButton: themeMode === 'light'
//       ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
//       : 'bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700',
//     disabledButton: themeMode === 'light'
//       ? 'bg-gray-300 cursor-not-allowed'
//       : 'bg-gray-700 cursor-not-allowed',
//     result: themeMode === 'light'
//       ? 'from-white/90 to-indigo-50/90 text-gray-800'
//       : 'from-gray-800/90 to-indigo-900/90 text-gray-100',
//     progress: themeMode === 'light'
//       ? 'from-indigo-500 to-purple-500'
//       : 'from-indigo-600 to-purple-600',
//     dropzone: themeMode === 'light'
//       ? 'bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100/80'
//       : 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-800/30',
//     activeDropzone: themeMode === 'light'
//       ? 'bg-indigo-100 border-indigo-400'
//       : 'bg-indigo-800/50 border-indigo-500',
//     tabActive: themeMode === 'light'
//       ? 'bg-indigo-500 text-white'
//       : 'bg-indigo-600 text-white',
//     tabInactive: themeMode === 'light'
//       ? 'bg-white/50 text-gray-700 hover:bg-indigo-100'
//       : 'bg-gray-800/50 text-gray-200 hover:bg-indigo-900',
//   };

//   return (
//     <div className={`h-full rounded-xl ${themeClasses.background} font-sans antialiased relative transition-colors duration-300`}>
//       <style>{fontStyles}</style>
      
//       <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
//         <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-purple-500/5 transition-all duration-1000`} />
//         <div className="absolute top-0 left-0 w-full h-full">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-purple-400/10 to-transparent rounded-full filter blur-xl animate-blob" />
//           <div className="absolute top-3/4 right-1/3 w-80 h-80 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-2000" />
//           <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-radial from-fuchsia-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-4000" />
//         </div>
//       </div>

//       <div className="container mx-auto px-4 lg:px-8 py-8 relative z-1">
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className={`p-4 backdrop-blur-xl bg-gradient-to-r ${themeClasses.header} rounded-2xl shadow-lg shadow-indigo-500/5 flex justify-between items-center z-20 transition-all duration-300 mb-8 sticky top-4`}
//         >
//           <div className="flex items-center space-x-3">
//             <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
//               <FileText className="h-6 w-6 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 tracking-tight">
//               Dịch Tài Liệu & Ảnh
//             </h2>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-full backdrop-blur-md bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300 shadow-sm"
//               title={themeMode === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
//               aria-label={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
//             >
//               {themeMode === 'light' ? (
//                 <Moon size={20} className="text-indigo-600" />
//               ) : (
//                 <Sun size={20} className="text-indigo-400" />
//               )}
//             </button>
//             <button
//               onClick={toggleHistoryVisibility}
//               className={`p-2 rounded-full backdrop-blur-md ${historyOpen ? 'bg-indigo-500/30' : 'bg-indigo-500/10'} hover:bg-indigo-500/20 transition-all duration-300 shadow-sm flex items-center gap-1 sm:gap-2`}
//               title="Lịch sử dịch"
//               aria-label={historyOpen ? 'Ẩn lịch sử dịch' : 'Hiện lịch sử dịch'}
//             >
//               <Clock size={20} className={`${historyOpen ? 'text-indigo-200' : themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
//               <span className={`hidden sm:inline text-sm font-medium ${historyOpen ? 'text-indigo-200' : themeMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
//                 Lịch sử
//               </span>
//             </button>
//           </div>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className={`rounded-xl ${themeClasses.card} p-4 mb-8`}
//         >
//           <div className="flex space-x-2 mb-4">
//             <button
//               className={`px-4 py-2 rounded-lg ${activeTab === 'document' ? themeClasses.tabActive : themeClasses.tabInactive} transition-all duration-300`}
//               onClick={() => {
//                 setActiveTab('document');
//                 setDocumentFile(null);
//                 setFileName(null);
//                 setTranslatedResult(null);
//               }}
//             >
//               Dịch Tài Liệu
//             </button>
//             <button
//               className={`px-4 py-2 rounded-lg ${activeTab === 'image' ? themeClasses.tabActive : themeClasses.tabInactive} transition-all duration-300`}
//               onClick={() => {
//                 setActiveTab('image');
//                 setDocumentFile(null);
//                 setFileName(null);
//                 setTranslatedResult(null);
//               }}
//             >
//               Dịch Ảnh
//             </button>
//           </div>

//           <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
//             {activeTab === 'document' ? 'Tải lên Tài liệu' : 'Tải lên Ảnh'}
//           </h3>
//           <p className={`${themeClasses.subtext} text-sm mb-3`}>
//             {activeTab === 'document'
//               ? `Hỗ trợ các định dạng: ${ocrStatus?.supported_formats.join(', ') || '.pdf, .txt, .srt'} (Tối đa ${ocrStatus?.max_file_size_mb || 10}MB)`
//               : `Hỗ trợ các định dạng ảnh: .png, .jpg, .jpeg (Tối đa ${ocrStatus?.max_file_size_mb || 10}MB)`}
//           </p>
//           <div 
//             className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
//               isDragging ? themeClasses.activeDropzone : themeClasses.dropzone
//             }`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <Upload className={`w-10 h-10 mx-auto mb-3 ${themeClasses.text} opacity-70`} />
//             <p className={`${themeClasses.text} font-medium mb-2`}>Kéo & thả file hoặc</p>
//             <div className="relative">
//               <input
//                 type="file"
//                 accept={activeTab === 'document' ? '.pdf,.txt,.srt' : '.png,.jpg,.jpeg'}
//                 onChange={handleFileChange}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 disabled={isProcessing}
//               />
//               <button
//                 className={`px-4 py-2 rounded-lg ${themeClasses.button} text-white`}
//                 disabled={isProcessing}
//               >
//                 Chọn file
//               </button>
//             </div>
//           </div>

//           {fileName && (
//             <div className={`mt-4 p-3 sm:p-4 bg-gradient-to-br ${themeClasses.result} rounded-xl shadow-md animate-fade-in`}>
//               <p className="text-sm break-all"><strong>File đã chọn:</strong> {fileName}</p>
//             </div>
//           )}

//           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <label className={`flex items-center space-x-2 ${themeClasses.text}`}>
//               <input
//                 type="checkbox"
//                 checked={preserveFormatting}
//                 onChange={(e) => setPreserveFormatting(e.target.checked)}
//                 className="rounded text-indigo-500 focus:ring-indigo-500"
//                 disabled={isProcessing}
//               />
//               <span>Giữ định dạng</span>
//             </label>
//             {activeTab === 'image' && (
//               <div className="flex items-center space-x-2">
//                 <label className={`${themeClasses.text}`}>Ngôn ngữ đích:</label>
//                 <select
//                   value={targetLanguage}
//                   onChange={(e) => setTargetLanguage(e.target.value)}
//                   className={`p-2 rounded-lg ${themeClasses.input} focus:outline-none`}
//                   disabled={isProcessing}
//                 >
//                   {ocrStatus?.supported_languages.map((lang) => (
//                     <option key={lang} value={lang}>
//                       {lang === 'vi' ? 'Tiếng Việt' : lang === 'en' ? 'Tiếng Anh' : lang}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//             {activeTab === 'document' && ocrStatus?.ocr_available && (
//               <label className={`flex items-center space-x-2 ${themeClasses.text}`}>
//                 <input
//                   type="checkbox"
//                   checked={useOCR}
//                   onChange={(e) => setUseOCR(e.target.checked)}
//                   className="rounded text-indigo-500 focus:ring-indigo-500"
//                   disabled={isProcessing}
//                 />
//                 <span>Sử dụng OCR</span>
//               </label>
//             )}
//           </div>

//           {isProcessing && (
//             <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 sm:h-3 my-4 overflow-hidden">
//               <div
//                 className={`bg-gradient-to-r ${themeClasses.progress} h-full rounded-full transition-all duration-500`}
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           )}

//           <button
//             onClick={activeTab === 'document' ? handleProcessDocument : handleProcessImage}
//             disabled={!documentFile || isProcessing}
//             className={`w-full px-4 py-3 rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] mt-4 flex items-center justify-center ${
//               documentFile && !isProcessing
//                 ? themeClasses.button
//                 : themeClasses.disabledButton
//             }`}
//           >
//             {isProcessing ? 'Đang xử lý...' : activeTab === 'document' ? 'Bắt đầu dịch' : 'Dịch ảnh'}
//           </button>
//         </motion.div>

//         {translatedResult && (
//           <div className={`p-4 sm:p-5 bg-gradient-to-br ${themeClasses.result} backdrop-blur-md rounded-xl shadow-lg animate-slide-in mt-4`}>
//             <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>Kết quả Dịch</h3>
//             <p className="text-sm break-all mb-2"><strong>File gốc:</strong> {translatedResult.file_name}</p>
//             <p className="text-sm break-all mb-2"><strong>File dịch:</strong> {translatedResult.translated_file_name}</p>
//             <p className="text-sm break-all mb-2"><strong>Giữ định dạng:</strong> {translatedResult.formatting_preserved ? 'Có' : 'Không'}</p>
//             <p className="text-sm break-all mb-2"><strong>Sử dụng OCR:</strong> {translatedResult.ocr_used ? 'Có' : 'Không'}</p>
//             {activeTab === 'image' && translatedResult.translated_file_name && (
//               <img
//                 src={`data:image/png;base64,${translatedResult.translated_text}`}
//                 alt="Translated image"
//                 className="max-w-full h-auto rounded-lg mt-3"
//               />
//             )}
//             {translatedResult.translated_file_name && (
//               <button
//                 onClick={() => downloadTranslatedFile(translatedResult.translated_file_name)}
//                 className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 mt-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
//               >
//                 <Download size={16} />
//                 <span>Tải file dịch</span>
//               </button>
//             )}
//           </div>
//         )}

//         <div className="lg:col-span-1 mt-8">
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ 
//               opacity: 1, 
//               scale: 1,
//               height: historyOpen ? 'auto' : '80px'
//             }}
//             transition={{ duration: 0.4 }}
//             className={`${themeClasses.card} rounded-2xl overflow-hidden transition-all duration-300`}
//           >
//             <div 
//               className="flex justify-between items-center p-5 cursor-pointer"
//               onClick={() => setHistoryOpen(!historyOpen)}
//             >
//               <div className="flex items-center">
//                 <Clock className={`h-5 w-5 mr-2 ${themeClasses.text}`} />
//                 <h3 className={`font-medium ${themeClasses.text}`}>Lịch sử Dịch</h3>
//               </div>
//               <ChevronDown 
//                 className={`h-5 w-5 ${themeClasses.text} transform transition-transform duration-300 ${historyOpen ? 'rotate-180' : ''}`} 
//               />
//             </div>
            
//             <AnimatePresence>
//               {historyOpen && (
//                 <motion.div 
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="px-5 pb-5"
//                 >
//                   <div className="flex justify-between items-center mb-4">
//                     <span className={`text-sm ${themeClasses.subtext}`}>
//                       {history.length + imageHistory.length + ocrHistory.length} bản ghi
//                     </span>
//                     {(history.length > 0 || imageHistory.length > 0 || ocrHistory.length > 0) && (
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmClear(true)}
//                         className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
//                         aria-label="Xóa tất cả lịch sử"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                         <span>Xóa tất cả</span>
//                       </button>
//                     )}
//                   </div>
//                   <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent">
//                     {(activeTab === 'document' ? history : imageHistory).map((item) => (
//                       <motion.div
//                         key={item.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className={`p-4 rounded-xl ${themeClasses.card}`}
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center space-x-2">
//                             <CheckCircle2 className="h-4 w-4 text-green-500" />
//                             <span className={`text-xs ${themeClasses.subtext}`}>
//                               {formatTimestamp(item.timestamp)}
//                             </span>
//                           </div>
//                         </div>
//                         <p className={`text-sm ${themeClasses.text}`}>
//                           <strong>File gốc:</strong> {item.data.file_name}
//                         </p>
//                         <p className={`text-sm ${themeClasses.text}`}>
//                           <strong>File dịch:</strong> {item.data.translated_file_name}
//                         </p>
//                         {item.type === 'image_translate' && item.data.preserve_layout && (
//                           <p className={`text-sm ${themeClasses.text}`}>
//                             <strong>Giữ bố cục:</strong> {item.data.preserve_layout ? 'Có' : 'Không'}
//                           </p>
//                         )}
//                         {item.type === 'image_ocr' && item.data.ocr_results && (
//                           <p className={`text-sm ${themeClasses.text}`}>
//                             <strong>Độ tin cậy trung bình:</strong> {(item.data.ocr_results.reduce((sum, r) => sum + r.confidence, 0) / item.data.ocr_results.length).toFixed(2)}
//                           </p>
//                         )}
//                         <div className="flex gap-4 mt-3">
//                           <a
//                             href={`http://localhost:8003/download/${encodeURIComponent(item.data.translated_file_name)}`}
//                             className={`flex items-center space-x-1 text-sm ${themeClasses.text} hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300`}
//                             onClick={async (e) => {
//                               e.preventDefault();
//                               await downloadTranslatedFile(item.data.translated_file_name);
//                             }}
//                             aria-label={`Tải xuống ${item.data.translated_file_name}`}
//                           >
//                             <Download className="h-4 w-4" />
//                             <span>Tải xuống</span>
//                           </a>
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteHistory(item.id, item.type)}
//                             className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
//                             aria-label={`Xóa lịch sử ${item.data.translated_file_name}`}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             <span>Xóa</span>
//                           </button>
//                         </div>
//                       </motion.div>
//                     ))}
//                     {activeTab === 'image' && ocrHistory.map((item) => (
//                       <motion.div
//                         key={item.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className={`p-4 rounded-xl ${themeClasses.card}`}
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center space-x-2">
//                             <CheckCircle2 className="h-4 w-4 text-green-500" />
//                             <span className={`text-xs ${themeClasses.subtext}`}>
//                               {formatTimestamp(item.timestamp)}
//                             </span>
//                           </div>
//                         </div>
//                         <p className={`text-sm ${themeClasses.text}`}>
//                           <strong>File gốc:</strong> {item.data.file_name}
//                         </p>
//                         <p className={`text-sm ${themeClasses.text}`}>
//                           <strong>Văn bản trích xuất:</strong> {item.data.original_text.slice(0, 100)}...
//                         </p>
//                         <p className={`text-sm ${themeClasses.text}`}>
//                           {/* <strong>Độ tin cậy trung bình:</strong> {(item.data.ocr_results?.reduce((sum, r) => sum + r.confidence, 0) / (item.data.ocr_results?.length || 1)).toFixed(2)} */}
//                         </p>
//                         <div className="flex gap-4 mt-3">
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteHistory(item.id, item.type)}
//                             className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm transition-all duration-300"
//                             aria-label={`Xóa lịch sử ${item.data.file_name}`}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             <span>Xóa</span>
//                           </button>
//                         </div>
//                       </motion.div>
//                     ))}
//                     {(activeTab === 'document' ? history : imageHistory).length === 0 && (activeTab === 'image' ? ocrHistory : []).length === 0 && (
//                       <div className="text-center py-4">
//                         <p className={`text-sm ${themeClasses.subtext} mb-4`}>Chưa có lịch sử dịch.</p>
//                         <button
//                           onClick={() => fetchHistory(activeTab === 'document' ? 'document_translate' : 'image_translate')}
//                           className={`flex items-center justify-center mx-auto space-x-2 px-4 py-2 ${themeClasses.secondaryButton} rounded-xl transition-all duration-300`}
//                           aria-label="Tải lại lịch sử"
//                         >
//                           <RotateCcw className="h-4 w-4" />
//                           <span>Tải lại</span>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {showConfirmClear && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               className={`p-6 rounded-xl shadow-xl max-w-md w-full ${
//                 themeMode === 'light' ? 'bg-white/80' : 'bg-slate-800/80'
//               } backdrop-blur-md border ${
//                 themeMode === 'light' ? 'border-gray-200' : 'border-slate-700'
//               }`}
//             >
//               <div className="flex items-center space-x-2 mb-4">
//                 <AlertTriangle className="h-6 w-6 text-red-500" />
//                 <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
//                   Xác nhận xóa tất cả lịch sử
//                 </h3>
//               </div>
//               <p className={`text-sm ${themeClasses.subtext} mb-6`}>
//                 Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch? Hành động này không thể hoàn tác.
//               </p>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowConfirmClear(false)}
//                   className={`px-4 py-2 rounded-lg ${themeClasses.secondaryButton} transition-all duration-300`}
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   onClick={confirmClearHistory}
//                   className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
//                 >
//                   Xóa tất cả
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useHistory } from '../lib/useHistory';
import { toast } from 'react-toastify';
import { Sparkles, Upload, FileText, History, Download, Moon, Sun, Clock, ChevronDown, Trash2, RotateCcw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');
`;

interface TranslatedResult {
  original_text: string;
  translated_text: string;
  file_name: string;
  translated_file_name: string;
}

interface HistoryItem {
  id: string;
  type: 'document_translate';
  timestamp: string;
  data: {
    file_name: string;
    original_text: string;
    translated_text: string;
    translated_file_name: string;
  };
}

export default function DocumentSection() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [translatedResult, setTranslatedResult] = useState<TranslatedResult | null>(null);
  const { getHistoryByType, fetchHistory } = useHistory("document_translate");
  const history: HistoryItem[] = getHistoryByType('document_translate');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('document-theme');
    if (savedTheme) {
      setThemeMode(savedTheme as 'light' | 'dark');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File vượt quá giới hạn 10MB!');
      return;
    }
    setDocumentFile(file);
    setFileName(file.name);
    setTranslatedResult(null);
    setProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const toggleHistoryVisibility = () => {
    setIsHistoryVisible(!isHistoryVisible);
    setHistoryOpen(!historyOpen);
  };

  const handleProcessDocument = async () => {
    if (!documentFile) {
      toast.error('Vui lòng chọn file để dịch!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      const response = await fetch('http://localhost:8003/translate_document', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xử lý thất bại: ${errorText}`);
      }
      const result = await response.json();
      setTranslatedResult({
        original_text: result.original_text,
        translated_text: result.translated_text,
        file_name: result.file_name,
        translated_file_name: result.translated_file_name,
      });
      setProgress(100);
      toast.success('Dịch tài liệu thành công!');
      if (result.translated_file_name) {
        await downloadTranslatedFile(result.translated_file_name);
      }
    } catch (error: any) {
      console.error('Document translation error:', error);
      toast.error(`Dịch tài liệu thất bại: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTranslatedFile = async (file_name: string) => {
    try {
      const response = await fetch(`http://localhost:8003/download/${file_name}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      if (!response.ok) {
        throw new Error('Không thể tải file.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tải file dịch thành công!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Không thể tải file dịch!');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8008/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      if (!response.ok) {
        throw new Error('Xóa lịch sử thất bại');
      }
      await fetchHistory('document_translate');
      toast.success('Xóa lịch sử thành công!');
    } catch (error: any) {
      console.error('Delete history error:', error);
      toast.error(`Xóa lịch sử thất bại: ${error.message}`);
    }
  };

  const confirmClearHistory = async () => {
    try {
      const response = await fetch('http://localhost:8008/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      if (!response.ok) {
        throw new Error('Xóa tất cả lịch sử thất bại');
      }
      await fetchHistory('document_translate');
      toast.success('Xóa tất cả lịch sử thành công!');
      setShowConfirmClear(false);
    } catch (error: any) {
      console.error('Clear history error:', error);
      toast.error(`Xóa tất cả lịch sử thất bại: ${error.message}`);
    }
  };

  const toggleTheme = (): void => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('document-theme', newTheme);
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const themeClasses = {
    background: themeMode === 'light' 
      ? 'from-indigo-50 via-fuchsia-50 to-purple-50' 
      : 'from-gray-900 via-indigo-950 to-purple-950',
    text: themeMode === 'light' ? 'text-gray-800' : 'text-gray-100',
    subtext: themeMode === 'light' ? 'text-gray-600' : 'text-gray-400',
    header: themeMode === 'light' 
      ? 'from-white/80 to-indigo-50/80 text-indigo-950 border-indigo-100/30' 
      : 'from-slate-900/80 to-indigo-950/80 text-indigo-200 border-indigo-500/20',
    card: themeMode === 'light'
      ? 'bg-white/60 backdrop-blur-md shadow-xl'
      : 'bg-gray-800/60 backdrop-blur-md shadow-xl',
    input: themeMode === 'light' 
      ? 'bg-gradient-to-br from-gray-100/80 to-indigo-50/80 focus:ring-indigo-500' 
      : 'bg-gradient-to-br from-gray-800/80 to-indigo-900/80 text-white focus:ring-purple-500',
    button: themeMode === 'light'
      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    secondaryButton: themeMode === 'light'
      ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
      : 'bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700',
    disabledButton: themeMode === 'light'
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-gray-700 cursor-not-allowed',
    result: themeMode === 'light'
      ? 'from-white/90 to-indigo-50/90 text-gray-800'
      : 'from-gray-800/90 to-indigo-900/90 text-gray-100',
    progress: themeMode === 'light'
      ? 'from-indigo-500 to-purple-500'
      : 'from-indigo-600 to-purple-600',
    dropzone: themeMode === 'light'
      ? 'bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100/80'
      : 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-800/30',
    activeDropzone: themeMode === 'light'
      ? 'bg-indigo-100 border-indigo-400'
      : 'bg-indigo-800/50 border-indigo-500',
  };

  return (
    <div className={`h-full rounded-xl ${themeClasses.background} font-sans antialiased relative transition-colors duration-300`}>
      
      <style>{fontStyles}</style>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-fuchsia-500/5 to-purple-500/5 transition-all duration-1000`} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-purple-400/10 to-transparent rounded-full filter blur-xl animate-blob" />
          <div className="absolute top-3/4 right-1/3 w-80 h-80 bg-gradient-radial from-indigo-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-radial from-fuchsia-400/10 to-transparent rounded-full filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-1">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`p-4 backdrop-blur-xl bg-gradient-to-r ${themeClasses.header} rounded-2xl shadow-lg shadow-indigo-500/5 flex justify-between items-center z-20 transition-all duration-300 mb-8 sticky top-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 tracking-tight">
              Dịch Tài Liệu
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
          <div className="lg:col-span-2 flex flex-col justify-between h-full">
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
            <div className={`rounded-xl ${themeClasses.card} p-4 flex-1 flex flex-col`}>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Tải lên Tài liệu</h3>
              <p className={`${themeClasses.subtext} text-sm mb-3`}>Hỗ trợ các định dạng .pdf, .txt, .srt (Tối đa 10MB)</p>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                  isDragging ? themeClasses.activeDropzone : themeClasses.dropzone
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${themeClasses.text} opacity-70`} />
                <p className={`${themeClasses.text} font-medium mb-2`}>Kéo & thả file hoặc</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.txt,.srt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessing}
                  />
                  <button
                    className={`px-4 py-2 rounded-lg ${themeClasses.button} text-white`}
                    disabled={isProcessing}
                  >
                    Chọn file
                  </button>
                </div>
              </div>

              {fileName && (
                <div className={`mt-4 p-3 sm:p-4 bg-gradient-to-br ${themeClasses.result} rounded-xl shadow-md animate-fade-in`}>
                  <p className="text-sm break-all"><strong>File đã chọn:</strong> {fileName}</p>
                </div>
              )}

              {isProcessing && (
                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 sm:h-3 my-4 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${themeClasses.progress} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              <button
                onClick={handleProcessDocument}
                disabled={!documentFile || isProcessing}
                className={`w-full px-4 py-3 rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] mt-4 flex items-center justify-center ${
                  documentFile && !isProcessing
                    ? themeClasses.button
                    : themeClasses.disabledButton
                }`}
              >
                {isProcessing ? 'Đang xử lý...' : 'Bắt đầu dịch'}
              </button>
            </div>
</motion.div>
            {translatedResult && (
              <div className={`p-4 sm:p-5 bg-gradient-to-br ${themeClasses.result} backdrop-blur-md rounded-xl shadow-lg animate-slide-in mt-4`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>Kết quả Dịch</h3>
                <p className="text-sm break-all mb-2"><strong>File gốc:</strong> {translatedResult.file_name}</p>
                <p className="text-sm break-all"><strong>File dịch:</strong> {translatedResult.translated_file_name}</p>
                
                {translatedResult.translated_file_name && (
                  <button
                    onClick={() => downloadTranslatedFile(translatedResult.translated_file_name)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 mt-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    <span>Tải file dịch</span>
                  </button>
                )}
              </div>
            )}
          </div>

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
                  <h3 className={`font-medium ${themeClasses.text}`}>Lịch sử Dịch</h3>
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
                            <div className="flex gap-4 mt-3">
                              <a
                                href={`http://localhost:8003/download/${encodeURIComponent(item.data.translated_file_name)}`}
                                className={`flex items-center space-x-1 text-sm ${themeClasses.text} hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300`}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  await downloadTranslatedFile(item.data.translated_file_name);
                                }}
                                aria-label={`Tải xuống ${item.data.translated_file_name}`}
                              >
                                <Download className="h-4 w-4" />
                                <span>Tải xuống</span>
                              </a>
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
                          <p className={`text-sm ${themeClasses.subtext} mb-4`}>Chưa có lịch sử dịch.</p>
                          <button
                            onClick={() => fetchHistory('document_translate')}
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

        <AnimatePresence>
          {showConfirmClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-6 rounded-xl shadow-xl max-w-md w-full ${
                  themeMode === 'light' ? 'bg-white/80' : 'bg-slate-800/80'
                } backdrop-blur-md border ${
                  themeMode === 'light' ? 'border-gray-200' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                    Xác nhận xóa tất cả lịch sử
                  </h3>
                </div>
                <p className={`text-sm ${themeClasses.subtext} mb-6`}>
                  Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className={`px-4 py-2 rounded-lg ${themeClasses.secondaryButton} transition-all duration-300`}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmClearHistory}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
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