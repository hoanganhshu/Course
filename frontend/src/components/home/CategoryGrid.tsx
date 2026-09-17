'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { categoryApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  effectivePrice: number;
  registeredCount: number;
  badge?: string;
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

const CATEGORY_ICONS: Record<string, string> = {
  'cong-nghe-thong-tin':     '💻',
  'thiet-ke-do-hoa':         '🎨',
  'marketing':               '📢',
  'ngoai-ngu':               '🌍',
  'tin-hoc-van-phong':       '📊',
  'ky-nang':                 '🌟',
  'kiem-tien-va-mmo':        '💰',
  'kinh-doanh-va-khoi-nghiep': '🏢',
  'dau-tu':                  '📈',
  'dung-phim-va-nhiep-anh':  '🎬',
  'khoa-hoc-tiktok':         '🎵',
  'khoa-hoc-youtube':        '▶️',
};

// Dữ liệu khóa học chi tiết theo từng lĩnh vực (Mỗi lĩnh vực 4 khóa chuẩn 4 cột)
const CATEGORY_COURSES: Record<string, Course[]> = {
  'cong-nghe-thong-tin': [
    {
      id: 201,
      slug: 'fullstack-nextjs-spring-boot-chuyen-nghiep',
      title: 'Fullstack Next.js 14, React 18 & Spring Boot 3 Chuyên Nghiệp',
      thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
      price: 199000,
      originalPrice: 650000,
      effectivePrice: 199000,
      registeredCount: 890,
      badge: 'HOT',
    },
    {
      id: 202,
      slug: 'lap-trinh-python-data-science-thuc-chien',
      title: 'Lập Trình Python, Data Science & Phân Tích Dữ Liệu Thực Chiến',
      thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
      price: 179000,
      originalPrice: 580000,
      effectivePrice: 179000,
      registeredCount: 610,
    },
    {
      id: 203,
      slug: 'lap-trinh-golang-devops-kubernetes',
      title: 'Lập Trình Golang & Triển Khai Microservices với Kubernetes',
      thumbnail: '/backgrounds/hex_01_deep_circuit_board.jpg',
      price: 219000,
      originalPrice: 700000,
      effectivePrice: 219000,
      registeredCount: 420,
    },
    {
      id: 204,
      slug: 'an-ninh-mang-ethical-hacking-ceh',
      title: 'An Ninh Mạng, Ethical Hacking & Thực Hành Pentest Toàn Diện',
      thumbnail: '/backgrounds/hex_03_cyber_matrix_grid.jpg',
      price: 249000,
      originalPrice: 850000,
      effectivePrice: 249000,
      registeredCount: 530,
      badge: 'VIP',
    },
  ],
  'thiet-ke-do-hoa': [
    {
      id: 211,
      slug: 'thiet-ke-uiux-chuyen-nghiep-voi-figma',
      title: 'Thiết Kế UI/UX Chuyên Nghiệp với Figma từ Zero đến Master',
      thumbnail: '/backgrounds/tech_02_uiux_creative_studio.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 920,
      badge: 'BÁN CHẠY',
    },
    {
      id: 212,
      slug: 'photoshop-illustrator-chuyen-sau',
      title: 'Trọn Bộ Adobe Photoshop & Illustrator Thực Chiến Cho Designer',
      thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
      price: 149000,
      originalPrice: 490000,
      effectivePrice: 149000,
      registeredCount: 780,
    },
    {
      id: 213,
      slug: 'thiet-ke-3d-blender-motion',
      title: 'Thiết Kế 3D Blender & Motion Graphics Chuyên Nghiệp',
      thumbnail: '/backgrounds/hex_02_dark_3d_cubes.jpg',
      price: 189000,
      originalPrice: 620000,
      effectivePrice: 189000,
      registeredCount: 460,
    },
    {
      id: 214,
      slug: 'thiet-ke-banner-social-media',
      title: 'Thiết Kế Ấn Phẩm Marketing & Banner Quảng Cáo Đỉnh Cao',
      thumbnail: '/backgrounds/simple_02_mesh_gradient_vibrant.jpg',
      price: 129000,
      originalPrice: 400000,
      effectivePrice: 129000,
      registeredCount: 650,
    },
  ],
  'marketing': [
    {
      id: 221,
      slug: 'master-digital-marketing-facebook-ads',
      title: 'Master Digital Marketing & Facebook Ads Thực Chiến 2026',
      thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
      price: 149000,
      originalPrice: 490000,
      effectivePrice: 149000,
      registeredCount: 1140,
      badge: 'BÁN CHẠY',
    },
    {
      id: 222,
      slug: 'google-ads-performance-max',
      title: 'Google Ads Search & Performance Max Chuyển Đổi Doanh Số Cao',
      thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
      price: 159000,
      originalPrice: 520000,
      effectivePrice: 159000,
      registeredCount: 680,
    },
    {
      id: 223,
      slug: 'content-marketing-viral-script',
      title: 'Xây Dựng Hệ Thống Content Viral & Kịch Bản Video Bán Hàng',
      thumbnail: '/backgrounds/simple_05_soft_aurora_gradient.jpg',
      price: 139000,
      originalPrice: 450000,
      effectivePrice: 139000,
      registeredCount: 730,
    },
    {
      id: 224,
      slug: 'seo-onpage-offpage-top1-google',
      title: 'Chiến Lược SEO Onpage & Offpage Top 1 Google Bền Vững',
      thumbnail: '/backgrounds/simple_04_deep_cyan_horizon.jpg',
      price: 169000,
      originalPrice: 560000,
      effectivePrice: 169000,
      registeredCount: 510,
    },
  ],
  'ngoai-ngu': [
    {
      id: 231,
      slug: 'luyen-thi-ielts-cap-toc-tieng-anh-di-lam',
      title: 'Luyện Thi IELTS Cấp Tốc 7.5+ & Tiếng Anh Giao Tiếp Đi Làm',
      thumbnail: '/backgrounds/01_thu_vien_hien_dai.jpg',
      price: 189000,
      originalPrice: 600000,
      effectivePrice: 189000,
      registeredCount: 840,
      badge: 'TOP 1',
    },
    {
      id: 232,
      slug: 'tieng-anh-giao-tiep-nguoi-mat-goc',
      title: 'Tiếng Anh Giao Tiếp Phản Xạ Đột Phá Trong 60 Ngày',
      thumbnail: '/backgrounds/05_goc_tu_hoc_nang_som.jpg',
      price: 139000,
      originalPrice: 450000,
      effectivePrice: 139000,
      registeredCount: 970,
    },
    {
      id: 233,
      slug: 'tieng-trung-thuong-mai-hsk5',
      title: 'Tiếng Trung Thương Mại HSK 5 & Đàm Phán Mua Hàng 1688 Taobao',
      thumbnail: '/backgrounds/03_khuon_vien_truong.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 620,
    },
    {
      id: 234,
      slug: 'tieng-nhat-cap-toc-jlpt-n3-n2',
      title: 'Tiếng Nhật Cấp Tốc JLPT N3 - N2 Ứng Dụng Trong Doanh Nghiệp',
      thumbnail: '/backgrounds/08_gia_sach_co_kinh.jpg',
      price: 179000,
      originalPrice: 580000,
      effectivePrice: 179000,
      registeredCount: 430,
    },
  ],
  'tin-hoc-van-phong': [
    {
      id: 241,
      slug: 'master-excel-vba-macro-dashboard',
      title: 'Master Microsoft Excel: VBA, Macro & Tự Động Hóa Báo Cáo',
      thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
      price: 129000,
      originalPrice: 420000,
      effectivePrice: 129000,
      registeredCount: 1200,
      badge: 'BÁN CHẠY',
    },
    {
      id: 242,
      slug: 'power-bi-business-intelligence',
      title: 'Trực Quan Hóa Dữ Liệu Chuyên Nghiệp Với Power BI & SQL',
      thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 750,
    },
    {
      id: 243,
      slug: 'soan-thao-hop-dong-word-chuyen-nghiep',
      title: 'Soạn Thảo Hợp Đồng & Văn Bản Hành Chính Chuyên Nghiệp',
      thumbnail: '/backgrounds/02_ban_hoc_toi_gian.jpg',
      price: 119000,
      originalPrice: 380000,
      effectivePrice: 119000,
      registeredCount: 520,
    },
    {
      id: 244,
      slug: 'thiet-ke-slide-powerpoint-thuyet-trinh',
      title: 'Thiết Kế Slide Thuyết Trình PowerPoint Đẳng Cấp Thương Gia',
      thumbnail: '/backgrounds/simple_01_cloud_sky_blue.jpg',
      price: 129000,
      originalPrice: 400000,
      effectivePrice: 129000,
      registeredCount: 680,
    },
  ],
  'ky-nang': [
    {
      id: 251,
      slug: 'ky-nang-dam-phan-thuyet-phuc',
      title: 'Kỹ Năng Đàm Phán & Thuyết Phục Đỉnh Cao Trong Kinh Doanh',
      thumbnail: '/backgrounds/06_giang_duong_duong_dai.jpg',
      price: 139000,
      originalPrice: 450000,
      effectivePrice: 139000,
      registeredCount: 820,
    },
    {
      id: 252,
      slug: 'quan-ly-thoi-gian-tang-nang-suat',
      title: 'Quản Lý Thời Gian & Nâng Cao Năng Suất Cá Nhân Lên 300%',
      thumbnail: '/backgrounds/10_ban_lam_viec_so.jpg',
      price: 119000,
      originalPrice: 390000,
      effectivePrice: 119000,
      registeredCount: 710,
    },
    {
      id: 253,
      slug: 'tu-duy-phan-bien-giai-quyet-van-de',
      title: 'Tư Duy Phản Biện & Kỹ Năng Giải Quyết Vấn Đề Phức Tạp',
      thumbnail: '/backgrounds/04_trang_sach_nghe_thuat.jpg',
      price: 129000,
      originalPrice: 420000,
      effectivePrice: 129000,
      registeredCount: 560,
    },
    {
      id: 254,
      slug: 'lanh-dao-doi-ngu-quan-tri-okr',
      title: 'Lãnh Đạo Đội Ngũ & Quản Trị Mục Tiêu OKR Thực Chiến',
      thumbnail: '/backgrounds/07_co_learning_mo.jpg',
      price: 159000,
      originalPrice: 500000,
      effectivePrice: 159000,
      registeredCount: 490,
    },
  ],
  'kiem-tien-va-mmo': [
    {
      id: 261,
      slug: 'kiem-tien-mmo-affiliate-va-ecommerce',
      title: 'Bí Quyết Kiếm Tiền MMO, Affiliate & Bán Hàng E-commerce',
      thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
      price: 159000,
      originalPrice: 500000,
      effectivePrice: 159000,
      registeredCount: 1320,
      badge: 'CỰC HOT',
    },
    {
      id: 262,
      slug: 'kinh-doanh-shopee-lazada-doanh-so-khung',
      title: 'Kinh Doanh Shopee & Lazada Tối Ưu Doanh Số Hàng Trăm Triệu/Tháng',
      thumbnail: '/backgrounds/simple_03_dark_slate_wave.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 880,
    },
    {
      id: 263,
      slug: 'ban-ao-thun-print-on-demand',
      title: 'Kiếm Tiền Print on Demand (POD) & Bán Hàng Thị Trường US / EU',
      thumbnail: '/backgrounds/hex_04_dark_liquid_slate.jpg',
      price: 179000,
      originalPrice: 580000,
      effectivePrice: 179000,
      registeredCount: 640,
    },
    {
      id: 264,
      slug: 'drop-shipping-quoc-te-shopify',
      title: 'Mô Hình Dropshipping Quốc Tế với Shopify & Quảng Cáo TikTok',
      thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
      price: 189000,
      originalPrice: 620000,
      effectivePrice: 189000,
      registeredCount: 710,
    },
  ],
  'kinh-doanh-va-khoi-nghiep': [
    {
      id: 271,
      slug: 'khoi-nghiep-tinh-gon-lean-startup',
      title: 'Chiến Lược Khởi Nghiệp Tinh Gọn (Lean Startup) Cho Founder',
      thumbnail: '/backgrounds/09_nghien_cuu_thu_vien.jpg',
      price: 179000,
      originalPrice: 590000,
      effectivePrice: 179000,
      registeredCount: 520,
    },
    {
      id: 272,
      slug: 'xay-dung-mo-hinh-kinh-doanh',
      title: 'Xây Dựng Mô Hình Kinh Doanh Bền Vững & Quản Trị Dòng Tiền',
      thumbnail: '/backgrounds/tech_09_business_data_strategy.jpg',
      price: 189000,
      originalPrice: 620000,
      effectivePrice: 189000,
      registeredCount: 460,
    },
    {
      id: 273,
      slug: 'nghe-thuat-ban-hang-b2b',
      title: 'Nghệ Thuật Bán Hàng B2B & Chốt Hợp Đồng Giá Trị Cao',
      thumbnail: '/backgrounds/06_giang_duong_duong_dai.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 590,
    },
    {
      id: 274,
      slug: 'tuyen-dung-quan-tri-nhan-tai',
      title: 'Tuyển Dụng & Giữ Chân Nhân Tài Trong Doanh Nghiệp SME',
      thumbnail: '/backgrounds/07_co_learning_mo.jpg',
      price: 149000,
      originalPrice: 480000,
      effectivePrice: 149000,
      registeredCount: 380,
    },
  ],
  'dau-tu': [
    {
      id: 281,
      slug: 'phan-tich-ky-thuat-chung-khoan',
      title: 'Phân Tích Kỹ Thuật Chứng Khoán & Quản Trị Rủi Ro Chuyên Sâu',
      thumbnail: '/backgrounds/hex_06_cyber_blue_lines.jpg',
      price: 199000,
      originalPrice: 650000,
      effectivePrice: 199000,
      registeredCount: 730,
      badge: 'VIP',
    },
    {
      id: 282,
      slug: 'dau-tu-gia-tri-warren-buffett',
      title: 'Phương Pháp Đầu Tư Cổ Phiếu Giá Trị Bền Vững Dài Hạn',
      thumbnail: '/backgrounds/tech_08_geometric_dark_shapes.jpg',
      price: 189000,
      originalPrice: 600000,
      effectivePrice: 189000,
      registeredCount: 510,
    },
    {
      id: 283,
      slug: 'quan-ly-tai-chinh-ca-nhan-da-kenh',
      title: 'Quản Lý Tài Chính Cá Nhân & Xây Dựng Danh Mục Đầu Tư Đa Kênh',
      thumbnail: '/backgrounds/simple_06_minimal_dark_gradient.jpg',
      price: 149000,
      originalPrice: 490000,
      effectivePrice: 149000,
      registeredCount: 620,
    },
    {
      id: 284,
      slug: 'bat-dong-san-dong-tien',
      title: 'Đầu Tư Bất Động Sản Dòng Tiền & Pháp Lý Cho Người Mới',
      thumbnail: '/backgrounds/simple_08_blue_mist_atmosphere.jpg',
      price: 189000,
      originalPrice: 620000,
      effectivePrice: 189000,
      registeredCount: 470,
    },
  ],
  'dung-phim-va-nhiep-anh': [
    {
      id: 291,
      slug: 'dung-phim-video-ngan-tiktok-capcut-pro',
      title: 'Dựng Phim Video Ngắn TikTok, Reels & CapCut Pro Triệu View',
      thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
      price: 129000,
      originalPrice: 450000,
      effectivePrice: 129000,
      registeredCount: 1420,
      badge: 'CỰC HOT',
    },
    {
      id: 292,
      slug: 'premiere-pro-after-effects-ky-xao',
      title: 'Master Premiere Pro & After Effects Làm Kỹ Xảo Điện Ảnh',
      thumbnail: '/backgrounds/hex_05_abstract_3d_mesh.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 810,
    },
    {
      id: 293,
      slug: 'nhiep-anh-san-pham-thuong-mai',
      title: 'Nhiếp Ảnh Thương Mại & Kỹ Thuật Ánh Sáng Chụp Ảnh Sản Phẩm',
      thumbnail: '/backgrounds/simple_09_clean_studio_shadow.jpg',
      price: 149000,
      originalPrice: 480000,
      effectivePrice: 149000,
      registeredCount: 530,
    },
    {
      id: 294,
      slug: 'color-grading-davinci-resolve',
      title: 'Color Grading & Chỉnh Màu Da Video Chuẩn Hollywood DaVinci Resolve',
      thumbnail: '/backgrounds/simple_10_abstract_flowing_mesh.jpg',
      price: 159000,
      originalPrice: 520000,
      effectivePrice: 159000,
      registeredCount: 620,
    },
  ],
  'khoa-hoc-tiktok': [
    {
      id: 301,
      slug: 'thuat-toan-tiktok-2026-len-xu-huong',
      title: 'Giải Mã Thuật Toán TikTok 2026: Cách Lên Xu Hướng Nhanh Nhất',
      thumbnail: '/backgrounds/tech_07_video_creator_studio.jpg',
      price: 139000,
      originalPrice: 450000,
      effectivePrice: 139000,
      registeredCount: 1250,
      badge: 'TREND',
    },
    {
      id: 302,
      slug: 'livestream-ban-hang-tiktok-shop',
      title: 'LiveStream Bán Hàng TikTok Shop Thực Chiến Đột Phá Doanh Thu',
      thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
      price: 159000,
      originalPrice: 520000,
      effectivePrice: 159000,
      registeredCount: 890,
    },
    {
      id: 303,
      slug: 'san-xuat-video-ngan-ai-tu-dong',
      title: 'Sản Xuất 100 Video Ngắn Mỗi Tháng Nhờ Ứng Dụng AI Tự Động',
      thumbnail: '/backgrounds/tech_01_workspace_code_design.jpg',
      price: 149000,
      originalPrice: 490000,
      effectivePrice: 149000,
      registeredCount: 940,
    },
    {
      id: 304,
      slug: 'xay-dung-thuong-hieu-ca-nhan-tiktok',
      title: 'Xây Dựng Thương Hiệu Cá Nhân Hút Triệu Follow Trên TikTok',
      thumbnail: '/backgrounds/01_thu_vien_hien_dai.jpg',
      price: 139000,
      originalPrice: 460000,
      effectivePrice: 139000,
      registeredCount: 760,
    },
  ],
  'khoa-hoc-youtube': [
    {
      id: 311,
      slug: 'xay-kenh-youtube-adsense-quoc-te',
      title: 'Xây Kênh YouTube Kiếm Tiền Ngoại Tệ AdSense Từ Thị Trường Mỹ',
      thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
      price: 169000,
      originalPrice: 550000,
      effectivePrice: 169000,
      registeredCount: 1100,
      badge: 'HOT',
    },
    {
      id: 312,
      slug: 'youtube-automation-kiem-tien-ai',
      title: 'YouTube Automation: Kiếm Tiền Kênh Bán Content Không Lộ Mặt',
      thumbnail: '/backgrounds/hex_03_cyber_matrix_grid.jpg',
      price: 179000,
      originalPrice: 580000,
      effectivePrice: 179000,
      registeredCount: 830,
    },
    {
      id: 313,
      slug: 'seo-video-youtube-len-top',
      title: 'SEO Video YouTube Lên Top Tìm Kiếm & Đề Xuất Toàn Cầu',
      thumbnail: '/backgrounds/simple_04_deep_cyan_horizon.jpg',
      price: 139000,
      originalPrice: 450000,
      effectivePrice: 139000,
      registeredCount: 670,
    },
    {
      id: 314,
      slug: 'kich-ban-thumbnail-youtube-ctr-cao',
      title: 'Kỹ Thuật Viết Kịch Bản Giữ Chân & Thiết Kế Thumbnail CTR Cao',
      thumbnail: '/backgrounds/simple_02_mesh_gradient_vibrant.jpg',
      price: 149000,
      originalPrice: 480000,
      effectivePrice: 149000,
      registeredCount: 540,
    },
  ],
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Công nghệ thông tin', slug: 'cong-nghe-thong-tin' },
  { id: 2, name: 'Thiết kế đồ họa', slug: 'thiet-ke-do-hoa' },
  { id: 3, name: 'Marketing & Ads', slug: 'marketing' },
  { id: 4, name: 'Ngoại ngữ & IELTS', slug: 'ngoai-ngu' },
  { id: 5, name: 'Tin học văn phòng', slug: 'tin-hoc-van-phong' },
  { id: 6, name: 'Kỹ năng mềm', slug: 'ky-nang' },
  { id: 7, name: 'Kiếm tiền & MMO', slug: 'kiem-tien-va-mmo' },
  { id: 8, name: 'Kinh doanh khởi nghiệp', slug: 'kinh-doanh-va-khoi-nghiep' },
  { id: 9, name: 'Đầu tư tài chính', slug: 'dau-tu' },
  { id: 10, name: 'Dựng phim & Media', slug: 'dung-phim-va-nhiep-anh' },
  { id: 11, name: 'Khóa học TikTok', slug: 'khoa-hoc-tiktok' },
  { id: 12, name: 'Khóa học YouTube', slug: 'khoa-hoc-youtube' },
];

export default function CategoryGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('cong-nghe-thong-tin');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const { addItem, isInCart } = useCartStore();

  const { data } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoryApi.getTree(),
    staleTime: Infinity,
  });

  const apiCategories = ((data as any)?.data || []).filter((c: any) => c.slug !== 'combo-khoa-hoc');
  const categories = apiCategories.length > 0 ? apiCategories : DEFAULT_CATEGORIES;

  const isDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);

  // Cuộn bằng con lăn chuột (Mouse Wheel Scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Chặn hành vi kéo native của trình duyệt trên ảnh/nút
    const preventDrag = (e: DragEvent) => e.preventDefault();
    el.addEventListener('dragstart', preventDrag);

    // 1. Xử lý con lăn chuột (Cả lăn dọc chuyển thành cuộn ngang và lăn ngang native)
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      e.preventDefault();

      let step = delta;
      if (e.deltaMode === 1) {
        // Line mode (chuột thông thường trên Windows): tăng tốc độ cuộn phù hợp
        step = delta * 50;
      } else if (e.deltaMode === 2) {
        // Page mode
        step = delta * 400;
      } else if (Math.abs(step) < 25) {
        // Chuột bước nhỏ
        step = Math.sign(step) * 80;
      } else {
        // Pixel mode
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

  // 2. Kéo thả chuột ngang (Pointer Events & Pointer Capture)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Chỉ nhận chuột trái
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    isDownRef.current = true;
    startXRef.current = e.clientX;
    scrollLeftRef.current = el.scrollLeft;
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    const el = e.currentTarget;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 3) {
      isDraggingRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - dx;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    const el = e.currentTarget;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleAddCart = (e: React.MouseEvent, course: Course) => {
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

  const currentCategory = categories.find((c: any) => c.slug === activeCategory) || categories[0];
  const displayedCourses = CATEGORY_COURSES[activeCategory] || CATEGORY_COURSES['cong-nghe-thong-tin'];

  return (
    <section className="py-10 bg-transparent relative">
      {/* Ánh sáng dịu tỏa ra ở giữa */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="w-[900px] h-[450px] bg-indigo-500/10 blur-[140px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* ===== 1. THANH CUỘN DANH MỤC (MARGIN HORIZONTAL LỚN HƠN, CHỮ GỌN GÀNG TINH TẾ) ===== */}
        <div className="mb-10 max-w-4xl mx-auto px-4 sm:px-8">
          {/* Container danh mục: Margin horizontal thoáng đãng, cuộn mượt mà */}
          <div
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="overflow-x-auto no-scrollbar py-2.5 flex items-center gap-2 cursor-grab active:cursor-grabbing select-none px-2"
          >
            {categories.map((cat: any) => {
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={() => {
                    if (isDraggingRef.current) return;
                    setActiveCategory(cat.slug);
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all flex items-center gap-1.5 select-none ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'bg-[#141622] hover:bg-[#1C2032] text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm pointer-events-none">{CATEGORY_ICONS[cat.slug] || '📚'}</span>
                  <span className="whitespace-nowrap pointer-events-none">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 2. DANH SÁCH KHÓA HỌC CỦA LĨNH VỰC ĐANG CHỌN (LIST GRID 4 CỘT) ===== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>{CATEGORY_ICONS[currentCategory.slug] || '📚'}</span>
              <span>Lĩnh vực đang chọn</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Khóa học {currentCategory.name}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Tuyển tập học liệu Google Drive chọn lọc · Cập nhật liên tục · Kích hoạt tức thì
            </p>
          </div>

          <Link
            href={`/mua?category=${currentCategory.slug}`}
            className="text-xs text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Xem thêm khóa học {currentCategory.name} <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4-COLUMN GRID KHÓA HỌC THEO LĨNH VỰC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedCourses.map((course) => {
            const inCart = isInCart(course.id);
            const pct = Math.round((1 - course.effectivePrice / course.originalPrice) * 100);

            return (
              <div
                key={course.id}
                className="group flex flex-col bg-[#12141D] rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px] shadow-sm"
              >
                <Link href={`/khoa-hoc/${course.slug}`} className="block relative overflow-hidden">
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
                    {course.badge && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg shadow-sm">
                        {course.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors min-h-[40px]">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400 font-black text-base">
                        {fmt(course.effectivePrice)}
                      </span>
                      {course.effectivePrice < course.originalPrice && (
                        <span className="text-slate-500 line-through text-xs">
                          {fmt(course.originalPrice)}
                        </span>
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
                    onClick={(e) => handleAddCart(e, course)}
                    disabled={inCart}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      inCart
                        ? 'bg-emerald-950/80 text-emerald-400 cursor-default'
                        : 'bg-amber-400/15 hover:bg-amber-400 hover:text-slate-950 text-amber-400'
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
                    className="px-3.5 py-2.5 bg-[#181B26] hover:bg-[#202534] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
