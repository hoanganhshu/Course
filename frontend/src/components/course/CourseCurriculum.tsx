'use client';
import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Folder,
  Code,
  Lock,
  Unlock,
  Search,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getCourseCurriculum, CourseCurriculumData, LessonItem } from '@/lib/curriculumHelper';

interface Props {
  course: {
    id?: number | string;
    title: string;
    categorySlug?: string;
    categoryName?: string;
    description?: string;
    driveFolderId?: string;
    drive_folder_id?: string;
  };
}

export default function CourseCurriculum({ course }: Props) {
  const curriculum: CourseCurriculumData = useMemo(() => {
    return getCourseCurriculum(course);
  }, [course]);

  // Quản lý trạng thái mở/đóng các chương (mặc định mở chương 1)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [curriculum.sections[0]?.id || 'sec-0']: true,
  });

  // Tìm kiếm bài học
  const [searchQuery, setSearchQuery] = useState('');

  // Modal xem thử bài học
  const [previewLesson, setPreviewLesson] = useState<LessonItem | null>(null);

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    curriculum.sections.forEach((s) => {
      allOpen[s.id] = true;
    });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  // Lọc bài học theo tìm kiếm nếu có
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return curriculum.sections;
    const q = searchQuery.toLowerCase();
    return curriculum.sections
      .map((sec) => {
        const matchedLessons = sec.lessons.filter(
          (l) => l.title.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q)
        );
        return {
          ...sec,
          lessons: matchedLessons,
        };
      })
      .filter((sec) => sec.lessons.length > 0);
  }, [curriculum.sections, searchQuery]);

  const allAreExpanded = curriculum.sections.every((s) => openSections[s.id]);

  const renderIcon = (type: LessonItem['type']) => {
    switch (type) {
      case 'video':
        return <PlayCircle size={16} className="text-amber-400 flex-shrink-0" />;
      case 'document':
        return <FileText size={16} className="text-sky-400 flex-shrink-0" />;
      case 'archive':
        return <Code size={16} className="text-emerald-400 flex-shrink-0" />;
      case 'folder':
        return <Folder size={16} className="text-indigo-400 flex-shrink-0" />;
      default:
        return <BookOpen size={16} className="text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-[#141828] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm my-6">
      {/* Tiêu đề chính */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles size={14} />
            <span>Chương trình đào tạo chi tiết</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            Nội dung & Danh mục bài học
          </h2>
        </div>

        {/* Thống kê tổng quát */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 font-medium flex items-center gap-1.5 border border-slate-700/50">
            <Layers size={13} className="text-amber-400" />
            <strong className="text-white">{curriculum.totalSections}</strong> phần / mục
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 font-medium flex items-center gap-1.5 border border-slate-700/50">
            <BookOpen size={13} className="text-sky-400" />
            <strong className="text-white">{curriculum.totalLessons}</strong> bài giảng & tài liệu
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 font-medium flex items-center gap-1.5 border border-slate-700/50">
            <Clock size={13} className="text-emerald-400" />
            <strong className="text-white">{curriculum.totalDurationText}</strong>
          </span>
        </div>
      </div>

      {/* Thanh công cụ: Tìm kiếm + Mở/Thu gọn */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 pb-4">
        {/* Ô tìm kiếm bài học */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học, chủ đề, file tài liệu..."
            className="w-full pl-9 pr-3 py-2 bg-[#0E101A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Nút Mở tất cả / Thu gọn */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {allAreExpanded ? (
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ChevronUp size={14} />
              <span>Thu gọn tất cả</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ChevronDown size={14} />
              <span>Mở rộng tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* Danh sách các phần & bài học (Accordions) */}
      <div className="space-y-3">
        {filteredSections.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Không tìm thấy bài học phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredSections.map((section, sIdx) => {
            const isOpen = Boolean(openSections[section.id] || searchQuery.trim().length > 0);
            return (
              <div
                key={section.id}
                className="rounded-xl border border-slate-800/90 overflow-hidden bg-[#111322] transition-all"
              >
                {/* Header của từng Chương/Phần */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#181B2E] transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 text-xs font-black flex items-center justify-center flex-shrink-0 border border-amber-400/20">
                      {sIdx + 1}
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {section.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                      {section.lessons.length} bài học
                    </span>
                    <span className="text-slate-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </button>

                {/* Danh sách các bài học bên trong Chương */}
                {isOpen && (
                  <div className="divide-y divide-slate-800/50 border-t border-slate-800/80 bg-[#0C0E18]/60">
                    {section.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors text-xs"
                      >
                        {/* Cột trái: Icon + Tên bài học */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderIcon(lesson.type)}
                          <span className="text-slate-200 font-medium truncate">
                            {lIdx + 1}. {lesson.title}
                          </span>
                        </div>

                        {/* Cột phải: Học thử / Thời lượng / Khóa */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lesson.isPreview ? (
                            <button
                              type="button"
                              onClick={() => setPreviewLesson(lesson)}
                              className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-300 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Unlock size={10} />
                              <span>Học thử</span>
                            </button>
                          ) : (
                            <Lock size={12} className="text-slate-600 hidden sm:inline-block" />
                          )}

                          {lesson.duration && (
                            <span className="text-slate-500 text-[11px] font-mono">
                              {lesson.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cam kết & Đầy đủ */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Toàn bộ bài giảng, slide và source code được lưu trữ trọn đời trên Google Drive.</span>
        </span>
      </div>

      {/* Lightbox / Preview Modal khi click "Học thử" */}
      {previewLesson && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewLesson(null)}
        >
          <div
            className="bg-[#141828] border border-slate-700 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewLesson(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 text-[11px] font-bold mb-2">
              <Sparkles size={12} />
              <span>Xem trước bài giảng miễn phí</span>
            </div>

            <h3 className="text-base font-extrabold text-white mb-3 leading-snug">
              {previewLesson.title}
            </h3>

            {/* Video Player Placeholder */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center border border-slate-800 mb-4 group">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle size={28} className="fill-slate-950 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Video giới thiệu và hướng dẫn tổng quan (~{previewLesson.duration || '15:00'})
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Sau khi đặt hàng, toàn bộ quyền truy cập thư mục Google Drive của khóa học sẽ được mở khóa tự động kèm link tải trực tiếp trong vòng 30 giây.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
              >
                Đã hiểu, quay lại khóa học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
