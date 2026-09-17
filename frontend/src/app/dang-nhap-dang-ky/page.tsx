'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function DangNhapPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await authApi.login(loginForm);
      const { accessToken, refreshToken, name } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Chào mừng trở lại, ${name}! 👋`);
      router.push('/tai-khoan');
    } catch (err: any) {
      toast.error(err?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await authApi.register(regForm);
      const { accessToken, refreshToken, name } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Đăng ký thành công! Chào ${name} 🎉`);
      router.push('/tai-khoan');
    } catch (err: any) {
      toast.error(err?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-black text-white text-2xl tracking-tight">
            Tạp Hóa Khóa Học
          </span>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Đăng nhập để xem khóa học & link Google Drive đã sở hữu
          </p>
        </div>

        <div className="bg-[#141828] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7">
          {/* Tabs */}
          <div className="flex bg-[#192036] rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  tab === t
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <div>
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors pr-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { key: 'name', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@gmail.com' },
                  { key: 'phone', label: 'Số điện thoại (tuỳ chọn)', type: 'tel', placeholder: '0xxx xxx xxx' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                      value={(regForm as any)[key]}
                      onChange={(e) => setRegForm({ ...regForm, [key]: e.target.value })}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors pr-10"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60"
                >
                  {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                </button>
              </form>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-6">
              Bằng cách tiếp tục, bạn đồng ý với chính sách & điều khoản của Tạp Hóa Khóa Học.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
