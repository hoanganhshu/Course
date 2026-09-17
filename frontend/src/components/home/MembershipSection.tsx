import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

interface Plan {
  id: number; name: string; price: number; durationDays?: number;
  dailyQuota: number; allowCombo: boolean; benefits?: string;
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

const FEATURED: Record<string, boolean> = { Pro: true };

export default function MembershipSection({ memberships }: { memberships: Plan[] }) {
  return (
    <section className="py-14 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        {/* VIP 599K Banner */}
        <div className="bg-gradient-to-r from-[#12162B] via-[#151A33] to-[#0E1122] rounded-3xl p-8 md:p-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-white font-black text-2xl md:text-3xl mb-2">
              🏆 Trọn bộ hơn 2.000 khóa học
            </h3>
            <p className="text-slate-300 text-base">
              Truy cập toàn bộ kho khóa học trên website và nhận các nội dung mới được cập nhật liên tục.
            </p>
            <ul className="mt-3 space-y-1">
              {['Chỉ thanh toán 1 lần duy nhất','Quyền học trọn đời','Cập nhật khóa mới miễn phí'].map(b => (
                <li key={b} className="flex items-center gap-2 text-slate-300 text-sm">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-amber-400 font-black text-5xl">599K</div>
            <div className="text-slate-500 line-through text-sm">1.200K</div>
            <Link href="/khoa-hoc/tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien"
              className="mt-4 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-yellow-400/20">
              Xem gói 599K <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white">Gói Hội Viên – Học mỗi ngày, tiết kiệm mỗi ngày</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Chủ động nhận những khóa học phù hợp với mục tiêu của bạn.
            Khóa đã nhận được lưu trong tài khoản để học trọn đời.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {memberships.map((plan) => {
            const benefits: string[] = plan.benefits ? JSON.parse(plan.benefits) : [];
            const featured = FEATURED[plan.name];

            return (
              <div key={plan.id}
                className={`bg-[#11141E] rounded-2xl p-5 flex flex-col justify-between relative shadow-sm ${featured ? 'bg-[#15192A] shadow-[0_0_25px_rgba(245,158,11,0.12)]' : ''}`}>
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-md">
                    Phổ biến nhất
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-white text-base">Hội viên {plan.name}</h3>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {fmt(plan.price)}<span className="text-xs font-normal text-slate-400"> đ</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {plan.durationDays ? `${plan.durationDays} ngày` : 'Không giới hạn thời gian'}
                  </p>
                </div>

                <ul className="space-y-2 mb-5 flex-1">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {b}
                    </li>
                  ))}
                  {plan.allowCombo && (
                    <li className="flex items-start gap-2 text-xs text-indigo-300 font-medium">
                      <Check size={13} className="text-indigo-400 mt-0.5 flex-shrink-0" /> Bao gồm khóa Combo
                    </li>
                  )}
                </ul>

                <Link href={`/hoi-vien/${plan.name.toLowerCase()}`}
                  className={`block text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
                    featured
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-indigo-600/20 hover:bg-yellow-400 hover:text-slate-950 text-indigo-300'
                  }`}>
                  Xem quyền lợi →
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust points */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {[
            '✅ Nhận khóa mới theo quota mỗi ngày',
            '✅ Khóa đã nhận không mất khi gói hết hạn',
            '✅ Xem lại không giới hạn số lần',
          ].map((t) => (
            <span key={t} className="text-xs text-slate-400">{t}</span>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/combo" className="btn-primary inline-flex">
            Xem tất cả gói hội viên VIP <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
