'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { categoryApi } from '@/lib/api';
import { useCart } from '@/store/cartStore';
import { REAL_CATEGORIES, CATEGORY_COURSES_MAP, CourseItem } from '@/data/coursesCatalog';
import toast from 'react-hot-toast';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

const CATEGORY_ICONS: Record<string, string> = {
  'huong-dan-hoc-tap':        '📖',
  'cong-nghe-thong-tin':      '💻',
  'dung-phim-nhiep-anh':      '🎬',
  'dau-tu-tai-chinh':         '📈',
  'kiem-tien-mmo':            '💰',
  'kinh-doanh-khoi-nghiep':   '🏢',
  'khoa-hoc-tiktok':          '🎵',
  'ky-nang-mem':              '🌟',
  'marketing':                '📢',
  'ngoai-ngu':                '🌍',
  'thiet-ke-do-hoa':          '🎨',
  'tin-hoc-van-phong':        '📊',
  'khoa-hoc-khac':            '📚',
  'khoa-hoc-update-2025':     '✨',
  'qua-tang-ebook-audio-book':'🎁',
  'qua-tang-tai-nguyen':      '📦',
  'khoa-hoc-moi':             '🔥',
  'khoa-hoc-facebook':        '👍',
  'khoa-hoc-youtube':         '▶️',
  'combo-khoa-hoc':           '👑',
};

export default function CategoryGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('cong-nghe-thong-tin');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const { addItem, isInCart } = useCart();

  const { data } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoryApi.getTree(),
    staleTime: Infinity,
  });

  const apiCategories = ((data as any)?.data || []).filter((c: any) => c.slug !== 'combo-khoa-hoc');
  const categories = apiCategories.length > 0 ? apiCategories : REAL_CATEGORIES;

  const isMouseDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // Cuộn bằng con lăn chuột (Mouse Wheel Scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const preventDrag = (e: DragEvent) => e.preventDefault();
    el.addEventListener('dragstart', preventDrag);

    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      e.preventDefault();

      let step = delta;
      if (e.deltaMode === 1) {
        step = delta * 50;
      } else if (e.deltaMode === 2) {
        step = delta * 400;
      } else if (Math.abs(step) < 25) {
        step = Math.sign(step) * 80;
      } else {
        step = delta * 1.5;
      }

      el.scrollLeft += step;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('dragstart', preventDrag);
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Kéo thả chuột ngang (Mouse Drag Scroll mượt mà không chặn click)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX;
    scrollLeftRef.current = scrollRef.current?.scrollLeft || 0;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 8) {
      hasDraggedRef.current = true;
      scrollRef.current.scrollLeft = scrollLeftRef.current - dx;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleSelectCategory = (slug: string) => {
    if (hasDraggedRef.current) return;
    setActiveCategory(slug);
  };

  const handleAddCart = (e: React.MouseEvent, course: CourseItem) => {
    e.preventDefault();
    if (isInCart(course.id)) return;
    addItem({
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      price: course.effectivePrice,
      originalPrice: course.originalPrice,
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const currentCategory = categories.find((c: any) => c.slug === activeCategory) || REAL_CATEGORIES.find((c) => c.slug === activeCategory) || REAL_CATEGORIES[1];
  const categoryCourses = CATEGORY_COURSES_MAP[activeCategory] || [];
  const displayedCourses = (categoryCourses.length > 0 ? categoryCourses : (CATEGORY_COURSES_MAP['cong-nghe-thong-tin'] || [])).slice(0, 8);

  return (
    <section className="py-10 bg-transparent relative">
      {/* Ánh sáng dịu tỏa ra ở giữa */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="w-[900px] h-[450px] bg-indigo-500/10 blur-[140px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* THANH CUỘN DANH MỤC THỰC TẾ TỪ GOOGLE DRIVE */}
        <div className="mb-10 max-w-4xl mx-auto px-4 sm:px-8">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="overflow-x-auto no-scrollbar py-2.5 flex items-center gap-2 cursor-grab active:cursor-grabbing select-none px-2"
          >
            {categories.map((cat: any) => {
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all flex items-center gap-1.5 select-none cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'bg-[#141622] hover:bg-[#1C2032] text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{CATEGORY_ICONS[cat.slug] || '📚'}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DANH SÁCH KHÓA HỌC THỰC TẾ CỦA LĨNH VỰC ĐANG CHỌN (GRID 4 CỘT) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>{CATEGORY_ICONS[currentCategory?.slug] || '📚'}</span>
              <span>Lĩnh vực đang chọn</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Khóa học {currentCategory?.name || 'nổi bật'}
            </h2>
          </div>
          <Link
            href={`/mua?category=${activeCategory}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả {CATEGORY_COURSES_MAP[activeCategory]?.length || ''} khóa</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* GRID 4 CỘT HIỂN THỊ KHÓA HỌC GOOGLE DRIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCourses.map((course) => {
            const added = isInCart(course.id);
            const discountPct = course.originalPrice > course.effectivePrice
              ? Math.round((1 - course.effectivePrice / course.originalPrice) * 100)
              : 0;

            return (
              <div
                key={course.id}
                className="group rounded-2xl bg-[#141622] hover:bg-[#181B2A] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#10131E]">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                        {course.badge}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors mb-2 min-h-[36px]">
                      <Link href={`/khoa-hoc/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span>{course.registeredCount} học viên</span>
                      <span>·</span>
                      <span className="text-emerald-400">📁 Google Drive</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-black text-amber-400">
                        {fmt(course.effectivePrice)}
                      </span>
                      {course.originalPrice > course.effectivePrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {fmt(course.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => handleAddCart(e, course)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      added
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-md'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={14} />
                        <span>Đã thêm giỏ</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
