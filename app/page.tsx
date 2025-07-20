'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatSection from './components/ChatSection';
import RecordSection from './components/RecordSection';
import DocumentSection from './components/DocumentSection';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

export default function Home() {
  const [activeSection, setActiveSection] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Kiểm tra token và set activeSection từ URL params
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
    } else {
      setIsLoggedIn(true);
      
      // Lấy section từ URL parameters
      const sectionFromUrl = searchParams.get('section');
      if (sectionFromUrl && ['chat', 'record', 'document'].includes(sectionFromUrl)) {
        setActiveSection(sectionFromUrl);
      }
    }
  }, [router, searchParams]);

  // Đăng xuất
  const handleLogout = () => {
    Cookies.remove('token'); // Xóa token khỏi cookie
    router.push('/login'); // Chuyển hướng đến trang đăng nhập
  };

  const menuItems = [
    { id: 'chat', label: 'Chatbot', icon: '💬' },
    { id: 'record', label: 'Record', icon: '🎙️' },
    { id: 'document', label: 'Document', icon: '📝' },
    { id: 'video', label: 'Video', icon: '🎥' },
  ];

  // Khi chọn section
  const handleSectionChange = (sectionId: string) => {
    if (sectionId === 'video') {
      router.push('/videoEditor'); // 👉 chuyển sang trang mới
      return;
    }
    
    // Cập nhật activeSection và URL parameters
    setActiveSection(sectionId);
    
    // Cập nhật URL với section parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('section', sectionId);
    router.replace(newUrl.pathname + newUrl.search);
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Header */}
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 transition-all duration-300 md:ml-64 mt-15 h-[calc(100vh-64px)]">
          <div className="container mx-auto max-w-6xl h-full">
            <div className="bg-white rounded-xl shadow-sm h-full">
              {activeSection === 'chat' && <ChatSection />}
              {activeSection === 'record' && <RecordSection />}
              {activeSection === 'document' && <DocumentSection />}
              {/* ❌ KHÔNG render <CapCutProEditor /> ở đây nữa */}
            </div>
          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Toaster position="top-right" />
    </div>
  );
}