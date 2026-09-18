'use client';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import CourseCurriculum from './CourseCurriculum';

interface Props {
  course: {
    id?: number | string;
    title: string;
    slug?: string;
    categorySlug?: string;
    categoryName?: string;
    description?: string;
    driveFolderId?: string;
    drive_folder_id?: string;
    effectivePrice?: number;
    price?: number;
  } | null;
  onClose: () => void;
}

export default function CurriculumModal({ course, onClose }: Props) {
  if (!course) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#101322] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-[#141828]">
          <div className="min-w-0 flex-1">
            {course.categoryName && (
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 block">
                {course.categoryName}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-black text-white leading-snug truncate">
              {course.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {course.slug && (
              <Link
                href={`/khoa-hoc/${course.slug}`}
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Trang chi tiết</span>
                <ExternalLink size={13} />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Curriculum */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-[#0C0E1A]">
          <CourseCurriculum course={course} />
        </div>
      </div>
    </div>
  );
}
