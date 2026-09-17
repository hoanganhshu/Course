'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function GioHangPage() {
  const { items, removeItem, total } = useCartStore();

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
            <div key={item.id} className="bg-[#141828] hover:bg-[#181D30] rounded-2xl p-4 flex gap-4 transition-all">
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

        {/* Summary */}
        <div>
          <div className="sticky top-20 bg-[#141828] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 text-base">Tổng đơn hàng</h3>
            <div className="space-y-2.5 text-xs sm:text-sm mb-5">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính ({items.length} khóa)</span>
                <span className="text-slate-300 font-semibold">{fmt(total())}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-3 text-white">
                <span>Tổng cộng</span>
                <span className="text-amber-400 font-black text-lg">{fmt(total())}</span>
              </div>
            </div>

            <Link
              href="/thanh-toan"
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight size={15} />
            </Link>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Bạn sẽ nhập thông tin và quét VietQR ở bước tiếp theo
            </p>

            <div className="mt-5 space-y-1.5 pt-4">
              {['⚡ Nhận link Google Drive ~30 giây', '♾️ Quyền sở hữu trọn đời', '💬 Hỗ trợ kỹ thuật 24/7'].map((t) => (
                <p key={t} className="text-xs text-slate-400">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
