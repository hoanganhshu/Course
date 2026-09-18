'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutofill = () => {
    setEmail('admin@khoahocgiahoi.com');
    setPassword('Admin@123');
    toast.success('Đã điền tài khoản quản trị mặc định!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // 1. Thử gọi API backend nếu có
      try {
        const res: any = await authApi.login({ email, password });
        if (res?.data?.role === 'ROLE_ADMIN' || email === 'admin@khoahocgiahoi.com') {
          localStorage.setItem('accessToken', res?.data?.accessToken || 'mock-admin-token');
          localStorage.setItem('admin_user', JSON.stringify({
            name: res?.data?.name || 'Quản trị viên',
            email: email,
            role: 'ROLE_ADMIN'
          }));
          toast.success('Đăng nhập quản trị thành công!');
          router.push('/admin');
          return;
        } else {
          toast.error('Tài khoản không có quyền Quản trị viên (ROLE_ADMIN)!');
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        // 2. Chế độ offline/demo: Kiểm tra tài khoản admin mặc định
        if (email === 'admin@khoahocgiahoi.com' && password === 'Admin@123') {
          localStorage.setItem('accessToken', 'mock-admin-token-offline');
          localStorage.setItem('admin_user', JSON.stringify({
            name: 'Quản trị viên KHGH',
            email: 'admin@khoahocgiahoi.com',
            role: 'ROLE_ADMIN'
          }));
          toast.success('Đăng nhập quyền Quản trị viên thành công!');
          router.push('/admin');
          return;
        } else {
          toast.error('Email hoặc mật khẩu không chính xác!');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-6 transition-colors">
            <ArrowLeft size={14} /> Trở về trang người dùng
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/5">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cổng quản lý khóa học Google Drive, đơn hàng và phân quyền
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121624] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email quản trị</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@khoahocgiahoi.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E17] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E17] border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all disabled:opacity-60"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập Quản Trị'}
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1A2033] hover:bg-[#222A42] text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-amber-400/20"
            >
              <KeyRound size={14} />
              <span>Điền tài khoản Admin mẫu (Admin@123)</span>
            </button>
            <div className="mt-3 text-[11px] text-slate-400 text-center space-y-0.5">
              <p>Email: <span className="text-slate-300 font-mono">admin@khoahocgiahoi.com</span></p>
              <p>Mật khẩu: <span className="text-slate-300 font-mono">Admin@123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
