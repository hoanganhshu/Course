'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Bell, Search, User, Menu, X, ChevronDown, ChevronRight, Home } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { categoryApi, courseApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useDebounce } from '@/hooks/useDebounce';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('/');
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setIsLoggedIn(typeof window !== 'undefined' && !!localStorage.getItem('accessToken'));
    setActiveNav(pathname || '/');
  }, [pathname]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoryApi.getTree(),
    staleTime: Infinity,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => courseApi.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30_000,
  });

  const categories = (categoriesData as any)?.data || [];
  const courses = (searchResults as any)?.data?.content || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

  return (
    <header className="relative w-full z-40">
      {/* ===== 1. TOP PROMO BANNER (GRADIENT RỰC RỠ & NỔI BẬT) ===== */}
      <Link
        href="/khoa-hoc/tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien"
        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#E11D48] via-[#F97316] to-[#F59E0B] text-white flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold transition-all hover:brightness-110 shadow-lg group relative overflow-hidden"
      >
        <div className="flex items-center gap-2 flex-wrap justify-center text-center relative z-10">
          <span className="inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-amber-300 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
            ⚡ SIÊU ƯU ĐÃI
          </span>
          <span className="text-white font-extrabold drop-shadow-sm">
            Trọn bộ 2.000+ khóa học — Truy cập Google Drive trọn đời, cập nhật miễn phí
          </span>
          <span className="bg-yellow-300 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow-md">
            599K
          </span>
        </div>
        <span className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full transition-transform group-hover:scale-105 shadow-md flex items-center gap-1 flex-shrink-0 relative z-10">
          Xem chi tiết →
        </span>
      </Link>

      {/* ===== 2. MAIN HEADER (KHÔNG STROKE, CHỮ SẮC NÉT) ===== */}
      <div className="bg-[#111523]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo: "Tạp Hóa Khóa Học" RÕ MÀU TRẮNG SẮC NÉT 100% */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
              TH
            </span>
            <span className="font-black text-white text-lg sm:text-xl tracking-tight">
              Tạp Hóa Khóa Học
            </span>
          </Link>

          {/* Search Bar (Kính mờ sang trọng, không stroke) */}
          <div className="flex-1 relative" ref={searchRef}>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học: Lập trình, Marketing, Figma, IELTS..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#141724] hover:bg-[#1A1E2F] focus:bg-[#1A1E2F] rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
              />
            </div>

            {/* Live Search Dropdown */}
            {searchOpen && debouncedSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#101320] rounded-2xl shadow-2xl z-50 p-2 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-sm text-slate-400">Đang tìm kiếm...</div>
                ) : courses.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    Không tìm thấy khóa học phù hợp với &quot;{debouncedSearch}&quot;
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">
                      Kết quả tìm kiếm ({courses.length})
                    </div>
                    {courses.slice(0, 5).map((course: any) => (
                      <Link
                        key={course.id}
                        href={`/khoa-hoc/${course.slug}`}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-800 rounded-xl transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            width={44}
                            height={44}
                            className="rounded-lg object-cover flex-shrink-0 w-11 h-11"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            📚
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {course.title}
                          </div>
                          <div className="text-xs text-amber-400 font-bold mt-0.5">
                            {formatPrice(course.effectivePrice)}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/mua?keyword=${encodeURIComponent(debouncedSearch)}`}
                      className="block text-center py-2 text-xs text-indigo-400 font-semibold hover:text-yellow-400 mt-1"
                      onClick={() => setSearchOpen(false)}
                    >
                      Xem tất cả kết quả →
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* Notification */}
            <button
              type="button"
              className="relative p-2.5 text-slate-300 hover:text-yellow-400 hover:bg-[#161A29] rounded-xl transition-colors"
              title="Thông báo"
            >
              <Bell size={19} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400"></span>
            </button>

            {/* Cart */}
            <Link
              href="/gio-hang"
              className="relative p-2.5 text-slate-300 hover:text-indigo-300 hover:bg-[#161A29] rounded-xl transition-colors"
              title="Giỏ hàng"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account / Login button */}
            {!isLoggedIn ? (
              <Link
                href="/dang-nhap-dang-ky"
                className="ml-1 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                title="Đăng nhập"
              >
                Đăng nhập
              </Link>
            ) : (
              <Link
                href="/tai-khoan"
                className="p-2.5 text-slate-300 hover:text-yellow-400 hover:bg-[#161A29] rounded-xl transition-colors"
                title="Tài khoản cá nhân"
              >
                <User size={19} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== 3. SUB NAVIGATION (CĂN GIỮA MÀN HÌNH, THÊM KHÓA HỌC CỦA TÔI) ===== */}
      <nav className="bg-[#111523]/60 backdrop-blur-md overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center justify-center">
          {/* Centered navigation items */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 h-11 text-xs sm:text-sm whitespace-nowrap py-1">
            {/* 1. Trang chủ */}
            <Link
              href="/"
              onClick={() => setActiveNav('/')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeNav === '/'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-300 hover:text-amber-400 active:text-amber-400 hover:bg-[#141828] font-medium'
              }`}
            >
              <Home size={15} />
              <span>Trang chủ</span>
            </Link>

            {/* 2. ⭐ Bán chạy */}
            <Link
              href="/ban-chay"
              onClick={() => setActiveNav('/ban-chay')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeNav === '/ban-chay'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-300 hover:text-amber-400 active:text-amber-400 hover:bg-[#141828] font-medium'
              }`}
            >
              <span>⭐ Bán chạy</span>
            </Link>

            {/* 3. 🔥 Mới cập nhật */}
            <Link
              href="/moi-cap-nhat"
              onClick={() => setActiveNav('/moi-cap-nhat')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeNav === '/moi-cap-nhat'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-300 hover:text-amber-400 active:text-amber-400 hover:bg-[#141828] font-medium'
              }`}
            >
              <span>🔥 Mới cập nhật</span>
            </Link>

            {/* 4. 💎 Combo tiết kiệm */}
            <Link
              href="/combo"
              onClick={() => setActiveNav('/combo')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeNav === '/combo'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-300 hover:text-amber-400 active:text-amber-400 hover:bg-[#141828] font-medium'
              }`}
            >
              <span>💎 Combo tiết kiệm</span>
            </Link>

            {/* 5. 📁 Khóa học của tôi */}
            <Link
              href="/khoa-hoc-cua-toi"
              onClick={() => setActiveNav('/khoa-hoc-cua-toi')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeNav === '/khoa-hoc-cua-toi'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-300 hover:text-amber-400 active:text-amber-400 hover:bg-[#141828] font-medium'
              }`}
            >
              <span>📁 Khóa học của tôi</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111523]/95 backdrop-blur-xl shadow-2xl">
          <div className="p-4 space-y-1">
            <Link
              href="/"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === '/' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-200 hover:bg-[#161B2B]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Trang chủ
            </Link>
            <Link
              href="/ban-chay"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === '/ban-chay' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-200 hover:bg-[#161B2B]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⭐ Bán chạy
            </Link>
            <Link
              href="/moi-cap-nhat"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === '/moi-cap-nhat' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-200 hover:bg-[#161B2B]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              🔥 Mới cập nhật
            </Link>
            <Link
              href="/combo"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === '/combo' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-200 hover:bg-[#161B2B]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              💎 Combo tiết kiệm
            </Link>
            <Link
              href="/khoa-hoc-cua-toi"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === '/khoa-hoc-cua-toi' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-200 hover:bg-[#161B2B]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              📁 Khóa học của tôi
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
