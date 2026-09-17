'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';

interface Course {
  id: number; slug: string; title: string; thumbnail?: string;
  price: number; originalPrice: number; effectivePrice: number;
  flashSalePrice?: number; flashSaleEndAt?: string;
}

function Countdown({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endAt).getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endAt]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
        <>
          <span key={i} className="flash-timer-box">{pad(v)}</span>
          {i < 2 && <span className="text-white font-bold text-xl">:</span>}
        </>
      ))}
    </div>
  );
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function FlashSaleSection({ courses }: { courses: Course[] }) {
  const endAt = courses[0]?.flashSaleEndAt;

  return (
    <section className="py-12 bg-gradient-to-r from-red-600 to-red-500">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Zap size={24} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl">FLASH SALE Theo khung giờ</h2>
              <p className="text-red-200 text-sm">Giảm thêm 5–10% · áp giá thật lúc thanh toán</p>
            </div>
          </div>
          {endAt && <Countdown endAt={endAt} />}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((course) => {
            const salePrice = course.flashSalePrice ?? course.effectivePrice;
            const pct = Math.round((1 - salePrice / course.originalPrice) * 100);
            return (
              <Link key={course.id} href={`/khoa-hoc/${course.slug}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                {course.thumbnail && (
                  <div className="relative">
                    <Image src={course.thumbnail} alt={course.title}
                      width={400} height={225} className="w-full h-40 object-cover" />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{pct}%
                    </span>
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Zap size={10} className="fill-yellow-900" /> FLASH
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-black text-base">{fmt(salePrice)}</span>
                    <span className="text-gray-400 line-through text-xs">{fmt(course.originalPrice)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-red-200 text-xs text-center mt-4">
          Giá Flash chỉ hiệu lực trong khung đang diễn ra và được tính lại lúc tạo đơn.
        </p>
      </div>
    </section>
  );
}
