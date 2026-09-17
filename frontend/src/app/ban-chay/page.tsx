'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Star, Users, Flame, Search, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  registeredCount: number;
  rating: number;
  rank: number;
}

const BEST_SELLING_COURSES: Course[] = [
  {
    id: 101,
    slug: 'tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien',
    title: 'Trọn Bộ 2.000+ Khóa Học Google Drive Toàn Diện Trọn Đời',
    category: 'Combo',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    price: 599000,
    originalPrice: 2500000,
    registeredCount: 1850,
    rating: 5.0,
    rank: 1,
  },
  {
    id: 291,
    slug: 'dung-phim-video-ngan-tiktok-capcut-pro',
    title: 'Dựng Phim Video Ngắn TikTok, Reels & CapCut Pro Triệu View',
    category: 'Media',
    thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
    price: 129000,
    originalPrice: 450000,
    registeredCount: 1420,
    rating: 4.9,
    rank: 2,
  },
  {
    id: 261,
    slug: 'kiem-tien-mmo-affiliate-va-ecommerce',
    title: 'Bí Quyết Kiếm Tiền MMO, Affiliate & Bán Hàng E-commerce',
    category: 'MMO',
    thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
    price: 159000,
    originalPrice: 500000,
    registeredCount: 1320,
    rating: 4.9,
    rank: 3,
  },
  {
    id: 301,
    slug: 'thuat-toan-tiktok-2026-len-xu-huong',
    title: 'Giải Mã Thuật Toán TikTok 2026: Cách Lên Xu Hướng Nhanh Nhất',
    category: 'TikTok',
    thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
    price: 139000,
    originalPrice: 450000,
    registeredCount: 1250,
    rating: 4.8,
    rank: 4,
  },
  {
    id: 241,
    slug: 'master-excel-vba-macro-dashboard',
    title: 'Master Microsoft Excel: VBA, Macro & Tự Động Hóa Báo Cáo',
    category: 'Văn phòng',
    thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
    price: 129000,
    originalPrice: 420000,
    registeredCount: 1200,
    rating: 4.9,
    rank: 5,
  },
  {
    id: 221,
    slug: 'master-digital-marketing-facebook-ads',
    title: 'Master Digital Marketing & Facebook Ads Thực Chiến 2026',
    category: 'Marketing',
    thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
    price: 149000,
    originalPrice: 490000,
    registeredCount: 1140,
    rating: 4.9,
    rank: 6,
  },
  {
    id: 311,
    slug: 'xay-kenh-youtube-adsense-quoc-te',
    title: 'Xây Kênh YouTube Kiếm Tiền Ngoại Tệ AdSense Thị Trường Mỹ',
    category: 'YouTube',
    thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
    price: 169000,
    originalPrice: 550000,
    registeredCount: 1100,
    rating: 4.8,
    rank: 7,
  },
  {
    id: 232,
    slug: 'tieng-anh-giao-tiep-nguoi-mat-goc',
    title: 'Tiếng Anh Giao Tiếp Phản Xạ Đột Phá Trong 60 Ngày Cho Người Đi Làm',
    category: 'Ngoại ngữ',
    thumbnail: '/backgrounds/05_goc_tu_hoc_nang_som.jpg',
    price: 139000,
    originalPrice: 450000,
    registeredCount: 970,
    rating: 4.9,
    rank: 8,
  },
  {
    id: 211,
    slug: 'thiet-ke-uiux-chuyen-nghiep-voi-figma',
    title: 'Thiết Kế UI/UX Chuyên Nghiệp với Figma từ Zero đến Master',
    category: 'Thiết kế',
    thumbnail: '/backgrounds/tech_02_uiux_creative_studio.jpg',
    price: 169000,
    originalPrice: 550000,
    registeredCount: 920,
    rating: 4.9,
    rank: 9,
  },
  {
    id: 201,
    slug: 'fullstack-nextjs-spring-boot-chuyen-nghiep',
    title: 'Fullstack Next.js 14, React 18 & Spring Boot 3 Chuyên Nghiệp',
    category: 'Lập trình',
    thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
    price: 199000,
    originalPrice: 650000,
    registeredCount: 890,
    rating: 5.0,
    rank: 10,
  },
  {
    id: 231,
    slug: 'luyen-thi-ielts-cap-toc-tieng-anh-di-lam',
    title: 'Luyện Thi IELTS Cấp Tốc 7.5+ & Tiếng Anh Giao Tiếp Doanh Nghiệp',
    category: 'Ngoại ngữ',
    thumbnail: '/backgrounds/01_thu_vien_hien_dai.jpg',
    price: 189000,
    originalPrice: 600000,
    registeredCount: 840,
    rating: 4.8,
    rank: 11,
  },
  {
    id: 212,
    slug: 'photoshop-illustrator-chuyen-sau',
    title: 'Trọn Bộ Adobe Photoshop & Illustrator Thực Chiến Cho Designer',
    category: 'Thiết kế',
    thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
    price: 149000,
    originalPrice: 490000,
    registeredCount: 780,
    rating: 4.8,
    rank: 12,
  },
];

const CATEGORIES = ['Tất cả', 'Lập trình', 'Thiết kế', 'Marketing', 'Ngoại ngữ', 'MMO', 'Văn phòng', 'Media'];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function BestSellersPage() {
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const { addItem, isInCart } = useCartStore();

  const filteredCourses = BEST_SELLING_COURSES.filter((c) => {
    const matchCat = activeCat === 'Tất cả' || c.category === activeCat;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddCart = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    if (isInCart(course.id)) return;
    addItem({
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      price: course.price,
      originalPrice: course.originalPrice,
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold mb-3">
                <Flame size={14} className="text-amber-400" />
                <span>Bảng Xếp Hạng Thịnh Hành</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Khóa Học Bán Chạy Nhất
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                Những học liệu và khóa học được cộng đồng đăng ký nhiều nhất. Tự động nhận link Google Drive vĩnh viễn ngay sau thanh toán.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <div>
                <span className="text-white font-bold text-base block">12.500+</span>
                Học viên tin dùng
              </div>
              <div className="h-8 w-px bg-zinc-800"></div>
              <div>
                <span className="text-amber-400 font-bold text-base block">4.9 / 5.0</span>
                Đánh giá hài lòng
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCat === cat
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-[#141828] text-slate-300 hover:text-white hover:bg-[#1A2034]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm trong top bán chạy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#141828] hover:bg-[#1A2034] focus:bg-[#1A2034] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCourses.map((course) => {
            const inCart = isInCart(course.id);
            const pct = Math.round((1 - course.price / course.originalPrice) * 100);

            return (
              <div
                key={course.id}
                className="group flex flex-col bg-[#141828] hover:bg-[#181D30] rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px] shadow-sm"
              >
                <Link href={`/khoa-hoc/${course.slug}`} className="block relative overflow-hidden">
                  <div className="relative w-full h-44 overflow-hidden bg-[#1D2236]">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Rank Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur text-amber-400 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      #{course.rank}
                    </span>
                    {pct > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                        -{pct}%
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span className="font-semibold text-slate-400">{course.category}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star size={12} className="fill-amber-400" /> {course.rating}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors min-h-[40px]">
                        {course.title}
                      </h3>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400 font-black text-base">
                          {fmt(course.price)}
                        </span>
                        {course.price < course.originalPrice && (
                          <span className="text-slate-500 line-through text-xs">
                            {fmt(course.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Users size={12} className="text-slate-400" />
                        <span>{course.registeredCount.toLocaleString('vi-VN')} học viên đã mua</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="px-4 pb-4 pt-1 flex gap-2">
                  <button
                    onClick={(e) => handleAddCart(e, course)}
                    disabled={inCart}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      inCart
                        ? 'bg-emerald-950/80 text-emerald-400 cursor-default'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check size={14} /> Đã thêm
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} /> Thêm giỏ
                      </>
                    )}
                  </button>
                  <Link
                    href={`/khoa-hoc/${course.slug}`}
                    className="px-3.5 py-2.5 bg-[#1D2236] hover:bg-[#252B44] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Support Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-[#141828] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-white font-bold text-base">Cần tư vấn chọn khóa học phù hợp?</h4>
            <p className="text-slate-400 text-xs mt-1">Đội ngũ hỗ trợ sẵn sàng giải đáp và hướng dẫn nhận học liệu trong 1 phút.</p>
          </div>
          <Link
            href="/mua"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all whitespace-nowrap shadow-sm"
          >
            Khám phá thêm khóa học →
          </Link>
        </div>
      </div>
    </div>
  );
}
