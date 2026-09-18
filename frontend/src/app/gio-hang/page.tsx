'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  Wallet,
  QrCode,
  Copy,
  Check,
  X,
  Sparkles,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/store/cartStore';
import { authApi, walletApi } from '@/lib/api';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function GioHangPage() {
  const { items, removeItem, total, isMounted } = useCart();

  // User profile & Wallet states
  const [profile, setProfile] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositData, setDepositData] = useState<any>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load user & balance
  const fetchBalance = async () => {
    try {
      const res: any = await authApi.getProfile();
      if (res?.data) {
        setProfile(res.data);
        const email = res.data.email;
        const stored = localStorage.getItem(`user_balance_${email}`);
        setUserBalance(stored !== null ? Number(stored) : (res.data.balance || 0));
        return;
      }
    } catch {}

    const local = localStorage.getItem('user_profile');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setProfile(parsed);
        const email = parsed.email;
        const stored = localStorage.getItem(`user_balance_${email}`);
        setUserBalance(stored !== null ? Number(stored) : (parsed.balance || 0));
      } catch {}
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Handle deposit creation with unique random memo
  const handleCreateDeposit = async () => {
    if (depositAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000 đ');
      return;
    }
    setDepositLoading(true);

    const bankAccountNumber = '0583953426';
    const bankAccountName = 'NGUYEN HOANG ANH';
    const bankName = 'MB Bank (Ngân hàng Quân Đội)';
    const userId = profile?.id || 8;

    // Sinh mã ngẫu nhiên duy nhất: NAP{userId}X{6_random_digits}
    const all = JSON.parse(localStorage.getItem('app_all_deposits') || '[]');
    let uniqueCode = '';
    let isDuplicate = true;
    let attempts = 0;

    while (isDuplicate && attempts < 100) {
      attempts++;
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const candidateCode = `NAP${userId}X${randomNum}`;
      const found = all.some((item: any) => item.transactionCode === candidateCode);
      if (!found) {
        uniqueCode = candidateCode;
        isDuplicate = false;
      }
    }

    const vietQrUrl = `https://img.vietqr.io/image/MB-${bankAccountNumber}-compact2.png?amount=${depositAmount}&addInfo=${uniqueCode}&accountName=${encodeURIComponent(bankAccountName)}`;

    const finalData = {
      depositCode: uniqueCode,
      amount: depositAmount,
      vietQrUrl,
      bankName,
      bankAccountNumber,
      bankAccountName,
      transferContent: uniqueCode,
    };

    try {
      await walletApi.deposit(depositAmount);
    } catch {}

    setDepositData(finalData);

    // Lưu vào hàng đợi nạp tiền
    try {
      const newDepositItem = {
        id: 'dep-' + Date.now(),
        transactionCode: uniqueCode,
        userId: profile?.id || 8,
        userName: profile?.name || 'Khách hàng',
        userEmail: profile?.email || 'user@gmail.com',
        userPhone: profile?.phone || '',
        amount: depositAmount,
        status: 'PENDING',
        createdAt: new Date().toLocaleString('vi-VN'),
        bankName,
        bankAccountNumber,
        bankAccountName,
      };
      localStorage.setItem('app_all_deposits', JSON.stringify([newDepositItem, ...all]));
    } catch {}

    setDepositLoading(false);
  };

  const openDepositWithAmount = (amt: number) => {
    setDepositAmount(amt);
    setDepositData(null);
    setShowDepositModal(true);
  };

  if (!isMounted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-[#141828] rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart size={36} className="text-slate-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Giỏ hàng trống</h2>
      <p className="text-slate-400 text-sm mb-6">Thêm khóa học vào giỏ để tiếp tục nhé.</p>
      <Link href="/mua" className="btn-primary">
        Khám phá khóa học
      </Link>
    </div>
  );

  const cartTotal = total();
  const hasEnoughBalance = profile && userBalance >= cartTotal;
  const balanceDifference = cartTotal - userBalance;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Giỏ hàng ({items.length} khóa học)
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Kích hoạt tức thì & bàn giao qua Google Drive sau khi thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-3.5">
          {items.map((item) => (
            <div key={item.id} className="bg-[#141828] hover:bg-[#181D30] rounded-2xl p-4 flex gap-4 transition-all border border-slate-800/40">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={96}
                  height={64}
                  className="rounded-xl object-cover flex-shrink-0 w-24 h-16 bg-[#1A2035]"
                />
              ) : (
                <div className="w-24 h-16 bg-[#1A2035] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <Link href={`/khoa-hoc/${item.slug}`} className="font-bold text-white text-sm hover:text-amber-400 line-clamp-2 transition-colors">
                  {item.title}
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black text-sm">{fmt(item.price)}</span>
                    {item.price < item.originalPrice && (
                      <span className="text-slate-500 line-through text-xs">{fmt(item.originalPrice)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary & Wallet Section */}
        <div className="space-y-4">
          {/* Order Summary Card */}
          <div className="bg-[#141828] rounded-2xl p-6 border border-slate-800/60 shadow-lg">
            <h3 className="font-bold text-white mb-4 text-base">Tổng đơn hàng</h3>
            <div className="space-y-2.5 text-xs sm:text-sm mb-5">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính ({items.length} khóa)</span>
                <span className="text-slate-300 font-semibold">{fmt(cartTotal)}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-3 border-t border-slate-800/60 text-white">
                <span>Tổng cộng</span>
                <span className="text-amber-400 font-black text-lg">{fmt(cartTotal)}</span>
              </div>
            </div>

            {/* Quick Wallet Pay button if enough balance */}
            {hasEnoughBalance && (
              <Link
                href="/thanh-toan"
                className="w-full mb-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs sm:text-sm"
              >
                <Sparkles size={15} />
                <span>Thanh toán ngay bằng Ví ({fmt(userBalance)})</span>
              </Link>
            )}

            <Link
              href="/thanh-toan"
              className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all shadow-sm text-sm ${
                hasEnoughBalance
                  ? 'bg-[#1E253E] hover:bg-[#252E4D] text-slate-300 hover:text-white text-xs'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <span>{hasEnoughBalance ? 'Các phương thức thanh toán khác' : 'Tiến hành thanh toán'}</span>
              <ArrowRight size={15} />
            </Link>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Quét VietQR tự động hoặc thanh toán bằng số dư ví
            </p>

            <div className="mt-5 space-y-1.5 pt-4 border-t border-slate-800/50">
              {['⚡ Nhận link Google Drive ~30 giây', '♾️ Quyền sở hữu trọn đời', '💬 Hỗ trợ kỹ thuật 24/7'].map((t) => (
                <p key={t} className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>{t}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Dedicated Wallet Card in Cart Page */}
          <div className="bg-gradient-to-br from-[#141828] to-[#181F3B] border border-amber-500/25 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                <Wallet size={16} />
                <span>Ví Số Dư Tài Khoản</span>
              </div>
              {profile ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasEnoughBalance ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {hasEnoughBalance ? 'Đủ thanh toán' : 'Cần nạp thêm'}
                </span>
              ) : null}
            </div>

            {profile ? (
              <>
                <div className="my-2">
                  <div className="text-2xl font-black text-white">{fmt(userBalance)}</div>
                  {!hasEnoughBalance && balanceDifference > 0 && (
                    <p className="text-slate-400 text-xs mt-1">
                      Còn thiếu <span className="text-rose-400 font-bold">{fmt(balanceDifference)}</span> để thanh toán đơn này.
                    </p>
                  )}
                  {hasEnoughBalance && (
                    <p className="text-emerald-400 text-xs mt-1">
                      Số dư ví đủ để thanh toán ngay lập tức!
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/60 mt-3 space-y-2">
                  <button
                    onClick={() => openDepositWithAmount(balanceDifference > 0 ? balanceDifference : 100000)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
                  >
                    <PlusCircle size={15} />
                    <span>Nạp tiền vào ví (VietQR)</span>
                  </button>
                  {balanceDifference > 0 && (
                    <button
                      onClick={() => openDepositWithAmount(balanceDifference)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#1B223C] hover:bg-[#232C4E] text-amber-300 font-semibold text-[11px] py-1.5 rounded-lg transition-colors border border-amber-500/20"
                    >
                      <Sparkles size={12} />
                      <span>Nạp đúng số thiếu ({fmt(balanceDifference)})</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-2 text-center space-y-3">
                <p className="text-slate-400 text-xs">
                  Đăng nhập để xem số dư ví và thanh toán đơn hàng tức thì.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors text-center"
                  >
                    Đăng nhập
                  </Link>
                  <button
                    onClick={() => openDepositWithAmount(100000)}
                    className="flex-1 py-2 bg-[#1E253E] hover:bg-[#252E4D] text-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-700/60"
                  >
                    Nạp tiền ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL NẠP TIỀN VÀO VÍ TRỰC TIẾP TRONG GIỎ HÀNG */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141828] border border-slate-800 rounded-3xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nạp tiền vào ví tài khoản</h3>
                <p className="text-xs text-slate-400">Quét VietQR nạp tiền nhanh 24/7</p>
              </div>
            </div>

            {!depositData ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Chọn mệnh giá hoặc nhập số tiền bạn muốn nạp vào ví:
                </p>

                {/* Quick amount matching cart difference */}
                {balanceDifference > 0 && (
                  <button
                    type="button"
                    onClick={() => setDepositAmount(balanceDifference)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      depositAmount === balanceDifference
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-slate-800 bg-[#0F1322] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Nạp vừa đủ đơn hàng hiện tại</span>
                    </span>
                    <span className="font-black text-amber-400">{fmt(balanceDifference)}</span>
                  </button>
                )}

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
                  <div className="flex justify-between items-center bg-[#181F36] p-2 rounded-lg border border-amber-500/30">
                    <div>
                      <span className="text-slate-300 font-semibold block text-[11px]">Nội dung chuyển khoản (Bắt buộc):</span>
                      <span className="font-mono font-black text-amber-400 text-sm tracking-wider">{depositData.transferContent}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(depositData.transferContent);
                        setCopiedCode(true);
                        toast.success(`Đã sao chép nội dung: ${depositData.transferContent}`);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm flex-shrink-0"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 text-left space-y-1">
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                    <span>⚡</span> Mã nạp ngẫu nhiên định danh duy nhất!
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Vui lòng <strong>giữ nguyên nội dung chuyển khoản</strong> trên khi quét VietQR. Hệ thống sẽ nhận diện chính xác và cộng số dư ví cho bạn trong 1-2 phút.
                  </p>
                </div>

                <button
                  onClick={() => {
                    fetchBalance();
                    setShowDepositModal(false);
                    toast.success('Đã ghi nhận yêu cầu nạp tiền! Số dư sẽ được cập nhật sau khi Admin duyệt.');
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

