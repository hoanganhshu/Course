'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, ShoppingCart, Gem, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ComboPack {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  badge?: string;
  popular?: boolean;
  coursesCount: number;
  includedList: string[];
}

const COMBO_PACKS: ComboPack[] = [
  {
    id: 101,
    slug: 'tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien',
    title: 'Gói Siêu VIP: Trọn Bộ Hơn 2.000 Khóa Học Toàn Website',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    price: 599000,
    originalPrice: 2500000,
    badge: '🏆 BÁN CHẠY NHẤT',
    popular: true,
    coursesCount: 2000,
    includedList: [
      'Toàn bộ khoá Lập trình Fullstack, Mobile, DevOps, AI',
      'Trọn bộ Thiết kế Đồ họa, UI/UX Figma, 3D Blender',
      'Toàn bộ Digital Marketing, Facebook Ads, Google Ads',
      'Khoá học Ngoại ngữ (IELTS 7.5+, HSK 5, JLPT N2)',
      'Tự động nhận khoá học mới bổ sung hàng tháng miễn phí',
      'Bàn giao link Google Drive sở hữu trọn đời',
    ],
  },
  {
    id: 901,
    slug: 'combo-fullstack-web-developer-master',
    title: 'Combo Fullstack Web & Cloud Microservices Master',
    thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
    price: 399000,
    originalPrice: 1800000,
    badge: 'TIẾT KIỆM 78%',
    coursesCount: 5,
    includedList: [
      'Fullstack Next.js 14, React 18 & Spring Boot 3 Chuyên Nghiệp',
      'Lập Trình Golang & Triển Khai Microservices với Kubernetes',
      'Lập Trình Python, Data Science & Phân Tích Dữ Liệu Thực Chiến',
      'An Ninh Mạng, Ethical Hacking & Thực Hành Pentest Toàn Diện',
      'Trực Quan Hóa Dữ Liệu Chuyên Nghiệp Với Power BI & SQL',
    ],
  },
  {
    id: 902,
    slug: 'combo-graphic-designer-3d-motion',
    title: 'Combo Graphic Designer & 3D Motion Creator Pro',
    thumbnail: '/backgrounds/tech_02_uiux_creative_studio.jpg',
    price: 349000,
    originalPrice: 1650000,
    badge: 'DÀNH CHO CREATOR',
    coursesCount: 4,
    includedList: [
      'Thiết Kế UI/UX Chuyên Nghiệp với Figma từ Zero đến Master',
      'Trọn Bộ Adobe Photoshop & Illustrator Thực Chiến',
      'Thiết Kế 3D Blender & Motion Graphics Chuyên Nghiệp',
      'Thiết Kế Ấn Phẩm Marketing & Banner Quảng Cáo Đỉnh Cao',
    ],
  },
  {
    id: 903,
    slug: 'combo-digital-marketing-tiktok-shop-ecommerce',
    title: 'Combo Digital Marketing, TikTok Shop & E-Commerce Thực Chiến',
    thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
    price: 299000,
    originalPrice: 1450000,
    badge: 'KINH DOANH ĐỈNH CAO',
    coursesCount: 5,
    includedList: [
      'Master Digital Marketing & Facebook Ads Thực Chiến 2026',
      'Google Ads Search & Performance Max Chuyển Đổi Cao',
      'LiveStream Bán Hàng TikTok Shop Đột Phá Doanh Thu',
      'Bí Quyết Kiếm Tiền MMO, Affiliate & E-commerce',
      'Xây Dựng Hệ Thống Content Viral & Kịch Bản Bán Hàng',
    ],
  },
  {
    id: 904,
    slug: 'combo-ngoai-ngu-ielts-tieng-trung-tieng-nhat',
    title: 'Combo Ngoại Ngữ Toàn Diện: Tiếng Anh, Tiếng Trung & Tiếng Nhật',
    thumbnail: '/backgrounds/01_thu_vien_hien_dai.jpg',
    price: 329000,
    originalPrice: 1550000,
    badge: 'ĐỘT PHÁ NGOẠI NGỮ',
    coursesCount: 4,
    includedList: [
      'Luyện Thi IELTS Cấp Tốc 7.5+ & Tiếng Anh Doanh Nghiệp',
      'Tiếng Anh Giao Tiếp Phản Xạ Đột Phá Trong 60 Ngày',
      'Tiếng Trung Thương Mại HSK 5 & Đàm Phán Mua Hàng 1688',
      'Tiếng Nhật Cấp Tốc JLPT N3 - N2 Ứng Dụng Thực Tế',
    ],
  },
  {
    id: 905,
    slug: 'combo-dung-phim-video-ngan-youtube-viral',
    title: 'Combo Dựng Phim, Video Ngắn & YouTube Automation Triệu View',
    thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
    price: 289000,
    originalPrice: 1350000,
    badge: 'VIDEO EDITING',
    coursesCount: 4,
    includedList: [
      'Dựng Phim Video Ngắn TikTok, Reels & CapCut Pro Triệu View',
      'Master Premiere Pro & After Effects Kỹ Xảo Điện Ảnh',
      'Color Grading & Chỉnh Màu Da Video Chuẩn DaVinci Resolve',
      'YouTube Automation: Kênh Bán Content Không Lộ Mặt với AI',
    ],
  },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export default function ComboPage() {
  const { addItem, isInCart } = useCartStore();

  const handleAddCart = (pack: ComboPack) => {
    if (isInCart(pack.id)) return;
    addItem({
      id: pack.id,
      title: pack.title,
      slug: pack.slug,
      thumbnail: pack.thumbnail,
      price: pack.price,
      originalPrice: pack.originalPrice,
    });
    toast.success('Đã thêm combo vào giỏ hàng!');
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold mb-3">
            <Gem size={14} className="text-amber-400" />
            <span>Ưu Đãi Trọn Gói Tiết Kiệm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Combo Khóa Học Tiết Kiệm
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Sở hữu trọn bộ lộ trình kiến thức chuyên sâu từ cơ bản đến thực chiến với mức giá tiết kiệm lên tới 80%. Tự động nhận link Google Drive trong 30 giây.
          </p>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" /> Quyền học trọn đời
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" /> Bàn giao qua Google Drive
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" /> Cập nhật miễn phí
            </span>
          </div>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMBO_PACKS.map((pack) => {
            const inCart = isInCart(pack.id);
            const saved = pack.originalPrice - pack.price;
            const pct = Math.round((saved / pack.originalPrice) * 100);

            return (
              <div
                key={pack.id}
                className="flex flex-col bg-[#141828] hover:bg-[#181D30] rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-44 overflow-hidden bg-[#1D2236]">
                  <Image
                    src={pack.thumbnail}
                    alt={pack.title}
                    fill
                    className="object-cover"
                  />
                  {pack.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur text-amber-400 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                      {pack.badge}
                    </span>
                  )}
                  <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-sm">
                    Tiết kiệm {pct}%
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {pack.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-amber-400">
                        {fmt(pack.price)}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        {fmt(pack.originalPrice)}
                      </span>
                    </div>

                    {/* Included list */}
                    <div className="pt-3.5 mb-5">
                      <div className="text-xs font-semibold text-slate-300 mb-2">
                        Bao gồm trong gói ({pack.coursesCount} khóa):
                      </div>
                      <ul className="space-y-1.5">
                        {pack.includedList.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                            <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => handleAddCart(pack)}
                      disabled={inCart}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        inCart
                          ? 'bg-emerald-950/80 text-emerald-400 cursor-default'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check size={14} /> Đã thêm vào giỏ
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} /> Thêm vào giỏ ({fmt(pack.price)})
                        </>
                      )}
                    </button>
                    <Link
                      href={`/khoa-hoc/${pack.slug}`}
                      className="w-full text-center py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                    >
                      Xem chi tiết gói combo →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
