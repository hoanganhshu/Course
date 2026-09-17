'use client';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, ExternalLink, User, FolderOpen, Wallet, Mail, CheckCircle, AlertCircle, QrCode, X } from 'lucide-react';
import { authApi, myCourseApi, walletApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TaiKhoanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [driveLinks, setDriveLinks] = useState<Record<number, string>>({});
  const [loadingLink, setLoadingLink] = useState<number | null>(null);

  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositData, setDepositData] = useState<any>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  // Drive Email edit state
  const [isEditingDriveEmail, setIsEditingDriveEmail] = useState(false);
  const [driveEmailInput, setDriveEmailInput] = useState('');
  const [savingDriveEmail, setSavingDriveEmail] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    retry: false,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => myCourseApi.getAll(),
    enabled: !!profileData,
  });

  const profile = (profileData as any)?.data;
  const courses = (coursesData as any)?.data || [];

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      router.replace('/dang-nhap-dang-ky');
    }
  }, []);

  useEffect(() => {
    if (profile?.driveEmail) {
      setDriveEmailInput(profile.driveEmail);
    }
  }, [profile?.driveEmail]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Đã đăng xuất');
    router.push('/');
  };

  const handleUpdateDriveEmail = async () => {
    const cleanEmail = driveEmailInput.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com')) {
      toast.error('Vui lòng nhập email có đuôi @gmail.com để nhận quyền Google Drive');
      return;
    }

    setSavingDriveEmail(true);
    try {
      await authApi.updateDriveEmail(cleanEmail);
      toast.success('Đã cập nhật Gmail nhận Google Drive thành công!');
      setIsEditingDriveEmail(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSavingDriveEmail(false);
    }
  };

  const handleCreateDeposit = async () => {
    if (depositAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }
    setDepositLoading(true);
    try {
      const res: any = await walletApi.deposit(depositAmount);
      setDepositData(res.data);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo mã nạp tiền.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleGetDriveLink = async (courseId: number) => {
    if (driveLinks[courseId]) {
      window.open(driveLinks[courseId], '_blank');
      return;
    }
    setLoadingLink(courseId);
    try {
      const res: any = await myCourseApi.getDriveLink(courseId);
      const link = res.data?.driveLink;
      setDriveLinks((prev) => ({ ...prev, [courseId]: link }));
      window.open(link, '_blank');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lấy link. Vui lòng thử lại.');
    } finally {
      setLoadingLink(null);
    }
  };

  if (profileLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-[#141828] rounded w-1/3 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[#141828] rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (!profile) return null;

  const currentBalance = profile.balance ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#181F3B] to-[#12162B] rounded-2xl p-6 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">{profile.name}</h1>
            <p className="text-slate-400 text-xs sm:text-sm">{profile.email}</p>
            {profile.hasMembership && (
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5">
                👑 Hội viên {profile.membershipName}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#1F253C] hover:bg-[#28314F] text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors self-start sm:self-center"
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>

      {/* Wallet & Drive Email Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card 1: Ví số dư */}
        <div className="bg-gradient-to-br from-[#141828] to-[#171E36] border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Wallet size={18} />
              <span>Ví Số Dư Tài Khoản</span>
            </div>
            <span className="text-[11px] bg-amber-400/10 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
              Khả dụng
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBalance)}
            </div>
            <p className="text-slate-400 text-xs mt-1">Dùng để mua khóa học tức thì không cần chờ quét QR ngân hàng</p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 mt-2">
            <button
              onClick={() => {
                setDepositData(null);
                setShowDepositModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
            >
              <QrCode size={15} />
              Nạp tiền vào ví (VietQR)
            </button>
          </div>
        </div>

        {/* Card 2: Gmail nhận Google Drive */}
        <div className="bg-gradient-to-br from-[#141828] to-[#171E36] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
              <Mail size={18} />
              <span>Gmail Nhận Quyền Google Drive</span>
            </div>
            {profile.driveEmail ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                <CheckCircle size={11} /> Đã liên kết
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] bg-rose-500/10 text-rose-400 font-semibold px-2 py-0.5 rounded-full">
                <AlertCircle size={11} /> Cần bổ sung
              </span>
            )}
          </div>

          <div className="my-2">
            {isEditingDriveEmail ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={driveEmailInput}
                  onChange={(e) => setDriveEmailInput(e.target.value)}
                  placeholder="vidu@gmail.com"
                  className="w-full bg-[#0F1322] border border-blue-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateDriveEmail}
                    disabled={savingDriveEmail}
                    className="flex-1 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {savingDriveEmail ? 'Đang lưu...' : 'Lưu Gmail'}
                  </button>
                  <button
                    onClick={() => setIsEditingDriveEmail(false)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-1.5 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-base sm:text-lg font-bold text-white truncate">
                  {profile.driveEmail || 'Chưa thiết lập Gmail'}
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Video bài học sẽ được tự động chia sẻ riêng tới tài khoản Gmail này
                </p>
              </div>
            )}
          </div>

          {!isEditingDriveEmail && (
            <div className="pt-3 border-t border-slate-800/60 mt-2">
              <button
                onClick={() => setIsEditingDriveEmail(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#1B223C] hover:bg-[#232C4D] text-blue-300 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                {profile.driveEmail ? 'Thay đổi Gmail' : 'Thêm Gmail nhận Google Drive'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Membership Stats */}
      {profile.hasMembership && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Gói hội viên', value: profile.membershipName },
            { label: 'Đã nhận hôm nay', value: `${profile.dailyClaimedCount} / ${profile.dailyQuota === -1 ? '∞' : profile.dailyQuota}` },
            { label: 'Hết hạn', value: profile.membershipExpiresAt ? new Date(profile.membershipExpiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn' },
          ].map((s) => (
            <div key={s.label} className="bg-[#141828] rounded-2xl p-4 text-center">
              <div className="font-black text-amber-400 text-lg">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-[#141828] p-1 rounded-xl inline-flex gap-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'courses' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} /> Khóa học của tôi ({courses.length})
          </button>
        </div>
        <Link
          href="/khoa-hoc-cua-toi"
          className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
        >
          <span>Xem chế độ danh sách học</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Course List */}
      {coursesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#141828] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-[#141828]">
          <FolderOpen size={44} className="mx-auto text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Chưa có khóa học nào</h3>
          <p className="text-slate-400 text-xs mb-6">Hãy chọn các khóa học bạn yêu thích để bắt đầu học nhé!</p>
          <Link href="/mua" className="btn-primary">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-[#141828] hover:bg-[#181D30] rounded-2xl overflow-hidden transition-all flex flex-col justify-between border border-slate-800/60">
              <div className="relative w-full h-36 bg-[#1A2035] overflow-hidden">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 min-h-[36px]">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg mb-3">
                    <CheckCircle size={12} />
                    <span>Đã phân quyền Google Drive</span>
                  </div>
                </div>
                <button
                  onClick={() => handleGetDriveLink(course.id)}
                  disabled={loadingLink === course.id}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 shadow-md"
                >
                  <ExternalLink size={14} />
                  {loadingLink === course.id ? 'Đang lấy link...' : driveLinks[course.id] ? 'Mở Google Drive' : '📁 Mở Video Google Drive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131728] border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-amber-400 font-black text-lg">
              <Wallet size={22} />
              <span>Nạp Tiền Vào Ví</span>
            </div>

            {!depositData ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Chọn mệnh giá hoặc nhập số tiền bạn muốn nạp vào ví tài khoản:
                </p>

                {/* Preset amounts */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        depositAmount === amt
                          ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                          : 'border-slate-800 bg-[#0F1322] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {new Intl.NumberFormat('vi-VN').format(amt)} đ
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Hoặc nhập số tiền khác (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    min={10000}
                    step={10000}
                    className="w-full bg-[#0F1322] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={handleCreateDeposit}
                  disabled={depositLoading || depositAmount < 10000}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md disabled:opacity-60"
                >
                  {depositLoading ? 'Đang tạo mã nạp...' : 'Tạo Mã QR Nạp Tiền'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-md">
                  <img
                    src={depositData.vietQrUrl}
                    alt="VietQR nạp tiền"
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                </div>

                <div className="bg-[#0F1322] border border-slate-800 rounded-xl p-3 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-white">{depositData.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <span className="font-bold text-amber-400">{depositData.bankAccountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-white">{depositData.bankAccountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(depositData.amount)} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nội dung chuyển khoản:</span>
                    <span className="font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">{depositData.transferContent}</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/90 font-medium">
                  ⚡ Hệ thống sẽ tự động cộng tiền vào ví trong vòng 1-2 phút sau khi chuyển khoản thành công.
                </p>

                <button
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['profile'] });
                    setShowDepositModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Tôi Đã Chuyển Khoản Xong
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
