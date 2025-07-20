// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // Xử lý đăng nhập email
//   const handleEmailLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:8007/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         localStorage.setItem('token', data.access_token);
//         router.push('/'); // Chuyển hướng đến trang chat sau khi đăng nhập
//       } else {
//         const errorData = await response.json();
//         setError(errorData.detail || 'Đăng nhập thất bại');
//       }
//     } catch (err) {
//       setError('Có lỗi xảy ra, vui lòng thử lại');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Xử lý đăng nhập Google
//   const handleGoogleLogin = () => {
//     window.location.href = 'http://localhost:8007/login'; // Gọi API Google login
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
//         <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Đăng nhập</h1>
//         {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//         <form className="space-y-4" onSubmit={handleEmailLogin}>
//           <div>
//             <label className="block text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               placeholder="Nhập email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-gray-700 mb-1">Mật khẩu</label>
//             <input
//               type="password"
//               placeholder="Nhập mật khẩu"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             disabled={loading}
//           >
//             {loading ? 'Đang xử lý...' : 'Đăng nhập'}
//           </button>
//         </form>
//         <button
//           onClick={handleGoogleLogin}
//           className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//         >
//           Đăng nhập với Google
//         </button>
//         <p className="mt-4 text-center text-gray-600">
//           Chưa có tài khoản?{' '}
//           <Link href="/signup" className="text-blue-600 hover:underline">
//             Đăng ký
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Xử lý đăng nhập bằng email/password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8007/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('token', data.access_token, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Đăng Nhập</h1>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-50/80 p-3 rounded-xl animate-slide-in">{error}</p>
        )}
        <form className="space-y-5" onSubmit={handleEmailLogin}>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm"
                required
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
            <LogIn className="h-5 w-5" />
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.564,9.505-11.622H12.545z" />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>
        <p className="mt-4 text-center text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline font-semibold">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}