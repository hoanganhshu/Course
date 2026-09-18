'use client';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-transparent overflow-hidden">
      {/* Subtle, refined ambient lighting centered */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="w-[800px] h-[450px] bg-indigo-500/15 blur-[140px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-12 md:pt-16 md:pb-16 text-center">
        {/* Headline gọn gàng, tinh tế, vừa vặn mắt nhìn */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white leading-tight md:leading-tight mb-4 tracking-tight">
          Marketing, Thiết Kế, IT & Ngoại Ngữ.<br />
          <span className="text-white font-extrabold">
            Giá Tốt — Bàn Giao Tự Động Qua Drive.
          </span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-8">
          Truy cập hơn 2.000+ bộ khóa học chất lượng cao, tài nguyên số chuẩn quốc tế, kích hoạt nhanh chóng và sở hữu trọn đời.
        </p>

        {/* Action CTAs (Không stroke) */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <Link
            href="/mua"
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
          >
            <Zap size={17} className="fill-slate-950" />
            Khám phá 2.000+ Khóa học
          </Link>
          <Link
            href="/combo"
            className="w-full sm:w-auto bg-[#141622] hover:bg-[#1A1D2D] text-slate-200 font-semibold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
          >
            Combo Tiết Kiệm <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
