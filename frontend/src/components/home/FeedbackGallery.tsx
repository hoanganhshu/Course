'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ZoomIn, ArrowRight } from 'lucide-react';

interface Feedback { id: number; imageUrl: string; customerName?: string; comment?: string; }

export default function FeedbackGallery({ feedbacks }: { feedbacks: Feedback[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Phản hồi thật từ khách hàng</h2>
            <p className="text-slate-400 text-sm mt-1">
              Những ảnh trò chuyện được lưu lại trong quá trình tư vấn, thanh toán và hỗ trợ nhận khóa học.
            </p>
          </div>
          <Link href="/feedback" className="flex items-center gap-1 text-indigo-400 hover:text-yellow-400 text-xs font-bold whitespace-nowrap transition-colors">
            Xem tất cả đánh giá <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
          {feedbacks.map((fb, i) => (
            <button key={fb.id} onClick={() => setLightbox(fb.imageUrl)}
              className="relative group rounded-2xl overflow-hidden aspect-[3/4] bg-[#11141E] cursor-zoom-in">
              <Image src={fb.imageUrl} alt={`Phản hồi #${String(i + 1).padStart(2, '0')}`}
                fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-indigo-950/30 transition-colors flex items-center justify-center">
                <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                <p className="text-white text-xs font-semibold">Phản hồi #{String(i + 1).padStart(2, '0')}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/feedback" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-300 bg-[#131624] hover:bg-[#1A2033] hover:text-yellow-400 transition-all shadow-lg">
            Xem toàn bộ 60+ phản hồi <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2">
            <X size={28} />
          </button>
          <div className="relative max-w-lg w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox} alt="Phản hồi khách hàng"
              width={500} height={700} className="rounded-xl object-contain max-h-[90vh] w-auto mx-auto" />
          </div>
        </div>
      )}
    </section>
  );
}
