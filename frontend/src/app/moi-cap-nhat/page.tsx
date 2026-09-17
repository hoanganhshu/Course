'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Sparkles, Clock, Search, ArrowRight } from 'lucide-react';
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
  addedTime: string;
}

const LATEST_COURSES: Course[] = [
  {
    id: 303,
    slug: 'san-xuat-video-ngan-ai-tu-dong',
    title: 'Sản Xuất 100 Video Ngắn Mỗi Tháng Nhờ Ứng Dụng AI Tự Động',
    category: 'AI & TikTok',
    thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
    price: 149000,
    originalPrice: 490000,
    registeredCount: 940,
    addedTime: 'Hôm nay',
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
    addedTime: 'Hôm qua',
  },
  {
    id: 528,
    slug: 'youtube-automation-kiem-tien-ai',
    title: 'YouTube Automation: Kiếm Tiền Kênh Bán Content Không Lộ Mặt với AI',
    category: 'YouTube',
    thumbnail: '/backgrounds/hex_03_cyber_matrix_grid.jpg',
    price: 179000,
    originalPrice: 580000,
    registeredCount: 830,
    addedTime: '2 ngày trước',
  },
  {
    id: 464,
    slug: 'color-grading-davinci-resolve',
    title: 'Color Grading & Chỉnh Màu Video Chuẩn Điện Ảnh DaVinci Resolve',
    category: 'Media',
    thumbnail: '/backgrounds/simple_10_abstract_flowing_mesh.jpg',
    price: 159000,
    originalPrice: 520000,
    registeredCount: 620,
    addedTime: '3 ngày trước',
  },
  {
    id: 203,
    slug: 'lap-trinh-golang-devops-kubernetes',
    title: 'Lập Trình Golang & Triển Khai Microservices với Kubernetes',
    category: 'Lập trình',
    thumbnail: '/backgrounds/hex_01_deep_circuit_board.jpg',
    price: 219000,
    originalPrice: 700000,
    registeredCount: 420,
    addedTime: '4 ngày trước',
  },
  {
    id: 213,
    slug: 'thiet-ke-3d-blender-motion',
    title: 'Thiết Kế 3D Blender & Motion Graphics Quảng Cáo Chuyên Nghiệp',
    category: 'Thiết kế',
    thumbnail: '/backgrounds/hex_02_dark_3d_cubes.jpg',
    price: 189000,
    originalPrice: 620000,
    registeredCount: 460,
    addedTime: '5 ngày trước',
  },
  {
    id: 144,
    slug: 'google-ads-performance-max',
    title: 'Google Ads Search & Performance Max Chuyển Đổi Doanh Số Cao 2026',
    category: 'Marketing',
    thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
    price: 159000,
    originalPrice: 520000,
    registeredCount: 680,
    addedTime: '6 ngày trước',
  },
  {
    id: 242,
    slug: 'power-bi-business-intelligence',
    title: 'Trực Quan Hóa Dữ Liệu Chuyên Nghiệp Với Power BI & SQL Phân Tích',
    category: 'Dữ liệu',
    thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
    price: 169000,
    originalPrice: 550000,
    registeredCount: 750,
    addedTime: '1 tuần trước',
  },
  {
    id: 233,
    slug: 'tieng-trung-thuong-mai-hsk5',
    title: 'Tiếng Trung Thương Mại HSK 5 & Đàm Phán Mua Hàng 1688 Taobao',
    category: 'Ngoại ngữ',
    thumbnail: '/backgrounds/03_khuon_vien_truong.jpg',
    price: 169000,
    originalPrice: 550000,
    registeredCount: 620,
    addedTime: '1 tuần trước',
  },
  {
    id: 264,
    slug: 'drop-shipping-quoc-te-shopify',
    title: 'Mô Hình Dropshipping Quốc Tế với Shopify & Quảng Cáo TikTok',
    category: 'MMO',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    price: 189000,
    originalPrice: 620000,
    registeredCount: 710,
    addedTime: '1 tuần trước',
  },
  {
    id: 281,
    slug: 'phan-tich-ky-thuat-chung-khoan',
    title: 'Phân Tích Kỹ Thuật Chứng Khoán & Quản Trị Rủi Ro Chuyên Sâu',
    category: 'Đầu tư',
    thumbnail: '/backgrounds/hex_06_cyber_blue_lines.jpg',
    price: 199000,
    originalPrice: 650000,
    registeredCount: 730,
    addedTime: '2 tuần trước',
  },
  {
    id: 204,
    slug: 'an-ninh-mang-ethical-hacking-ceh',
    title: 'An Ninh Mạng, Ethical Hacking & Thực Hành Pentest Toàn Diện',
    category: 'Lập trình',
    thumbnail: '/backgrounds/hex_03_cyber_matrix_grid.jpg',
    price: 249000,
    originalPrice: 850000,
    registeredCount: 530,
    addedTime: '2 tuần trước',
  },
];

const CATEGORIES = ['Tất cả', 'Lập trình', 'Thiết kế', 'Marketing', 'AI & TikTok', 'Dữ liệu', 'MMO', 'Ngoại ngữ'];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function LatestCoursesPage() {
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const { addItem, isInCart } = useCartStore();

  const filteredCourses = LATEST_COURSES.filter((c) => {
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold mb-3">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Nội Dung Mới Bổ Sung</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Khóa Học Mới Cập Nhật
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                Cập nhật các khóa học và bộ tài nguyên mới nhất trên Google Drive. Luôn theo sát công nghệ và các xu hướng nghề nghiệp dẫn đầu.
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#141828] text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Đã cập nhật: <strong>Tháng 09/2026</strong></span>
            </div>
          </div>

          {/* Search & Category Filter */}
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
                placeholder="Tìm khóa mới cập nhật..."
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
                    {/* Time Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur text-emerald-400 font-bold text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Clock size={11} /> {course.addedTime}
                    </span>
                    {pct > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                        -{pct}%
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        {course.category}
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
                        <span className="text-slate-500 line-through text-xs">
                          {fmt(course.originalPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        👥 {course.registeredCount.toLocaleString('vi-VN')} học viên đã sở hữu
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
      </div>
    </div>
  );
}
