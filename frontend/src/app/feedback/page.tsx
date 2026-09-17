'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, X, CheckCircle2, MessageCircle } from 'lucide-react';

const FEEDBACKS = [
  { id: 1,  imageUrl: '/feedbacks/01.jpg', title: 'Nhận link Drive sau 1 phút' },
  { id: 2,  imageUrl: '/feedbacks/02.jpg', title: 'Khóa học chất lượng cao, nét căng' },
  { id: 3,  imageUrl: '/feedbacks/03.jpg', title: 'Tài liệu đầy đủ bài tập và source code' },
  { id: 4,  imageUrl: '/feedbacks/04.jpg', title: 'Support nhiệt tình, hướng dẫn tận tâm' },
  { id: 5,  imageUrl: '/feedbacks/05.jpg', title: 'Đã mua gói VIP trọn đời quá hời' },
  { id: 6,  imageUrl: '/feedbacks/06.jpg', title: 'Cập nhật khóa học mới liên tục' },
  { id: 7,  imageUrl: '/feedbacks/07.jpg', title: 'Học mọi lúc trên điện thoại và laptop' },
  { id: 8,  imageUrl: '/feedbacks/08.jpg', title: 'Thanh toán tự động siêu tiện' },
  { id: 9,  imageUrl: '/feedbacks/09.jpg', title: 'Tài khoản Google Drive vĩnh viễn' },
  { id: 10, imageUrl: '/feedbacks/10.jpg', title: 'Ủng hộ shop dài lâu' },
  { id: 11, imageUrl: '/feedbacks/11.jpg', title: 'Khóa học lập trình và AI đỉnh cao' },
  { id: 12, imageUrl: '/feedbacks/12.jpg', title: 'Tải tài liệu và video rất nhanh' },
];

export default function FeedbackPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="min-h-screen py-10 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-4 transition-colors">
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full inline-block mb-2">
              ⭐ Đánh giá & Uy tín
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Phản hồi thật từ khách hàng
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              100% hình ảnh thực tế từ các học viên đã mua khóa học và nhận bàn giao tài nguyên qua Google Drive.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://zalo.me/0583953426"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0068FF] hover:bg-[#0054cc] text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <MessageCircle size={15} />
              <span>Zalo hỗ trợ: 0583 953 426</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {FEEDBACKS.map((fb) => (
          <div
            key={fb.id}
            onClick={() => setLightbox(fb.imageUrl)}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#11141E] cursor-zoom-in border border-slate-800/40 hover:border-amber-400/50 transition-all shadow-md"
          >
            <Image
              src={fb.imageUrl}
              alt={fb.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mb-0.5">
                <CheckCircle2 size={12} />
                <span>Đã xác thực</span>
              </div>
              <p className="text-white text-xs font-bold line-clamp-1">{fb.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full aspect-[3/4]">
            <Image
              src={lightbox}
              alt="Phản hồi chi tiết"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 text-sm font-bold flex items-center gap-1"
            >
              <X size={20} /> Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
