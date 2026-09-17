'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { FolderOpen, ExternalLink, Search, Copy, Check } from 'lucide-react';
import { myCourseApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PurchasedCourse {
  id: number;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  driveLink: string;
}

const DEMO_MY_COURSES: PurchasedCourse[] = [
  {
    id: 999,
    slug: 'tron-bo-khoa-hoc-tren-website-voi-quyen-truy-cap-vinh-vien',
    title: 'Trọn Bộ Hơn 2.000+ Khóa Học Google Drive VIP Trọn Đời',
    category: 'Gói VIP Toàn Diện',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    driveLink: 'https://drive.google.com/drive/folders/14aGCvx2k8y6fPL93A5CbWiGwoVTEI3s-?usp=sharing',
  },
  {
    id: 2,
    slug: 'khoa-hoc-vibe-coding',
    title: 'Khóa Học Vibe Coding',
    category: 'Công nghệ thông tin',
    thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1FP2X7ic80XwafCEDZEL2VQnhurdQ46_A',
  },
  {
    id: 3,
    slug: 'khoa-hoc-ai-automation',
    title: 'Khóa Học AI Automation',
    category: 'Công nghệ thông tin',
    thumbnail: '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1xKuSs_Z7PVezCkHduVyaOcEOPgmSKtxj',
  },
  {
    id: 4,
    slug: 'khoa-hoc-backend',
    title: 'Khóa Học Backend Chuyên Sâu',
    category: 'Công nghệ thông tin',
    thumbnail: '/backgrounds/tech_04_digital_creator_desk.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1xNlIZl7KTVExXlX-ETyThjOyMapg2IKL',
  },
];

export default function MyCoursesPage() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [localCourses, setLocalCourses] = useState<PurchasedCourse[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('khgh_purchased_courses');
      if (stored) {
        setLocalCourses(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch real courses if logged in
  const { data: realCoursesData } = useQuery({
    queryKey: ['my-courses-list'],
    queryFn: () => myCourseApi.getAll(),
    retry: false,
  });

  const apiCourses = (realCoursesData as any)?.data;
  const baseCourses: PurchasedCourse[] = (apiCourses && apiCourses.length > 0)
    ? apiCourses.map((c: any) => ({
        id: c.id,
        slug: c.slug || `khoa-hoc-${c.id}`,
        title: c.title,
        category: c.categoryName || 'Khóa học',
        thumbnail: c.thumbnail || '/backgrounds/tech_03_abstract_3d_dark_wave.jpg',
        driveLink: c.driveLink || `https://drive.google.com/drive/folders/${c.driveFolderId || ''}`,
      }))
    : DEMO_MY_COURSES;

  const courseList = [...localCourses, ...baseCourses.filter(b => !localCourses.some(l => l.id === b.id))];

  const filtered = courseList.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = (course: PurchasedCourse) => {
    navigator.clipboard.writeText(course.driveLink);
    setCopiedId(course.id);
    toast.success('Đã sao chép link Google Drive!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header tối giản, không stroke */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Khóa học của tôi
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Học liệu Google Drive đã sở hữu · Truy cập trọn đời
            </p>
          </div>

          {/* Ô tìm kiếm gọn gàng không viền */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#141828] hover:bg-[#1A2034] focus:bg-[#1A2034] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Danh sách khóa học tinh gọn, rõ ràng, 100% không stroke */}
        <div className="space-y-3.5">
          {filtered.map((course) => {
            const isCopied = copiedId === course.id;

            return (
              <div
                key={course.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#141828] hover:bg-[#181D30] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Thông tin khóa học */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-[#1D2236] flex-shrink-0">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#1F253C] text-amber-300 text-[11px] font-semibold mb-1.5">
                      {course.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate hover:text-amber-400 transition-colors">
                      <Link href={`/khoa-hoc/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>
                  </div>
                </div>

                {/* Nút hành động chính */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyLink(course)}
                    className="p-2.5 bg-[#1F253C] hover:bg-[#28304D] text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Sao chép link Google Drive"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span className="hidden md:inline">{isCopied ? 'Đã chép' : 'Chép link'}</span>
                  </button>

                  <a
                    href={course.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <FolderOpen size={15} />
                    <span>Mở Google Drive</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trạng thái trống khi không tìm thấy kết quả */}
        {filtered.length === 0 && (
          <div className="text-center py-16 p-6 rounded-2xl bg-[#141828]">
            <FolderOpen size={36} className="text-slate-500 mx-auto mb-3" />
            <h4 className="text-white font-bold text-base">Không tìm thấy khóa học</h4>
            <p className="text-slate-400 text-xs mt-1">Vui lòng thử tìm kiếm lại với từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
