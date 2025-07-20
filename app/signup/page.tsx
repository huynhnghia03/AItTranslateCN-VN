"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8007/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        setTimeout(() => {
          router.push('/login');
        }, 2000); // Chờ 2 giây rồi chuyển hướng
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Đăng ký thất bại, vui lòng thử lại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Tạo tài khoản</h1>
        {error && (
          <p className="text-red-500 text-center mb-4 bg-red-50/80 p-3 rounded-xl animate-slide-in">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4 bg-green-50/80 p-3 rounded-xl animate-slide-in">{success}</p>
        )}
        <form className="space-y-5" onSubmit={handleSignup}>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 text-sm"
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
                placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 text-sm"
                required
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 text-sm"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:from-green-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            <span>{loading ? 'Đang xử lý...' : 'Đăng ký'}</span>
            <UserPlus className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}
