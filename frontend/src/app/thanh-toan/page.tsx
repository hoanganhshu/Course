'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { orderApi, authApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Check, Copy, RefreshCw, AlertCircle, ShoppingCart, Wallet, QrCode, Mail } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function ThanhToanPage() {
  const router = useRouter();
  const { items, clearCart, total } = useCartStore();

  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'WALLET'>('BANK_TRANSFER');

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    driveEmail: '',
    phone: '',
    coupon: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Lấy profile nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi.getProfile()
        .then((res: any) => {
          const user = res.data;
          setProfile(user);
          setForm((prev) => ({
            ...prev,
            name: prev.name || user.name || '',
            email: prev.email || user.email || '',
            driveEmail: prev.driveEmail || user.driveEmail || (user.email?.endsWith('@gmail.com') ? user.email : ''),
            phone: prev.phone || user.phone || ''
          }));
        })
        .catch(() => {});
    }
  }, []);

  // Polling kiểm tra thanh toán mỗi 4 giây khi quét mã QR
  useEffect(() => {
    if (step !== 'qr' || !orderData?.orderCode) return;

    const interval = setInterval(async () => {
      try {
        const res: any = await orderApi.checkStatus(orderData.orderCode);
        if (res?.data?.status === 'PAID') {
          clearInterval(interval);
          setStep('success');
          clearCart();
          toast.success('Thanh toán thành công! Khóa học đã được chia sẻ tới Gmail.');
        }
        setPollingCount((c) => c + 1);
      } catch {/* ignore */}
    }, 4000);

    return () => clearInterval(interval);
  }, [step, orderData?.orderCode]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email liên hệ không hợp lệ';

    // Bắt buộc Gmail để phân quyền Google Drive
    const cleanDriveEmail = form.driveEmail.trim().toLowerCase();
    if (!cleanDriveEmail) {
      e.driveEmail = 'Vui lòng nhập tài khoản Gmail để nhận quyền Google Drive';
    } else if (!cleanDriveEmail.endsWith('@gmail.com')) {
      e.driveEmail = 'Bắt buộc phải là tài khoản Gmail (@gmail.com) để Google Drive cấp quyền';
    }

    if (form.phone && !form.phone.match(/^[0-9]{10,11}$/)) e.phone = 'Số điện thoại không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error('Giỏ hàng trống!'); return; }

    const orderTotal = total();
    const currentBalance = profile?.balance ?? 0;

    if (paymentMethod === 'WALLET') {
      if (!profile) {
        toast.error('Vui lòng đăng nhập để thanh toán bằng số dư Ví');
        router.push('/dang-nhap-dang-ky');
        return;
      }
      if (currentBalance < orderTotal) {
        toast.error(`Số dư ví (${fmt(currentBalance)}) không đủ để thanh toán đơn hàng (${fmt(orderTotal)})`);
        return;
      }
    }

    setLoading(true);
    try {
      const res: any = await orderApi.checkout({
        courseIds: items.map((i) => i.id),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone || undefined,
        driveEmail: form.driveEmail.trim().toLowerCase(),
        paymentMethod: paymentMethod,
        couponCode: form.coupon || undefined,
      });

      setOrderData(res.data);

      if (paymentMethod === 'WALLET' || res.data?.status === 'PAID') {
        clearCart();
        setStep('success');
        toast.success('Thanh toán ví thành công! Đã tự động phân quyền Google Drive.');
      } else {
        setStep('qr');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(orderData?.transferContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0 && step === 'form') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-[#141828] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={36} className="text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-400 text-sm mb-6">Hãy thêm khóa học vào giỏ hàng trước nhé.</p>
        <a href="/mua" className="btn-primary">Khám phá khóa học</a>
      </div>
    );
  }

  // === SUCCESS SCREEN ===
  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Kích hoạt khóa học thành công! 🎉</h1>
        <div className="bg-[#141828] border border-slate-800 rounded-2xl p-5 mb-6 text-left text-xs space-y-2">
          <p className="text-slate-300">
            Hệ thống đã tự động cấp quyền truy cập Google Drive tới:
          </p>
          <div className="font-bold text-amber-400 text-sm bg-amber-400/10 px-3 py-2 rounded-xl flex items-center gap-2">
            <Mail size={16} />
            <span>{form.driveEmail || orderData?.customerEmail}</span>
          </div>
          <p className="text-slate-400 text-[11px] pt-1">
            ⚡ Vui lòng kiểm tra hộp thư Gmail (hoặc mục "Được chia sẻ với tôi" trên Google Drive) để vào học ngay lập tức.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <a href="/khoa-hoc-cua-toi" className="btn-primary justify-center shadow-lg">
            📁 Vào Khóa học của tôi
          </a>
          <a href="/mua" className="px-6 py-3 rounded-xl bg-[#141828] hover:bg-[#1C2238] text-slate-300 text-xs font-bold transition-colors">
            Tiếp tục khám phá khóa học
          </a>
        </div>
      </div>
    );
  }

  const currentBalance = profile?.balance ?? 0;
  const canPayWithWallet = profile && currentBalance >= total();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Thanh toán đơn hàng</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Hệ thống tự động kiểm tra tài khoản và chia sẻ video qua Google Drive ngay khi nhận được tiền
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* LEFT: Form / QR */}
        <div className="md:col-span-3">
          {step === 'form' ? (
            <div className="bg-[#141828] rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800/60">
              <h2 className="font-bold text-white text-lg mb-5">Thông tin nhận khóa học</h2>

              {/* BẮT BUỘC NHẬP GMAIL GOOGLE DRIVE */}
              <div className="mb-5 bg-gradient-to-r from-blue-950/40 to-[#12162B] border border-blue-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1.5">
                  <Mail size={16} />
                  <span>Tài khoản Gmail nhận quyền Google Drive *</span>
                </div>
                <input
                  type="email"
                  placeholder="vidu@gmail.com"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#0F1322] border ${
                    errors.driveEmail ? 'border-rose-500' : 'border-blue-500/40'
                  } text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors`}
                  value={form.driveEmail}
                  onChange={(e) => setForm({ ...form, driveEmail: e.target.value })}
                />
                {errors.driveEmail && <p className="text-rose-400 text-xs mt-1">{errors.driveEmail}</p>}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  🔒 Video bài học sẽ được backend cấp quyền trực tiếp cho tài khoản Gmail này để đảm bảo an toàn.
                </p>
              </div>

              {/* Thông tin cá nhân */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${
                      errors.name ? 'ring-1 ring-rose-500' : ''
                    }`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email liên hệ / nhận hóa đơn *</label>
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${
                      errors.email ? 'ring-1 ring-rose-500' : ''
                    }`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số điện thoại / Zalo</label>
                  <input
                    type="tel"
                    placeholder="0xxx xxx xxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mã giảm giá (nếu có)</label>
                  <input
                    type="text"
                    placeholder="Nhập mã coupon..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                    value={form.coupon}
                    onChange={(e) => setForm({ ...form, coupon: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* PHƯƠNG THỨC THANH TOÁN */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 mb-2">Chọn phương thức thanh toán:</label>
                <div className="space-y-2.5">
                  {/* Option 1: VietQR */}
                  <label
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-slate-800 bg-[#0F1322] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                        <QrCode size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Chuyển khoản QR ngân hàng (VietQR)</div>
                        <div className="text-[11px] text-slate-400">Quét mã thanh toán qua mọi app ngân hàng</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="text-amber-400 focus:ring-0"
                    />
                  </label>

                  {/* Option 2: Số dư ví */}
                  {profile && (
                    <label
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'WALLET'
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-slate-800 bg-[#0F1322] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
                          <Wallet size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Thanh toán bằng Số dư Ví</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              Hiện có: {fmt(currentBalance)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">Trừ tiền ví và mở khóa học tức thì</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'WALLET'}
                        onChange={() => setPaymentMethod('WALLET')}
                        className="text-amber-400 focus:ring-0"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Đang xử lý...</>
                ) : paymentMethod === 'WALLET' ? (
                  `⚡ Thanh toán ngay bằng Ví (${fmt(total())})`
                ) : (
                  '💳 Tiến hành tạo mã QR thanh toán'
                )}
              </button>
            </div>
          ) : (
            /* QR PAYMENT SCREEN */
            <div className="bg-[#141828] rounded-2xl p-6 sm:p-7 text-center border border-slate-800/60">
              <h2 className="font-bold text-white text-lg mb-1">Quét mã QR để thanh toán</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">
                Mở app ngân hàng bất kỳ, quét mã VietQR hoặc chuyển khoản đúng nội dung bên dưới
              </p>

              {/* QR Code */}
              {orderData?.vietQrUrl && (
                <div className="flex justify-center mb-5">
                  <div className="p-3.5 rounded-2xl bg-white shadow-md inline-block">
                    <Image
                      src={orderData.vietQrUrl}
                      alt="VietQR Code"
                      width={220}
                      height={220}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Bank Info */}
              <div className="bg-[#1F253C] rounded-xl p-4 text-left space-y-2.5 mb-5 text-xs sm:text-sm">
                {[
                  ['Ngân hàng', orderData?.bankName],
                  ['Số tài khoản', orderData?.bankAccountNumber],
                  ['Chủ tài khoản', orderData?.bankAccountName],
                  ['Số tiền', fmt(orderData?.totalAmount)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}:</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 text-xs sm:text-sm">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400 text-sm sm:text-base">{orderData?.transferContent}</span>
                    <button
                      onClick={copyContent}
                      className="p-1 bg-[#283150] text-slate-300 hover:text-white rounded-lg transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-300 bg-amber-400/10 rounded-xl py-3 mb-3">
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></div>
                Đang chờ xác nhận từ ngân hàng... ({pollingCount > 0 ? `đã kiểm tra ${pollingCount} lần` : 'vừa bắt đầu'})
              </div>

              <p className="text-[11px] text-slate-400">
                ⚡ Ngay khi nhận được tiền, backend sẽ tự động phân quyền Google Drive cho Gmail: <strong className="text-amber-400">{form.driveEmail}</strong>
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="md:col-span-2">
          <div className="sticky top-20 bg-[#141828] rounded-2xl p-6 border border-slate-800/60">
            <h3 className="font-bold text-white mb-4 text-base">Đơn hàng của bạn</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={52}
                      height={36}
                      className="rounded-lg object-cover flex-shrink-0 bg-[#1A2035] w-14 h-10"
                    />
                  ) : (
                    <div className="w-14 h-10 bg-[#1A2035] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-base">📚</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white line-clamp-2">{item.title}</p>
                    <p className="text-amber-400 font-bold text-xs mt-0.5">{fmt(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính ({items.length} khóa)</span>
                <span className="text-slate-300 font-semibold">{fmt(total())}</span>
              </div>
              {orderData?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá</span>
                  <span>-{fmt(orderData.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 text-white">
                <span>Tổng thanh toán</span>
                <span className="text-amber-400 font-black text-lg">{fmt(orderData?.totalAmount ?? total())}</span>
              </div>
            </div>

            {/* Trust badges mini */}
            <div className="mt-5 space-y-2 pt-3 border-t border-slate-800/60">
              {['⚡ Phân quyền Google Drive tự động trong ~30 giây', '📁 Bàn giao video bản quyền trực tiếp qua Gmail', '♾️ Quyền sở hữu trọn đời, truy cập mọi lúc'].map((t) => (
                <p key={t} className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>{t}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
