// "use client";
// import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
// import { 
//   Upload, FileText, Music, Download, Save, Play, Pause, Volume2, VolumeX, 
//   ZoomIn, ZoomOut, Type, Film, Layers, Plus, Edit3, Gauge, Trash2, Moon, Sun, 
//   Sparkles, Clock, Settings, X, Loader2, Languages, AudioLines
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast, ToastContainer } from 'react-toastify';
// import Cookies from 'js-cookie';
// // --- CONFIGURATION ---
// const API_BASE_URL = "http://localhost:8004"; 

// // --- INTERFACES ---
// interface Subtitle {
//   id: string;
//   start: number;
//   end: number;
//   text: string;
//   original_text?: string; // To store original text after translation
// }

// interface DubbingClip {
//   object_name: string;
//   start: number;
//   end: number;
// }

// // --- MAIN COMPONENT ---
// const CapCutProEditor = () => {
//   // --- STATE MANAGEMENT ---
//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string>(''); 
//   const [sourceVideoObjectName, setSourceVideoObjectName] = useState<string>('');
//   const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
//   const [dubbingClips, setDubbingClips] = useState<DubbingClip[]>([]);
//   const [areSubtitlesTranslated, setAreSubtitlesTranslated] = useState(false);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [playbackSpeed, setPlaybackSpeed] = useState(1);
//   const [videoVolume, setVideoVolume] = useState(1);
  
//   const [processingState, setProcessingState] = useState({ extracting: false, translating: false, dubbing: false, exporting: false });
//   const [activeTab, setActiveTab] = useState<'subtitles' | 'video'>('subtitles');
//   const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);
//   const [timelineScale, setTimelineScale] = useState(40);
//   const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
// const token = Cookies.get('token');
//   // --- REFS ---
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const timelineContainerRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // --- EFFECTS ---
//   useEffect(() => { // Inject Toastify CSS
//     const link = document.createElement('link');
//     link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.min.css';
//     link.rel = 'stylesheet';
//     document.head.appendChild(link);
//     return () => { document.head.removeChild(link); };
//   }, []);

//   useEffect(() => { // Theme Detector & Manager
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     setThemeMode(mediaQuery.matches ? 'dark' : 'light');
//     const handleChange = (e: MediaQueryListEvent) => setThemeMode(e.matches ? 'dark' : 'light');
//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   useEffect(() => { document.documentElement.classList.toggle('dark', themeMode === 'dark'); }, [themeMode]);

//   useEffect(() => { // Video Player Listeners
//     const video = videoRef.current;
//     if (!video) return;
//     const updateTime = () => setCurrentTime(video.currentTime);
//     const setVideoDuration = () => setDuration(video.duration);
//     const handlePlayPause = () => setIsPlaying(!video.paused);
//     video.addEventListener('timeupdate', updateTime);
//     video.addEventListener('loadedmetadata', setVideoDuration);
//     video.addEventListener('play', handlePlayPause);
//     video.addEventListener('pause', handlePlayPause);
//     return () => {
//       video.removeEventListener('timeupdate', updateTime);
//       video.removeEventListener('loadedmetadata', setVideoDuration);
//       video.removeEventListener('play', handlePlayPause);
//       video.removeEventListener('pause', handlePlayPause);
//     };
//   }, [videoUrl]);
  
//   useEffect(() => { // Apply Player Properties
//     const video = videoRef.current;
//     if (video) {
//       video.playbackRate = playbackSpeed;
//       video.volume = videoVolume;
//     }
//   }, [playbackSpeed, videoVolume]);

//   // --- STYLING ---
//   const themeClasses = {
//     background: themeMode === 'light' ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-950 to-black',
//     text: themeMode === 'light' ? 'text-slate-800' : 'text-slate-200',
//     subtext: themeMode === 'light' ? 'text-slate-600' : 'text-slate-400',
//     card: themeMode === 'light' ? 'bg-white/80 backdrop-blur-xl border' : 'bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 shadow-lg shadow-black/20',
//     button: 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white',
//     secondaryButton: themeMode === 'light' ? 'bg-white border border-slate-300 hover:bg-slate-100' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700',
//     timelineTrack: themeMode === 'light' ? 'bg-slate-200' : 'bg-slate-800',
//   };

//   const isProcessing = Object.values(processingState).some(state => state);

//   // --- API HANDLERS ---
  
//   // FIX: This function now handles file selection and prepares the UI for the next step.
//   const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // Reset all states for the new video
//     setVideoFile(file);
//     setSubtitles([]);
//     setDubbingClips([]);
//     setAreSubtitlesTranslated(false);
//     setSourceVideoObjectName('');
//     setCurrentTime(0);
//     setDuration(0);

//     // Create a local URL so the video can be previewed immediately.
//     // This is crucial for the stepped workflow.
//     const localPreviewUrl = URL.createObjectURL(file);
//     setVideoUrl(localPreviewUrl);

//     // Allow selecting the same file again
//     if (event.target) {
//         event.target.value = '';
//     }
//     toast.success("Video đã sẵn sàng. Hãy trích xuất phụ đề.", { theme: themeMode });
//   };
  
//   const handleExtractSubtitles = async () => {
//     if (!videoFile) {
//         toast.error('Vui lòng tải video lên trước.', { theme: themeMode });
//         return;
//     }
//     setProcessingState(s => ({ ...s, extracting: true }));
//     toast.info('Bắt đầu trích xuất phụ đề...', { theme: themeMode });

//     const formData = new FormData();
//     formData.append('file', videoFile);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/extract_subtitles`, { method: 'POST',headers: {
//             Authorization: `Bearer ${token}`,
//           }, body: formData });
//       if (!response.ok) throw new Error((await response.json()).detail || 'Trích xuất thất bại.');
      
//       const data = await response.json();
//       setSourceVideoObjectName(data.source_video_object_name);
//       // Backend now provides the permanent URL for the video asset
//       setVideoUrl(`${API_BASE_URL}/assets/${data.source_video_object_name}`);
//       setSubtitles(data.subtitles);
//       setAreSubtitlesTranslated(false); // Reset translation state
//       setDubbingClips([]); // Reset dubbing clips
//       toast.success('Trích xuất phụ đề gốc thành công!', { theme: themeMode });
//     } catch (error: any) {
//       toast.error(`Lỗi: ${error.message}`, { theme: themeMode });
//     } finally {
//       setProcessingState(s => ({ ...s, extracting: false }));
//     }
//   };

//   const handleTranslateSubtitles = async () => {
//     if (subtitles.length === 0) {
//         toast.error('Chưa có phụ đề để dịch.', { theme: themeMode });
//         return;
//     }
//     setProcessingState(s => ({ ...s, translating: true }));
//     toast.info('Đang dịch phụ đề...', { theme: themeMode });

//     try {
//         const response = await fetch(`${API_BASE_URL}/translate_subtitles`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//             body: JSON.stringify({ subtitles: subtitles })
//         });
//         if (!response.ok) throw new Error((await response.json()).detail || 'Dịch thất bại.');
        
//         const translatedSubs = await response.json();
//         setSubtitles(translatedSubs);
//         setAreSubtitlesTranslated(true);
//         toast.success('Đã dịch phụ đề sang Tiếng Việt!', { theme: themeMode });
//     } catch (error: any) {
//         toast.error(`Lỗi: ${error.message}`, { theme: themeMode });
//     } finally {
//         setProcessingState(s => ({ ...s, translating: false }));
//     }
//   };

//   const handleGenerateDubbing = async () => {
//     if (!areSubtitlesTranslated) {
//         toast.error('Vui lòng dịch phụ đề trước khi tạo lồng tiếng.', { theme: themeMode });
//         return;
//     }
//     setProcessingState(s => ({ ...s, dubbing: true }));
//     toast.info('Đang tạo các clip lồng tiếng...', { theme: themeMode });

//     try {
//         const response = await fetch(`${API_BASE_URL}/generate_dubbing_clips`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//             body: JSON.stringify({ subtitles: subtitles })
//         });
//         if (!response.ok) throw new Error((await response.json()).detail || 'Tạo lồng tiếng thất bại.');
        
//         const clips = await response.json();
//         setDubbingClips(clips);
//         toast.success(`Đã tạo ${clips.length} clip lồng tiếng!`, { theme: themeMode });
//     } catch (error: any) {
//         toast.error(`Lỗi: ${error.message}`, { theme: themeMode });
//     } finally {
//         setProcessingState(s => ({ ...s, dubbing: false }));
//     }
//   };
  
//   const handleExport = async () => {
//     if (!sourceVideoObjectName) return;
//     setProcessingState(s => ({ ...s, exporting: true }));
//     toast.info('Đang kết xuất video...', { theme: themeMode, autoClose: false, toastId: 'exporting' });

//     const payload = { source_video_object_name: sourceVideoObjectName, subtitles, dubbing_clips: dubbingClips };
//     try {
//       const response = await fetch(`${API_BASE_URL}/export_video`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!response.ok) throw new Error((await response.json()).detail || 'Kết xuất thất bại.');
      
//       const result = await response.json();
//       toast.update('exporting', { render: "Thành công! Đang tải về...", type: "success", autoClose: 5000 });
//       window.location.href = `${API_BASE_URL}/assets/${result.exported_file_name}`;
//     } catch (error: any) {
//       toast.update('exporting', { render: `Lỗi: ${error.message}`, type: "error", autoClose: 5000 });
//     } finally {
//       setProcessingState(s => ({ ...s, exporting: false }));
//     }
//   };

//   // --- UI & TIMELINE HANDLERS ---
//   const formatTime = (time: number) => {
//     const min = String(Math.floor(time / 60)).padStart(2, '0');
//     const sec = String(Math.floor(time % 60)).padStart(2, '0');
//     const ms = String(Math.floor((time % 1) * 100)).padStart(2, '0');
//     return `${min}:${sec}.${ms}`;
//   };

//   const togglePlay = () => videoRef.current && (isPlaying ? videoRef.current.pause() : videoRef.current.play());
//   const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
//     if (!timelineContainerRef.current || !videoRef.current) return;
//     const rect = timelineContainerRef.current.getBoundingClientRect();
//     const newTime = (e.clientX - rect.left + timelineContainerRef.current.scrollLeft) / timelineScale;
//     videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
//   };
  
//   const updateSubtitle = (id: string, updates: Partial<Subtitle>) => setSubtitles(subs => subs.map(s => s.id === id ? {...s, ...updates} : s));
//   const deleteSubtitle = (id: string) => {
//     setSubtitles(subs => subs.filter(s => s.id !== id));
//     if (selectedSubtitleId === id) setSelectedSubtitleId(null);
//   };
  
//   const selectedSubtitle = subtitles.find(s => s.id === selectedSubtitleId);
//   const currentSubtitleOnVideo = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);

//   const handleTimelineDrag = (e: MouseEvent, item: Subtitle, type: 'move' | 'resize-start' | 'resize-end') => {
//     e.preventDefault(); e.stopPropagation();
//     const startX = e.clientX;
//     const { start: originalStart, end: originalEnd } = item;
//     const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
//         const dx = (moveEvent.clientX - startX) / timelineScale;
//         if (type === 'move') updateSubtitle(item.id, { start: Math.max(0, originalStart + dx), end: Math.max(0, originalStart + dx) + (originalEnd - originalStart) });
//         else if (type === 'resize-end') updateSubtitle(item.id, { end: Math.max(originalStart + 0.1, originalEnd + dx) });
//         else if (type === 'resize-start') updateSubtitle(item.id, { start: Math.min(originalEnd - 0.1, Math.max(0, originalStart + dx)) });
//     };
//     const handleMouseUp = () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);
//   };
  
//   return (
//     <div className={`h-screen flex flex-col font-sans antialiased ${themeClasses.background} ${themeClasses.text}`}>
//       <ToastContainer position="bottom-right" hideProgressBar={false} />
//       {/* Header */}
//       <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-3 border-b border-slate-800/50 backdrop-blur-sm z-20 shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Film className="h-6 w-6 text-white" /></div>
//           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500 tracking-tight">CapCut Stepped Workflow</h1>
//         </div>
//         <div className="flex items-center gap-2">
//            <button onClick={handleExport} disabled={isProcessing || !sourceVideoObjectName} className={`${themeClasses.button} px-4 py-2 text-sm font-semibold rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50`}>
//             {processingState.exporting ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} Xuất Video
//           </button>
//           <button onClick={() => setThemeMode(p => p === 'light' ? 'dark' : 'light')} className={`${themeClasses.secondaryButton} p-2.5 rounded-full`}>
//             {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
//           </button>
//         </div>
//       </motion.header>

//       {/* Main Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Left Sidebar */}
//         <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="w-[350px] shrink-0 flex flex-col p-4">
//           <div className={`${themeClasses.card} flex-1 flex flex-col rounded-2xl overflow-hidden`}>
//             <div className="p-4 border-b border-slate-800/50">
//                 <h2 className="font-bold text-lg mb-4">Bảng điều khiển</h2>
//                 <div className="space-y-3">
//                     <button onClick={handleExtractSubtitles} disabled={!videoFile || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}>
//                         {processingState.extracting ? <Loader2 className="animate-spin"/> : <Type/>} 1. Trích xuất Phụ đề
//                     </button>
//                     <button onClick={handleTranslateSubtitles} disabled={subtitles.length === 0 || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}>
//                         {processingState.translating ? <Loader2 className="animate-spin"/> : <Languages/>} 2. Dịch sang Tiếng Việt
//                     </button>
//                     <button onClick={handleGenerateDubbing} disabled={!areSubtitlesTranslated || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}>
//                         {processingState.dubbing ? <Loader2 className="animate-spin"/> : <AudioLines/>} 3. Tạo Lồng tiếng
//                     </button>
//                 </div>
//             </div>
//             <div className="p-4 flex-1 overflow-y-auto">
//               <h3 className="font-bold mb-2">Danh sách Phụ đề</h3>
//               <div className="space-y-2">
//                 {subtitles.map(sub => (
//                   <div key={sub.id} onClick={() => setSelectedSubtitleId(sub.id)} className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedSubtitleId === sub.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-slate-800/50 hover:bg-slate-700/50'}`}>
//                     <div className="flex justify-between items-center text-xs mb-1.5"><span className="font-mono bg-black/20 px-2 py-0.5 rounded text-indigo-300">{formatTime(sub.start)} → {formatTime(sub.end)}</span><button onClick={(e) => {e.stopPropagation(); deleteSubtitle(sub.id)}} className="p-1 rounded-full hover:bg-red-500/20 text-red-400"><Trash2 size={14}/></button></div>
//                     <p className="text-sm truncate">{sub.text}</p>
//                   </div>
//                 ))}
//                 {subtitles.length === 0 && !processingState.extracting && <p className="text-center text-sm text-slate-500 pt-8">Chưa có phụ đề.</p>}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Main Editor */}
//         <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
//           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${themeClasses.card} flex-1 rounded-2xl flex items-center justify-center relative overflow-hidden`}>
//             {!videoFile ? (
//                 <div className="text-center p-8">
//                     <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-full flex items-center justify-center"><Upload className="h-10 w-10 text-slate-500" /></div>
//                     <h3 className="text-xl font-semibold mb-2">Bắt đầu bằng cách tải video lên</h3>
//                     <p className={themeClasses.subtext}>Chọn file của bạn để bắt đầu quy trình làm việc</p>
//                     <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className={`mt-4 ${themeClasses.button} px-6 py-2 rounded-lg font-semibold`}>Chọn File</button>
//                 </div>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <video ref={videoRef} src={videoUrl} controls={!isProcessing} className="max-w-full max-h-full" />
//                 <AnimatePresence>
//                   {currentSubtitleOnVideo && (
//                     <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg font-semibold text-center text-lg md:text-2xl shadow-lg max-w-[80%]">
//                       {currentSubtitleOnVideo.text}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             )}
//           </motion.div>
          
//           {/* Timeline & Inspector */}
//           <div className="h-[300px] shrink-0 flex gap-4">
//             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={`${themeClasses.card} flex-1 rounded-2xl p-4 flex flex-col overflow-hidden`}>
//               <div className="flex justify-between items-center mb-2"><div className="flex items-center gap-4"><button onClick={togglePlay} disabled={!videoUrl} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${themeClasses.button} disabled:opacity-50`}>{isPlaying ? <Pause size={20}/> : <Play size={20}/>}</button><span className="font-mono text-lg">{formatTime(currentTime)} / {formatTime(duration)}</span></div><div className="flex items-center gap-2"><button onClick={() => setTimelineScale(s => Math.max(10, s - 5))} className={themeClasses.secondaryButton + " p-2 rounded-lg"}><ZoomOut size={16}/></button><button onClick={() => setTimelineScale(s => Math.min(200, s + 5))} className={themeClasses.secondaryButton + " p-2 rounded-lg"}><ZoomIn size={16}/></button></div></div>
//               <div className="flex-1 overflow-x-auto" ref={timelineContainerRef} onMouseDown={handleTimelineClick}>
//                 <div className="relative h-full" style={{ width: `${duration * timelineScale}px` }}>
//                   <div className="absolute top-0 h-full w-0.5 bg-red-500 z-20" style={{ left: `${currentTime * timelineScale}px` }}><div className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div></div>
//                   <div className="space-y-1 pt-4">
//                     <div className={`h-12 ${themeClasses.timelineTrack} rounded-lg flex items-center px-3`}><Film size={16} className="text-indigo-400 mr-2"/> Video</div>
//                     <div className={`h-16 ${themeClasses.timelineTrack} rounded-lg relative p-2`}>
//                       <span className="absolute top-1 left-2 text-xs text-slate-500 flex items-center gap-1"><Type size={12}/>Phụ đề {areSubtitlesTranslated ? "(Đã dịch)" : "(Gốc)"}</span>
//                       {subtitles.map(sub => <div key={sub.id} className="absolute h-10 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg flex items-center px-3 text-white text-xs truncate cursor-pointer select-none" style={{ left: `${sub.start * timelineScale}px`, width: `${(sub.end - sub.start) * timelineScale}px` }} onClick={(e) => { e.stopPropagation(); setSelectedSubtitleId(sub.id); }} onMouseDown={(e) => handleTimelineDrag(e, sub, 'move')}>{sub.text}<div onMouseDown={(e) => handleTimelineDrag(e, sub, 'resize-start')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"></div><div onMouseDown={(e) => handleTimelineDrag(e, sub, 'resize-end')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"></div></div>)}
//                     </div>
//                      <div className={`h-16 ${themeClasses.timelineTrack} rounded-lg relative p-2`}>
//                       <span className="absolute top-1 left-2 text-xs text-slate-500 flex items-center gap-1"><Music size={12}/>Lồng tiếng</span>
//                       {dubbingClips.map(clip => <div key={clip.object_name} className="absolute h-10 top-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center px-3 text-white text-xs truncate cursor-pointer select-none" style={{ left: `${clip.start * timelineScale}px`, width: `${(clip.end - clip.start) * timelineScale}px` }}><AudioLines size={14}/></div>)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//             <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className={`${themeClasses.card} w-[300px] shrink-0 rounded-2xl p-4 overflow-y-auto`}>
//               <AnimatePresence>
//                 {selectedSubtitle ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
//                   <h3 className="font-semibold flex items-center gap-2"><Edit3 size={16}/> Chỉnh sửa phụ đề</h3>
//                   <textarea value={selectedSubtitle.text} onChange={e => updateSubtitle(selectedSubtitle.id, {text: e.target.value})} className={`w-full p-2 rounded-lg resize-none ${themeClasses.secondaryButton}`} rows={4}/>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div><label className="text-xs">Bắt đầu</label><input type="number" step="0.1" value={selectedSubtitle.start.toFixed(2)} onChange={e => updateSubtitle(selectedSubtitle.id, {start: parseFloat(e.target.value) || 0})} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.secondaryButton}`} /></div>
//                     <div><label className="text-xs">Kết thúc</label><input type="number" step="0.1" value={selectedSubtitle.end.toFixed(2)} onChange={e => updateSubtitle(selectedSubtitle.id, {end: parseFloat(e.target.value) || 0})} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.secondaryButton}`} /></div>
//                   </div>
//                 </motion.div>) : (
//                 <div className="flex items-center justify-center h-full text-center "><p className={themeClasses.subtext}>Chọn một phụ đề trên timeline để chỉnh sửa.</p></div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           </div>
//         </div>
//       </div>
      
//       <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelected} className="hidden" />
//     </div>
//   );
// };

// export default CapCutProEditor;
"use client";
import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import { 
  Upload, FileText, Music, Download, Play, Pause, Volume2, VolumeX, 
  ZoomIn, ZoomOut, Type, Film, Layers, Edit3, Trash2, Moon, Sun, 
  Loader2, Languages, AudioLines, FastForward, Rewind, Palette, Baseline, CaseSensitive
} from 'lucide-react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:8004";
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const AVAILABLE_FONTS = [
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
];

// --- INTERFACES ---
interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
  original_text?: string;
  styles?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
  }
}

interface DubbingClip {
  object_name: string;
  start: number;
  end: number;
  volume?: number; 
}

// --- MAIN COMPONENT ---
const CapCutProEditor = () => {
  // --- STATE MANAGEMENT ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [sourceVideoObjectName, setSourceVideoObjectName] = useState<string>('');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [dubbingClips, setDubbingClips] = useState<DubbingClip[]>([]);
  const [areSubtitlesTranslated, setAreSubtitlesTranslated] = useState(false);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoVolume, setVideoVolume] = useState(1);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1);
  
  // UI/Editor State
  const [processingState, setProcessingState] = useState({ extracting: false, translating: false, dubbing: false, exporting: false });
  const [selectedSubtitleIds, setSelectedSubtitleIds] = useState<string[]>([]);
  const [selectedDubbingId, setSelectedDubbingId] = useState<string | null>(null);
  const [timelineScale, setTimelineScale] = useState(40);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [token, setToken] = useState<string>('');

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  
  // --- EFFECTS ---
  useEffect(() => { /* Toastify CSS injector */
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

   useEffect(() => { // Create and manage audio elements
    const newAudioElements: Record<string, HTMLAudioElement> = {};
    dubbingClips.forEach(clip => {
        const audio = new Audio(`${API_BASE_URL}/assets/${clip.object_name}`);
        audio.preload = 'auto';
        audio.volume = Math.max(0, Math.min(1, clip.volume ?? 1));
        newAudioElements[clip.object_name] = audio;
    });
    setAudioElements(newAudioElements);
    return () => { Object.values(newAudioElements).forEach(audio => { audio.pause(); audio.removeAttribute('src'); audio.load(); }); };
  }, [dubbingClips]);

  useEffect(() => { /* Theme detector */
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setThemeMode(mediaQuery.matches ? 'dark' : 'light');
    const handleChange = (e: MediaQueryListEvent) => setThemeMode(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => { // Check for token on mount
    const fetchedToken = Cookies.get('token') || '';
    setToken(fetchedToken);
    if (!fetchedToken) {
        // Redirect if no token is found
        window.location.href = '/login'; 
    }
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', themeMode === 'dark'); }, [themeMode]);

   useEffect(() => { // Video Listeners with Audio Sync
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
        const CTime = video.currentTime;
        setCurrentTime(CTime);
        let isAnyDubbingClipActive = false;
        dubbingClips.forEach(clip => {
            const audio = audioElements[clip.object_name];
            if (!audio) return;
            const isInRange = CTime >= clip.start && CTime < clip.end;
            if (isInRange) isAnyDubbingClipActive = true;
            if (isInRange && audio.paused && isPlaying) {
                const timeIntoClip = CTime - clip.start;
                if (Math.abs(audio.currentTime - timeIntoClip) > 0.3) { audio.currentTime = timeIntoClip; }
                audio.play().catch(e => {});
            } else if (!isInRange && !audio.paused) { audio.pause(); }
        });
        video.volume = isAnyDubbingClipActive ? videoVolume * 0.1 : videoVolume;
    };
    const setVideoDuration = () => { if (video.duration && !isNaN(video.duration)) setDuration(video.duration); }
    const handlePlayPause = () => setIsPlaying(!video.paused);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('play', handlePlayPause);
    video.addEventListener('pause', handlePlayPause);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('play', handlePlayPause);
      video.removeEventListener('pause', handlePlayPause);
    };
  }, [videoUrl, audioElements, dubbingClips, isPlaying, videoVolume]);
  
  useEffect(() => { 
    if(videoRef.current) videoRef.current.playbackRate = playbackSpeed;
    Object.values(audioElements).forEach(audio => {
        audio.playbackRate = playbackSpeed * audioPlaybackSpeed;
    });
  }, [playbackSpeed, audioPlaybackSpeed, audioElements]);

  // --- STYLING & HELPERS ---
  const themeClasses = {
    background: themeMode === 'light' ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-950 to-black',
    text: themeMode === 'light' ? 'text-slate-800' : 'text-slate-200',
    subtext: themeMode === 'light' ? 'text-slate-600' : 'text-slate-400',
    card: themeMode === 'light' ? 'bg-white/80 backdrop-blur-xl border' : 'bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 shadow-lg shadow-black/20',
    button: 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white',
    secondaryButton: themeMode === 'light' ? 'bg-white border border-slate-300 hover:bg-slate-100' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700',
    timelineTrack: themeMode === 'light' ? 'bg-slate-200' : 'bg-slate-800',
    input: themeMode === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700',
  };

  const isProcessing = Object.values(processingState).some(state => state);

  // --- API HANDLERS ---
  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoFile(file); setSubtitles([]); setDubbingClips([]); setAreSubtitlesTranslated(false); setSourceVideoObjectName(''); setCurrentTime(0); setDuration(0);
    const localPreviewUrl = URL.createObjectURL(file);
    setVideoUrl(localPreviewUrl);
    if (event.target) event.target.value = '';
    toast.success("Video đã sẵn sàng. Hãy trích xuất phụ đề.", { theme: themeMode });
  };
  const handleExtractSubtitles = async () => { if (!videoFile) { toast.error('Vui lòng tải video lên trước.', { theme: themeMode }); return; } setProcessingState(s => ({ ...s, extracting: true })); const formData = new FormData(); formData.append('file', videoFile); try { const response = await fetch(`${API_BASE_URL}/extract_subtitles`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }); if (!response.ok) throw new Error((await response.json()).detail || 'Trích xuất thất bại.'); const data = await response.json(); setSourceVideoObjectName(data.source_video_object_name); setVideoUrl(`${API_BASE_URL}/assets/${data.source_video_object_name}`); setSubtitles(data.subtitles); setAreSubtitlesTranslated(false); setDubbingClips([]); toast.success('Trích xuất phụ đề gốc thành công!', { theme: themeMode }); } catch (error: any) { toast.error(`Lỗi: ${error.message}`, { theme: themeMode }); } finally { setProcessingState(s => ({ ...s, extracting: false })); } };
  const handleTranslateSubtitles = async () => { if (subtitles.length === 0) { toast.error('Chưa có phụ đề để dịch.', { theme: themeMode }); return; } setProcessingState(s => ({ ...s, translating: true })); try { const response = await fetch(`${API_BASE_URL}/translate_subtitles`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(subtitles) }); if (!response.ok) throw new Error((await response.json()).detail || 'Dịch thất bại.'); const translatedSubs = await response.json(); setSubtitles(translatedSubs); setAreSubtitlesTranslated(true); toast.success('Đã dịch phụ đề sang Tiếng Việt!', { theme: themeMode }); } catch (error: any) { toast.error(`Lỗi: ${error.message}`, { theme: themeMode }); } finally { setProcessingState(s => ({ ...s, translating: false })); } };
  const handleGenerateDubbing = async () => { if (!areSubtitlesTranslated) { toast.error('Vui lòng dịch phụ đề trước khi tạo lồng tiếng.', { theme: themeMode }); return; } setProcessingState(s => ({ ...s, dubbing: true })); try { const response = await fetch(`${API_BASE_URL}/generate_dubbing_clips`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(subtitles) }); if (!response.ok) throw new Error((await response.json()).detail || 'Tạo lồng tiếng thất bại.'); const clips = await response.json(); setDubbingClips(clips.map((c: DubbingClip) => ({...c, volume: 1}))); toast.success(`Đã tạo ${clips.length} clip lồng tiếng!`, { theme: themeMode }); } catch (error: any) { toast.error(`Lỗi: ${error.message}`, { theme: themeMode }); } finally { setProcessingState(s => ({ ...s, dubbing: false })); } };
  const handleExport = async () => { if (!sourceVideoObjectName) return; setProcessingState(s => ({ ...s, exporting: true })); const payload = { source_video_object_name: sourceVideoObjectName, subtitles, dubbing_clips: dubbingClips }; try { const response = await fetch(`${API_BASE_URL}/export_video`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error((await response.json()).detail || 'Kết xuất thất bại.'); const result = await response.json(); toast.success("Thành công! Đang tải về...", { theme: themeMode }); window.location.href = `${API_BASE_URL}/assets/${result.exported_file_name}`; } catch (error: any) { toast.error(`Lỗi: ${error.message}`, { theme: themeMode }); } finally { setProcessingState(s => ({ ...s, exporting: false })); } };

  // --- UI & TIMELINE HANDLERS ---
  const formatTime = (time: number) => { if(isNaN(time)) return "00:00.00"; const min = String(Math.floor(time / 60)).padStart(2, '0'); const sec = String(Math.floor(time % 60)).padStart(2, '0'); const ms = String(Math.floor((time % 1) * 100)).padStart(2, '0'); return `${min}:${sec}.${ms}`; };
  const togglePlay = () => videoRef.current && (isPlaying ? videoRef.current.pause() : videoRef.current.play());
  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => { if (!timelineContainerRef.current || !videoRef.current || !duration) return; const rect = timelineContainerRef.current.getBoundingClientRect(); const newTime = (e.clientX - rect.left + timelineContainerRef.current.scrollLeft) / timelineScale; videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration)); };
  
  const updateSubtitle = (id: string, updates: Partial<Subtitle>) => setSubtitles(subs => subs.map(s => s.id === id ? { ...s, ...updates } : s));
  const updateDubbingClip = (id: string, updates: Partial<DubbingClip>) => {
    setDubbingClips(clips => clips.map(c => c.object_name === id ? { ...c, ...updates } : c));
    if(updates.volume !== undefined && audioElements[id]){
      audioElements[id].volume = Math.max(0, Math.min(1, updates.volume ?? 1));
    }
  };
  const deleteSingleSubtitle = (id: string) => { setSubtitles(subs => subs.filter(s => s.id !== id)); setSelectedSubtitleIds(ids => ids.filter(sid => sid !== id)); };
  
  // --- SELECTION & EDITING LOGIC ---
  const handleSubtitleClick = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (isCtrlOrMeta) {
      setSelectedSubtitleIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    } else {
      setSelectedSubtitleIds([id]);
    }
    setSelectedDubbingId(null);
  };
  const handleDubbingClick = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedDubbingId(id);
    setSelectedSubtitleIds([]);
  }

  const handleBulkStyleUpdate = (styleUpdates: NonNullable<Subtitle['styles']>) => {
    setSubtitles(subs => subs.map(s => {
      if (selectedSubtitleIds.includes(s.id)) {
        return { ...s, styles: { ...s.styles, ...styleUpdates } };
      }
      return s;
    }));
  };

  const deleteSelectedSubtitles = () => {
    setSubtitles(subs => subs.filter(s => !selectedSubtitleIds.includes(s.id)));
    setSelectedSubtitleIds([]);
  };

  const selectedDubbingClip = dubbingClips.find(c => c.object_name === selectedDubbingId);
  const selectedSubtitles = subtitles.filter(s => selectedSubtitleIds.includes(s.id));
  const representativeSubtitle = selectedSubtitles[0];
  const isBulkEditingSubtitles = selectedSubtitleIds.length > 1;
  const currentSubtitleOnVideo = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);
  
  const handleTimelineDrag = (e: MouseEvent, item: Subtitle | DubbingClip, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault(); e.stopPropagation();
    if(isBulkEditingSubtitles) return; // Prevent dragging multiple items for now
    
    const startX = e.clientX;
    const { start: originalStart, end: originalEnd } = item;
    
    const updateFunction = 'text' in item ? updateSubtitle : updateDubbingClip;
    const itemId = 'text' in item ? item.id : item.object_name;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / timelineScale;
        if (type === 'move') updateFunction(itemId, { start: Math.max(0, originalStart + dx), end: Math.max(0, originalStart + dx) + (originalEnd - originalStart) });
        else if (type === 'resize-end') updateFunction(itemId, { end: Math.max(originalStart + 0.1, originalEnd + dx) });
        else if (type === 'resize-start') updateFunction(itemId, { start: Math.min(originalEnd - 0.1, Math.max(0, originalStart + dx)) });
    };
    const handleMouseUp = () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div className={`h-screen flex flex-col font-sans antialiased ${themeClasses.background} ${themeClasses.text} relative`}>
      <ToastContainer position="bottom-right" hideProgressBar={false} />
      <AnimatePresence>
        {isProcessing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"><Loader2 className="h-16 w-16 animate-spin text-indigo-400" /><p className="mt-4 text-lg font-semibold text-slate-200">{processingState.extracting ? "Đang trích xuất..." : processingState.translating ? "Đang dịch..." : processingState.dubbing ? "Đang tạo lồng tiếng..." : "Đang kết xuất..."}</p></motion.div>}
      </AnimatePresence>
      
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-3 border-b border-slate-800/50 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Film className="h-6 w-6 text-white" /></div><h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500 tracking-tight">Video Editor</h1></div>
        <div className="flex items-center gap-2"><button onClick={handleExport} disabled={isProcessing || !sourceVideoObjectName} className={`${themeClasses.button} px-4 py-2 text-sm font-semibold rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50`}>{processingState.exporting ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} Xuất Video</button><button onClick={() => setThemeMode(p => p === 'light' ? 'dark' : 'light')} className={`${themeClasses.secondaryButton} p-2.5 rounded-full`}>{themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button></div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="w-[350px] shrink-0 flex flex-col p-4">
          <div className={`${themeClasses.card} flex-1 flex flex-col rounded-2xl overflow-hidden`}>
            <div className="p-4 border-b border-slate-800/50"><h2 className="font-bold text-lg mb-4">Bảng điều khiển</h2><div className="space-y-3"><button onClick={handleExtractSubtitles} disabled={!videoFile || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}><Type/> 1. Trích xuất Phụ đề</button><button onClick={handleTranslateSubtitles} disabled={subtitles.length === 0 || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}><Languages/> 2. Dịch sang Tiếng Việt</button><button onClick={handleGenerateDubbing} disabled={!areSubtitlesTranslated || isProcessing} className={`w-full ${themeClasses.secondaryButton} flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold disabled:opacity-50`}><AudioLines/> 3. Tạo Lồng tiếng</button></div></div>
            <div className="p-4 flex-1 overflow-y-auto"><h3 className="font-bold mb-2">Danh sách Phụ đề</h3><div className="space-y-2">{subtitles.map(sub => (<div key={sub.id} onClick={(e) => handleSubtitleClick(sub.id, e)} className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedSubtitleIds.includes(sub.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-slate-800/50 hover:bg-slate-700/50'}`}><div className="flex justify-between items-center text-xs mb-1.5"><span className="font-mono bg-black/20 px-2 py-0.5 rounded text-indigo-300">{formatTime(sub.start)} → {formatTime(sub.end)}</span><button onClick={(e) => {e.stopPropagation(); deleteSingleSubtitle(sub.id)}} className="p-1 rounded-full hover:bg-red-500/20 text-red-400"><Trash2 size={14}/></button></div><p className="text-sm truncate" style={{ fontFamily: sub.styles?.fontFamily }}>{sub.text}</p></div>))
              } {subtitles.length === 0 && !processingState.extracting && <p className="text-center text-sm text-slate-500 pt-8">Chưa có phụ đề.</p>}</div></div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${themeClasses.card} flex-1 rounded-2xl flex items-center justify-center relative overflow-hidden`}>
            {!videoFile ? (<div className="text-center p-8"><div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-full flex items-center justify-center"><Upload className="h-10 w-10 text-slate-500" /></div><h3 className="text-xl font-semibold mb-2">Tải video để bắt đầu</h3><p className={themeClasses.subtext}>Chọn file của bạn để bắt đầu quy trình</p><button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className={`mt-4 ${themeClasses.button} px-6 py-2 rounded-lg font-semibold`}>Chọn File</button></div>) : (<div className="w-full h-full flex items-center justify-center"><video ref={videoRef} src={videoUrl} className="max-w-full max-h-full" /><AnimatePresence>{currentSubtitleOnVideo && (<motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-semibold text-center shadow-lg max-w-[80%]" style={{ color: currentSubtitleOnVideo.styles?.color || '#FFFFFF', backgroundColor: currentSubtitleOnVideo.styles?.backgroundColor || 'rgba(0,0,0,0.6)', fontSize: `${currentSubtitleOnVideo.styles?.fontSize || 24}px`, fontFamily: currentSubtitleOnVideo.styles?.fontFamily || 'sans-serif' }}>{currentSubtitleOnVideo.text}</motion.div>)}</AnimatePresence></div>)}
          </motion.div>
          
          <div className="h-[300px] shrink-0 flex gap-4">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={`${themeClasses.card} flex-1 rounded-2xl p-4 flex flex-col overflow-hidden`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} disabled={!videoUrl} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${themeClasses.button} disabled:opacity-50`}>{isPlaying ? <Pause size={20}/> : <Play size={20}/>}</button>
                    <span className="font-mono text-lg">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Rewind size={16} className={themeClasses.subtext} />
                        {PLAYBACK_SPEEDS.map(speed => <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`px-2 py-1 text-xs rounded-md ${playbackSpeed === speed ? themeClasses.button : themeClasses.secondaryButton}`}>{speed}x</button>)}
                        <FastForward size={16} className={themeClasses.subtext} />
                    </div>
                    <div className="flex items-center gap-2 w-28">
                        <VolumeX size={16} className={themeClasses.subtext}/>
                        <input type="range" min="0" max="1" step="0.05" value={videoVolume} onChange={(e) => setVideoVolume(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer range-sm"/>
                        <Volume2 size={16} className={themeClasses.subtext}/>
                    </div>
                </div>
                <div className="flex items-center gap-2"><button onClick={() => setTimelineScale(s => Math.max(10, s - 5))} className={themeClasses.secondaryButton + " p-2 rounded-lg"}><ZoomOut size={16}/></button><button onClick={() => setTimelineScale(s => Math.min(200, s + 5))} className={themeClasses.secondaryButton + " p-2 rounded-lg"}><ZoomIn size={16}/></button></div>
              </div>
              <div className="flex-1 overflow-x-auto" ref={timelineContainerRef} onMouseDown={handleTimelineClick}>
                <div className="relative h-full" style={{ width: `${(duration || 0) * timelineScale}px` }}>
                  <div className="absolute top-0 h-full w-0.5 bg-red-500 z-20" style={{ left: `${currentTime * timelineScale}px` }}><div className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div></div>
                  <div className="space-y-1 pt-4">
                    <div className={`h-12 ${themeClasses.timelineTrack} rounded-lg flex items-center px-3`}><Film size={16} className="text-indigo-400 mr-2"/> Video</div>
                    <div className={`h-16 ${themeClasses.timelineTrack} rounded-lg relative p-2`}><span className="absolute top-1 left-2 text-xs text-slate-500 flex items-center gap-1"><Type size={12}/>Phụ đề {areSubtitlesTranslated ? "(Đã dịch)" : "(Gốc)"}</span>
                      {subtitles.map(sub => <div key={sub.id} className={`absolute h-10 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg flex items-center px-3 text-white text-xs truncate select-none border-2 ${selectedSubtitleIds.includes(sub.id) ? `border-yellow-300 ${isBulkEditingSubtitles ? 'cursor-copy' : 'cursor-pointer'}` : 'border-transparent cursor-pointer'}`} style={{ left: `${sub.start * timelineScale}px`, width: `${(sub.end - sub.start) * timelineScale}px`, fontFamily: sub.styles?.fontFamily }} onClick={(e) => handleSubtitleClick(sub.id, e)} onMouseDown={(e) => handleTimelineDrag(e, sub, 'move')}>{sub.text}<div onMouseDown={(e) => handleTimelineDrag(e, sub, 'resize-start')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"></div><div onMouseDown={(e) => handleTimelineDrag(e, sub, 'resize-end')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"></div></div>)}
                    </div>
                     <div className={`h-16 ${themeClasses.timelineTrack} rounded-lg relative p-2`}><span className="absolute top-1 left-2 text-xs text-slate-500 flex items-center gap-1"><Music size={12}/>Lồng tiếng</span>
                      {dubbingClips.map(clip => <div key={clip.object_name} className={`absolute h-10 top-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center px-3 text-white text-xs truncate cursor-pointer select-none border-2 ${selectedDubbingId === clip.object_name ? 'border-yellow-300' : 'border-transparent'}`} style={{ left: `${clip.start * timelineScale}px`, width: `${(clip.end - clip.start) * timelineScale}px` }} onClick={(e) => handleDubbingClick(clip.object_name, e)} onMouseDown={(e) => handleTimelineDrag(e, clip, 'move')}><AudioLines size={14}/><div onMouseDown={(e) => handleTimelineDrag(e, clip, 'resize-start')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"></div><div onMouseDown={(e) => handleTimelineDrag(e, clip, 'resize-end')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"></div></div>)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className={`${themeClasses.card} w-[300px] shrink-0 rounded-2xl p-4 overflow-y-auto`}>
              <AnimatePresence mode="wait">
                {selectedSubtitleIds.length > 0 ? (
                  <motion.div key="subtitle-editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <h3 className="font-semibold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><Edit3 size={16}/> {isBulkEditingSubtitles ? `Chỉnh sửa ${selectedSubtitleIds.length} phụ đề` : 'Chỉnh sửa phụ đề'}</div>
                      <button onClick={deleteSelectedSubtitles} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"><Trash2 size={16}/></button>
                    </h3>
                    <textarea value={isBulkEditingSubtitles ? '' : representativeSubtitle.text} onChange={e => !isBulkEditingSubtitles && updateSubtitle(representativeSubtitle.id, {text: e.target.value})} placeholder={isBulkEditingSubtitles ? 'Chỉnh sửa văn bản vô hiệu hoá cho nhiều lựa chọn' : ''} disabled={isBulkEditingSubtitles} className={`w-full p-2 rounded-lg resize-none ${themeClasses.input} disabled:opacity-50`} rows={3}/>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">Bắt đầu</label><input type="number" step="0.1" value={isBulkEditingSubtitles ? '' : representativeSubtitle.start.toFixed(2)} onChange={e => !isBulkEditingSubtitles && updateSubtitle(representativeSubtitle.id, {start: parseFloat(e.target.value) || 0})} disabled={isBulkEditingSubtitles} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input} disabled:opacity-50`} /></div>
                        <div><label className="text-xs">Kết thúc</label><input type="number" step="0.1" value={isBulkEditingSubtitles ? '' : representativeSubtitle.end.toFixed(2)} onChange={e => !isBulkEditingSubtitles && updateSubtitle(representativeSubtitle.id, {end: parseFloat(e.target.value) || 0})} disabled={isBulkEditingSubtitles} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input} disabled:opacity-50`} /></div>
                    </div>
                    <hr className="border-slate-700/50" />
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Palette size={14}/> Kiểu chữ</h4>
                    <div><label className="text-xs flex items-center gap-1.5"><CaseSensitive size={14}/> Font chữ</label><select value={representativeSubtitle.styles?.fontFamily || ''} onChange={e => handleBulkStyleUpdate({ fontFamily: e.target.value })} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input} text-sm`} >{AVAILABLE_FONTS.map(font => <option key={font.name} value={font.value} style={{fontFamily: font.value}}>{font.name}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs flex items-center gap-1.5"><Baseline size={14} /> Cỡ chữ</label><input type="number" value={representativeSubtitle.styles?.fontSize || ''} onChange={e => handleBulkStyleUpdate({ fontSize: parseInt(e.target.value) || 24 })} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input}`} /></div>
                      <div><label className="text-xs">Màu chữ</label><input type="color" value={representativeSubtitle.styles?.color || '#FFFFFF'} onChange={e => handleBulkStyleUpdate({ color: e.target.value })} className={`w-full h-10 mt-1 p-0 border-0 rounded-lg ${themeClasses.input}`} /></div>
                    </div>
                    <div><label className="text-xs">Màu nền (để trống để trong suốt)</label><input type="color" value={representativeSubtitle.styles?.backgroundColor || '#000000'} onChange={e => handleBulkStyleUpdate({ backgroundColor: e.target.value })} className={`w-full h-10 mt-1 p-0 border-0 rounded-lg ${themeClasses.input}`} /></div>
                  </motion.div>
                ) : selectedDubbingClip ? (
                  <motion.div key="dubbing-editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                     <h3 className="font-semibold flex items-center gap-2"><Music size={16}/> Chỉnh sửa lồng tiếng</h3>
                     <div><label className="text-xs flex items-center gap-1.5"><Volume2 size={14}/> Âm lượng Clip</label><input type="range" min="0" max="1.5" step="0.05" value={selectedDubbingClip.volume ?? 1} onChange={(e) => updateDubbingClip(selectedDubbingClip.object_name, { volume: parseFloat(e.target.value) })} className="w-full mt-2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/></div>
                     <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs">Bắt đầu</label><input type="number" step="0.1" value={selectedDubbingClip.start.toFixed(2)} onChange={e => updateDubbingClip(selectedDubbingClip.object_name, {start: parseFloat(e.target.value) || 0})} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input}`} /></div>
                        <div><label className="text-xs">Kết thúc</label><input type="number" step="0.1" value={selectedDubbingClip.end.toFixed(2)} onChange={e => updateDubbingClip(selectedDubbingClip.object_name, {end: parseFloat(e.target.value) || 0})} className={`w-full mt-1 p-2 rounded-lg ${themeClasses.input}`} /></div>
                    </div>
                     <hr className="border-slate-700/50" />
                     <div>
                        <label className="text-xs flex items-center gap-1.5 mb-1"><FastForward size={14}/> Tốc độ lồng tiếng (Toàn cục)</label>
                        <div className="flex items-center gap-2">
                            <input type="range" min="0.5" max="2" step="0.05" value={audioPlaybackSpeed} onChange={(e) => setAudioPlaybackSpeed(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                            <span className="font-mono text-sm bg-slate-800 px-2 py-1 rounded">{audioPlaybackSpeed.toFixed(2)}x</span>
                        </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full text-center"><p className={themeClasses.subtext}>Chọn một mục trên timeline để chỉnh sửa.</p></motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelected} className="hidden" />
    </div>
  );
};

export default CapCutProEditor;
