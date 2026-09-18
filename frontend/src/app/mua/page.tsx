'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { ALL_COURSES, REAL_CATEGORIES, CourseItem } from '@/data/coursesCatalog';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

function MuaContent() {
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'registeredCount');
  const [page, setPage] = useState(0);
  const { addItem, isInCart } = useCart();
  const [customCourses, setCustomCourses] = useState<CourseItem[]>([]);

  useEffect(() => {
    try {
      const custom = localStorage.getItem('custom_admin_courses');
      if (custom) {
        setCustomCourses(JSON.parse(custom));
      }
    } catch {}
  }, []);

  // Hợp nhất toàn bộ khóa học thực từ Google Drive catalog và các khóa do Admin tạo
  const allAvailableCourses = useMemo(() => {
    if (customCourses.length === 0) return ALL_COURSES;
    return [...customCourses, ...ALL_COURSES.filter((c) => !customCourses.some((custom) => custom.id === c.id))];
  }, [customCourses]);

  // Bộ lọc siêu tốc 100% In-Memory (0ms delay khi chuyển trang / tìm kiếm)
  const filteredCatalog = useMemo(() => {
    let list = allAvailableCourses;
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter((c) => c.categorySlug === category);
    }
    if (sortBy === 'priceAsc') {
      list = [...list].sort((a, b) => a.effectivePrice - b.effectivePrice);
    } else if (sortBy === 'priceDesc') {
      list = [...list].sort((a, b) => b.effectivePrice - a.effectivePrice);
    } else if (sortBy === 'createdAt') {
      list = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    } else {
      list = [...list].sort((a, b) => b.registeredCount - a.registeredCount);
    }
    return list;
  }, [allAvailableCourses, keyword, category, sortBy]);

  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(filteredCatalog.length / PAGE_SIZE) || 1;
  const courses = useMemo(() => {
    return filteredCatalog.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredCatalog, page]);
  const totalElements = filteredCatalog.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleAddCart = (e: React.MouseEvent, course: any) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Tất cả khóa học</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Học liệu Google Drive trọn đời · Cập nhật mới liên tục · Tải trực tiếp siêu tốc
        </p>
      </div>

      {/* Filters bar - 100% stroke free */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm kiếm theo tên khóa học hoặc lĩnh vực..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#141828] hover:bg-[#1A2034] focus:bg-[#1A2034] rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
          <button type="submit" className="btn-primary px-5 py-2.5 text-xs sm:text-sm whitespace-nowrap">
            Tìm kiếm
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 bg-[#141828] hover:bg-[#1A2034] text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none min-w-[220px] cursor-pointer"
        >
          <option value="" className="bg-[#141828] text-white">
            -- Tất cả {REAL_CATEGORIES.length} danh mục --
          </option>
          {REAL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.slug} className="bg-[#141828] text-slate-200">
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 bg-[#141828] hover:bg-[#1A2034] text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none cursor-pointer"
        >
          <option value="registeredCount" className="bg-[#141828] text-white">⭐ Bán chạy nhất</option>
          <option value="createdAt" className="bg-[#141828] text-white">🆕 Mới nhất</option>
          <option value="priceAsc" className="bg-[#141828] text-white">💰 Giá thấp đến cao</option>
          <option value="priceDesc" className="bg-[#141828] text-white">💎 Giá cao đến thấp</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-400 mb-6">
        Tìm thấy <strong className="text-white">{totalElements.toLocaleString('vi-VN')}</strong> khóa học
        {keyword && <> cho "<span className="text-amber-400">{keyword}</span>"</>}
        {category && (
          <>
            {' '}
            trong danh mục <span className="text-amber-400">{REAL_CATEGORIES.find((c) => c.slug === category)?.name || category}</span>
          </>
        )}
        {' '}· Trang <span className="text-amber-400 font-bold">{page + 1}</span> / {totalPages}
      </p>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-[#141828]">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">Không tìm thấy kết quả</h3>
          <p className="text-slate-400 text-sm">Hãy thử tìm kiếm với từ khóa hoặc danh mục khác</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {courses.map((course) => {
              const pct = Math.round((1 - course.effectivePrice / course.originalPrice) * 100);
              const inCart = isInCart(course.id);
              return (
                <div
                  key={course.id}
                  className="course-card group bg-[#12141D] rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <Link href={`/khoa-hoc/${course.slug}`}>
                    <div className="relative w-full h-40 bg-[#1A2035] overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                      {pct > 0 && <span className="absolute top-2.5 left-2.5 course-card-badge-sale">-{pct}%</span>}
                      {course.isFlashSale && <span className="absolute top-2.5 right-2.5 course-card-badge-flash">⚡ FLASH</span>}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      {course.categoryName && (
                        <p className="text-[11px] font-semibold text-amber-400 mb-1">{course.categoryName}</p>
                      )}
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors min-h-[38px]">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="course-card-price text-base">{fmt(course.effectivePrice)}</span>
                        {course.effectivePrice < course.originalPrice && (
                          <span className="course-card-original-price">{fmt(course.originalPrice)}</span>
                        )}
                      </div>
                      {course.registeredCount > 0 && (
                        <p className="text-[11px] text-slate-400">{course.registeredCount.toLocaleString('vi-VN')} học viên đã sở hữu</p>
                      )}
                    </div>
                  </Link>

                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => handleAddCart(e, course)}
                      disabled={inCart}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : 'bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950'
                      }`}
                    >
                      <ShoppingCart size={14} />
                      {inCart ? '✓ Đã thêm' : 'Thêm giỏ hàng'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination siêu mượt (0ms delay) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl bg-[#141828] hover:bg-[#1C2238] text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                ← Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = page - 2 + i;
                if (page < 2) p = i;
                if (page > totalPages - 3) p = totalPages - 5 + i;
                if (p < 0 || p >= totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      p === page
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-[#141828] text-slate-300 hover:bg-[#1C2238]'
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl bg-[#141828] hover:bg-[#1C2238] text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MuaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <MuaContent />
    </Suspense>
  );
}
