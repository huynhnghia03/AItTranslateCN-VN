// import Image from 'next/image';
// import Link from 'next/link';

// interface HeaderProps {
//   toggleSidebar: () => void;
// }

// export default function Header({ toggleSidebar }: HeaderProps) {
//   return (
//     <header className="bg-white shadow-md p-4 flex justify-between items-center">
//       <div className="flex items-center gap-4">
//         <button className="md:hidden text-gray-700" onClick={toggleSidebar}>
//           ☰
//         </button>
//         <Link href="/" className="flex items-center gap-2">
//           <Image src="/logo.png" alt="Logo" width={40} height={40} />
//           <h1 className="text-2xl font-bold text-blue-800">AI Dịch Trung - Việt</h1>
//         </Link>
//       </div>
//       <div className="flex gap-4">
//         <Link href="/login">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//             Đăng nhập
//           </button>
//         </Link>
//         <Link href="/signup">
//           <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
//             Đăng ký
//           </button>
//         </Link>
//       </div>
//     </header>
//   );
// }
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({ toggleSidebar, isLoggedIn, onLogout }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài vùng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-50/95 to-purple-50/95 backdrop-blur-md shadow-md h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-gray-700 hover:text-indigo-600 transition-all duration-300"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-xl md:text-2xl font-bold text-indigo-700">LinguaBridge CN-VN</h1>
        </Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        {!isLoggedIn ? (
          <div className="flex gap-3">
            <Link href="/login">
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                Đăng nhập
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm">
                Đăng ký
              </button>
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-indigo-100/50 transition-all duration-300"
            >
              <Image
                src="/images/avatar.png"
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full border-2 border-indigo-200"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50 animate-slide-in">
                {/* <Link href="/settings">
                  <div className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 transition-all duration-300 cursor-pointer text-sm">
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt</span>
                  </div>
                </Link> */}
                <div
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}