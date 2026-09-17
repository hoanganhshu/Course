'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Users, Clock, Check, ChevronRight, Zap } from 'lucide-react';
import { courseApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

function FlashCountdown({ endAt }: { endAt: string }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const d = Math.max(0, new Date(endAt).getTime() - Date.now());
      setLeft({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endAt]);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="font-mono font-bold text-red-600">
      {p(left.h)}:{p(left.m)}:{p(left.s)}
    </span>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isInCart } = useCartStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getDetail(slug),
  });

  const course = (data as any)?.data;

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-64 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (isError || !course) return notFound();

  const inCart = isInCart(course.id);
  const pct = Math.round((1 - course.effectivePrice / course.originalPrice) * 100);

  const handleAddCart = () => {
    if (inCart) return;
    addItem({ id: course.id, title: course.title, slug: course.slug, thumbnail: course.thumbnail, price: course.effectivePrice, originalPrice: course.originalPrice });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="bg-transparent min-h-screen text-slate-100">
      {/* Breadcrumb */}
      <div className="py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-400">Trang chủ</Link>
          <ChevronRight size={13} />
          {course.categoryName && (
            <>
              <Link href={`/mua?category=${course.categorySlug}`} className="hover:text-amber-400">{course.categoryName}</Link>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-white font-medium line-clamp-1">{course.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === LEFT: Info === */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="rounded-2xl overflow-hidden mb-6 shadow-md bg-[#141828]">
                <Image src={course.thumbnail} alt={course.title} width={800} height={450} className="w-full object-cover max-h-[400px]" />
              </div>
            )}

            {/* Title & Meta */}
            <div className="bg-[#141828] rounded-2xl p-6 mb-5 shadow-sm">
              {course.categoryName && (
                <Link href={`/mua?category=${course.categorySlug}`} className="text-xs text-amber-400 font-semibold hover:underline mb-2 inline-block">
                  {course.categoryName}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl font-black text-white mb-3 leading-snug">
                {course.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                {course.registeredCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    {course.registeredCount.toLocaleString('vi-VN')} học viên
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-400" />
                  Nhận link Drive trong ~30 giây
                </span>
              </div>

              {course.description && (
                <p className="text-slate-300 text-sm leading-relaxed">{course.description}</p>
              )}
            </div>

            {/* Content / Curriculum */}
            {course.content && (
              <div className="bg-[#141828] rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-white text-base mb-4">Nội dung khóa học</h2>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{ __html: course.content }} />
              </div>
            )}

            {/* Thông tin nhận hàng */}
            <div className="bg-[#141828] rounded-2xl p-5 mt-5">
              <h3 className="font-bold text-white mb-3 text-sm">📦 Cách nhận tài liệu</h3>
              <ol className="space-y-2 text-xs text-slate-300">
                {['Thêm vào giỏ và điền thông tin nhận hàng', 'Thanh toán qua VietQR Napas kích hoạt tức thì', 'Nhận link Google Drive qua popup và email trong ~30 giây', 'Học trọn đời, xem lại không giới hạn'].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="bg-amber-400 text-slate-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* === RIGHT: Sticky Purchase Box === */}
          <div>
            <div className="bg-[#141828] rounded-2xl p-6 shadow-md sticky top-20">
              {/* Flash Sale Banner */}
              {course.flashSaleActive && course.flashSaleEndAt && (
                <div className="bg-rose-950/60 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                    <Zap size={14} className="fill-rose-400" /> Flash Sale kết thúc sau:
                  </div>
                  <FlashCountdown endAt={course.flashSaleEndAt} />
                </div>
              )}

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-black text-amber-400">{fmt(course.effectivePrice)}</span>
                  {pct > 0 && (
                    <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{pct}%</span>
                  )}
                </div>
                {course.effectivePrice < course.originalPrice && (
                  <span className="text-slate-500 line-through text-xs">{fmt(course.originalPrice)}</span>
                )}
              </div>

              {/* Combo badge */}
              {course.combo && (
                <div className="bg-indigo-950/60 rounded-xl p-3 mb-4 text-xs text-indigo-300">
                  📦 <strong>Khóa Combo</strong> – Bao gồm nhiều khóa học trong một gói
                </div>
              )}

              {/* CTA Buttons */}
              <button onClick={handleAddCart} disabled={inCart}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mb-3 transition-all ${
                  inCart ? 'bg-emerald-950/80 text-emerald-400 cursor-default' : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                }`}>
                <ShoppingCart size={16} />
                {inCart ? '✓ Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
              </button>

              {inCart && (
                <Link href="/thanh-toan"
                  className="w-full block text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-colors shadow-md text-sm">
                  💳 Thanh toán ngay
                </Link>
              )}

              {/* Trust mini */}
              <div className="mt-5 space-y-2 text-xs text-slate-400">
                {[
                  { icon: '⚡', text: 'Nhận link trong ~30 giây sau thanh toán' },
                  { icon: '📁', text: 'Google Drive – học trên mọi thiết bị' },
                  { icon: '♾️', text: 'Không giới hạn số lần xem, học trọn đời' },
                  { icon: '💬', text: 'Hỗ trợ xử lý nhanh 24/7' },
                ].map((t) => (
                  <p key={t.text} className="flex items-start gap-2">
                    <span>{t.icon}</span> {t.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
