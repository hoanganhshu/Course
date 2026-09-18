'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import toast from 'react-hot-toast';

export interface Course {
  id: number;
  slug: string;
  title: string;
  thumbnail?: string;
  price: number;
  originalPrice: number;
  effectivePrice: number;
  registeredCount: number;
  flashSaleActive?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

const SAMPLE_COURSES: Course[] = [
  {
    id: 101,
    slug: 'tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien',
    title: 'Trọn bộ 2.000+ Khóa Học Google Drive VIP Trọn Đời',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    price: 599000,
    originalPrice: 2500000,
    effectivePrice: 599000,
    registeredCount: 1850,
    flashSaleActive: true,
  },
  {
    id: 102,
    slug: 'fullstack-nextjs-spring-boot-chuyen-nghiep',
    title: 'Fullstack Next.js 14, React 18 & Spring Boot 3 Chuyên Nghiệp',
    thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
    price: 199000,
    originalPrice: 650000,
    effectivePrice: 199000,
    registeredCount: 890,
  },
  {
    id: 103,
    slug: 'master-digital-marketing-facebook-ads-thuc-chien',
    title: 'Master Digital Marketing & Facebook Ads Thực Chiến 2026',
    thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
    price: 149000,
    originalPrice: 490000,
    effectivePrice: 149000,
    registeredCount: 740,
  },
  {
    id: 104,
    slug: 'thiet-ke-uiux-chuyen-nghiep-voi-figma',
    title: 'Thiết Kế UI/UX Chuyên Nghiệp với Figma từ Zero đến Master',
    thumbnail: '/backgrounds/tech_02_uiux_creative_studio.jpg',
    price: 169000,
    originalPrice: 550000,
    effectivePrice: 169000,
    registeredCount: 920,
  },
  {
    id: 105,
    slug: 'lap-trinh-python-data-science-thuc-chien',
    title: 'Lập Trình Python, Data Science & Phân Tích Dữ Liệu Thực Chiến',
    thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
    price: 179000,
    originalPrice: 580000,
    effectivePrice: 179000,
    registeredCount: 610,
  },
  {
    id: 106,
    slug: 'dung-phim-video-ngan-tiktok-capcut-pro',
    title: 'Dựng Phim Video Ngắn TikTok, Reels & CapCut Pro Triệu View',
    thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
    price: 129000,
    originalPrice: 450000,
    effectivePrice: 129000,
    registeredCount: 1120,
  },
  {
    id: 107,
    slug: 'kiem-tien-mmo-affiliate-va-ecommerce',
    title: 'Bí Quyết Kiếm Tiền MMO, Affiliate & Bán Hàng E-commerce',
    thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
    price: 159000,
    originalPrice: 500000,
    effectivePrice: 159000,
    registeredCount: 830,
  },
  {
    id: 108,
    slug: 'luyen-thi-ielts-cap-toc-tieng-anh-di-lam',
    title: 'Luyện Thi IELTS Cấp Tốc 7.5+ & Tiếng Anh Giao Tiếp Đi Làm',
    thumbnail: '/backgrounds/01_thu_vien_hien_dai.jpg',
    price: 189000,
    originalPrice: 600000,
    effectivePrice: 189000,
    registeredCount: 540,
  },
];

function CourseCard({ course }: { course: Course }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(course.id);
  const pct = Math.round((1 - course.effectivePrice / course.originalPrice) * 100);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;
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
    <div className="group flex flex-col bg-[#12141D] rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px] shadow-sm">
      <Link href={`/khoa-hoc/${course.slug}`} className="block relative overflow-hidden">
        {course.thumbnail ? (
          <div className="relative w-full h-44 overflow-hidden bg-[#181B26]">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {pct > 0 && (
              <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                -{pct}%
              </span>
            )}
            {course.flashSaleActive && (
              <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                ⚡ VIP SALE
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-44 bg-[#181B26] flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-white line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors min-h-[44px]">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 font-black text-base">{fmt(course.effectivePrice)}</span>
            {course.effectivePrice < course.originalPrice && (
              <span className="text-slate-500 line-through text-xs">{fmt(course.originalPrice)}</span>
            )}
          </div>

          {course.registeredCount > 0 && (
            <p className="text-[11px] text-slate-400">
              👥 {course.registeredCount.toLocaleString('vi-VN')} học viên đã sở hữu
            </p>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          onClick={handleAddCart}
          disabled={inCart}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            inCart
              ? 'bg-emerald-950/80 text-emerald-400 cursor-default'
              : 'bg-white hover:bg-slate-100 text-slate-950 shadow-sm'
          }`}
        >
          {inCart ? (
            <>
              <Check size={14} /> Đã thêm
            </>
          ) : (
            <>
              <ShoppingCart size={14} /> Mua ngay
            </>
          )}
        </button>
        <Link
          href={`/khoa-hoc/${course.slug}`}
          className="px-3.5 py-2.5 bg-[#181B26] hover:bg-[#202534] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Chi tiết
        </Link>
      </div>
    </div>
  );
}

interface Props {
  title: string;
  subtitle?: string;
  courses?: Course[];
  viewAllHref?: string;
  bgClass?: string;
}

export default function CourseGrid({
  title,
  subtitle,
  courses,
  viewAllHref,
  bgClass = 'bg-transparent',
}: Props) {
  const displayCourses = courses && courses.length > 0 ? courses : SAMPLE_COURSES;

  return (
    <section className={`py-12 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-white hover:text-slate-200 text-xs font-bold transition-colors whitespace-nowrap"
            >
              Xem tất cả <ArrowRight size={14} className="text-white" />
            </Link>
          )}
        </div>

        {/* 4-column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
