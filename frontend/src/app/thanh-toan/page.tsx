'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Check, Copy, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function ThanhToanPage() {
  const router = useRouter();
  const { items, clearCart, total } = useCartStore();

  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', coupon: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Polling kiểm tra thanh toán mỗi 4 giây
  useEffect(() => {
    if (step !== 'qr' || !orderData?.orderCode) return;

    const interval = setInterval(async () => {
      try {
        const res: any = await orderApi.checkStatus(orderData.orderCode);
        if (res?.data?.status === 'PAID') {
          clearInterval(interval);
          setStep('success');
          clearCart();
          toast.success('Thanh toán thành công! 🎉');
        }
        setPollingCount((c) => c + 1);
      } catch {/* ignore */}
    }, 4000);

    return () => clearInterval(interval);
  }, [step, orderData?.orderCode]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email không hợp lệ';
    if (form.phone && !form.phone.match(/^[0-9]{10,11}$/)) e.phone = 'Số điện thoại không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    if (items.length === 0) { toast.error('Giỏ hàng trống!'); return; }

    setLoading(true);
    try {
      const res: any = await orderApi.checkout({
        courseIds: items.map((i) => i.id),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone || undefined,
        couponCode: form.coupon || undefined,
      });
      setOrderData(res.data);
      setStep('qr');
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
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Thanh toán thành công! 🎉</h1>
        <p className="text-slate-300 text-sm mb-2">
          Link Google Drive đã được gửi vào email <strong className="text-amber-400">{orderData?.customerEmail || form.email}</strong>
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Bạn cũng có thể xem và tải tài liệu bất cứ lúc nào trong trang Khóa học của tôi.
        </p>
        <div className="flex flex-col gap-3">
          <a href="/khoa-hoc-cua-toi" className="btn-primary justify-center">
            📁 Vào Khóa học của tôi
          </a>
          <a href="/mua" className="px-6 py-3 rounded-xl bg-[#141828] hover:bg-[#1C2238] text-slate-300 text-xs font-bold transition-colors">
            Tiếp tục xem khóa học
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Thanh toán đơn hàng</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Bàn giao tự động qua Google Drive ngay sau khi hệ thống nhận thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* LEFT: Form / QR */}
        <div className="md:col-span-3">
          {step === 'form' ? (
            <div className="bg-[#141828] rounded-2xl p-6 sm:p-7 shadow-sm">
              <h2 className="font-bold text-white text-lg mb-5">Thông tin nhận hàng</h2>

              {[
                { key: 'name', label: 'Họ và tên *', type: 'text', placeholder: 'Nguyễn Văn A' },
                { key: 'email', label: 'Email nhận link Google Drive *', type: 'email', placeholder: 'email@gmail.com' },
                { key: 'phone', label: 'Số điện thoại / Zalo', type: 'tel', placeholder: '0xxx xxx xxx' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${
                      errors[key] ? 'ring-1 ring-rose-500' : ''
                    }`}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                  {errors[key] && <p className="text-rose-400 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mã giảm giá (nếu có)</label>
                <input
                  type="text"
                  placeholder="Nhập mã coupon..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1F253C] hover:bg-[#252D48] focus:bg-[#252D48] text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                  value={form.coupon}
                  onChange={(e) => setForm({ ...form, coupon: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="text-xs text-amber-300 bg-amber-400/10 rounded-xl p-3.5 mb-6 flex gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-400" />
                <span>Link Google Drive sẽ được gửi vào email trên và mở tự động ngay sau khi thanh toán.</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Đang tạo đơn...</>
                ) : '💳 Tiến hành thanh toán'}
              </button>
            </div>
          ) : (
            /* QR PAYMENT SCREEN */
            <div className="bg-[#141828] rounded-2xl p-6 sm:p-7 text-center">
              <h2 className="font-bold text-white text-lg mb-1">Quét mã QR để thanh toán</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">
                Mở app ngân hàng bất kỳ, quét mã VietQR hoặc chuyển khoản theo thông tin bên dưới
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
                Đang chờ hệ thống xác nhận thanh toán... ({pollingCount > 0 ? `đã kiểm tra ${pollingCount} lần` : 'vừa bắt đầu'})
              </div>

              <p className="text-[11px] text-slate-400">
                ⚡ Hệ thống tự động xác nhận và cấp quyền truy cập trong ~30 giây sau khi chuyển khoản.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="md:col-span-2">
          <div className="sticky top-20 bg-[#141828] rounded-2xl p-6">
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
            <div className="mt-5 space-y-2 pt-3">
              {['⚡ Nhận link Google Drive trong ~30 giây', '📁 Bàn giao tự động qua Gmail', '♾️ Quyền sở hữu trọn đời, không giới hạn'].map((t) => (
                <p key={t} className="text-xs text-slate-400">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
