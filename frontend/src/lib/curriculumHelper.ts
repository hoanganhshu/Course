// Helper phân tích và chuẩn hóa khung bài học (Curriculum / Sections / Lessons)
import driveCacheRaw from '@/data/curriculumDriveCache.json';

export interface LessonItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'archive' | 'folder' | 'code';
  duration?: string;
  isPreview?: boolean;
}

export interface SectionItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface CourseCurriculumData {
  totalSections: number;
  totalLessons: number;
  totalDurationText: string;
  sections: SectionItem[];
}

const driveCache = driveCacheRaw as Record<string, Array<{ id: string; name: string; mime?: string; is_folder?: boolean }>>;

// Phân loại đuôi file
function detectFileType(name: string, isFolder?: boolean): LessonItem['type'] {
  if (isFolder) return 'folder';
  const lower = name.toLowerCase();
  if (/\.(mp4|mov|mkv|webm|avi|flv|m4v)$/.test(lower) || /buổi|bai|video|lecture|session|bài/i.test(lower)) {
    return 'video';
  }
  if (/\.(pdf|docx?|pptx?|xlsx?|txt|epub)$/.test(lower) || /tài liệu|slide|giao trinh|ebook|sách/i.test(lower)) {
    return 'document';
  }
  if (/\.(zip|rar|7z|tar\.gz)$/.test(lower) || /source|code|mã nguồn|project/i.test(lower)) {
    return 'archive';
  }
  return 'video';
}

function estimateDuration(title: string, index: number): string {
  const durations = ['12:45', '18:20', '25:10', '15:35', '32:15', '21:40', '14:50', '28:05', '19:15', '41:20'];
  return durations[(title.length + index) % durations.length];
}

function cleanLessonName(raw: string): string {
  return raw
    .replace(/\.(mp4|mov|mkv|webm|avi|pdf|docx?|pptx?|xlsx?|zip|rar|txt)$/i, '')
    .replace(/^(\d+[\.\-\_\s]+)/, '')
    .trim();
}

/**
 * Lấy khung chương trình cho 1 khóa học bất kỳ
 */
export function getCourseCurriculum(course: {
  id?: number | string;
  title: string;
  categorySlug?: string;
  categoryName?: string;
  description?: string;
  driveFolderId?: string;
  drive_folder_id?: string;
}): CourseCurriculumData {
  const folderId = course.driveFolderId || course.drive_folder_id;
  const driveItems = folderId && driveCache[folderId] ? driveCache[folderId] : [];

  // 1. NẾU CÓ DỮ LIỆU DRIVE THỰC TẾ TRONG CACHE
  if (driveItems && driveItems.length > 0) {
    const folders = driveItems.filter((i) => i.is_folder);
    const files = driveItems.filter((i) => !i.is_folder);

    // TH 1A: Có từ 2 thư mục con trở lên -> Mỗi thư mục là 1 Chương/Phần
    if (folders.length >= 2) {
      const sections: SectionItem[] = folders.map((folder, sIdx) => {
        const cleanSectionTitle = folder.name.replace(/^[0-9]+[\.\-\_\s]+/, '').trim();
        const sampleLessons: LessonItem[] = [
          {
            id: `${folder.id}-1`,
            title: `Bài giảng: Tổng quan & Khởi động ${cleanSectionTitle}`,
            type: 'video',
            duration: estimateDuration(cleanSectionTitle, 0),
            isPreview: sIdx === 0,
          },
          {
            id: `${folder.id}-2`,
            title: `Thực hành chuyên sâu & Hướng dẫn kỹ thuật chi tiết`,
            type: 'video',
            duration: estimateDuration(cleanSectionTitle, 1),
          },
          {
            id: `${folder.id}-3`,
            title: `Tài liệu tóm tắt, Source code & Đồ án mẫu đính kèm`,
            type: 'document',
          },
        ];

        return {
          id: folder.id || `sec-${sIdx}`,
          title: `Phần ${sIdx + 1}: ${cleanSectionTitle}`,
          lessons: sampleLessons,
        };
      });

      if (files.length > 0) {
        sections.unshift({
          id: 'sec-intro',
          title: 'Phần mở đầu: Hướng dẫn học & Tài nguyên chung',
          lessons: files.map((f, idx) => ({
            id: f.id || `file-${idx}`,
            title: cleanLessonName(f.name),
            type: detectFileType(f.name, f.is_folder),
            duration: detectFileType(f.name) === 'video' ? estimateDuration(f.name, idx) : undefined,
            isPreview: idx === 0,
          })),
        });
      }

      const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
      return {
        totalSections: sections.length,
        totalLessons,
        totalDurationText: `${Math.max(2, Math.round(totalLessons * 22 / 60))} giờ ${Math.round((totalLessons * 22) % 60)} phút`,
        sections,
      };
    }

    // TH 1B: Danh sách bài học phẳng (các file/video hoặc sub-courses)
    if (driveItems.length > 0) {
      const chunkSize = Math.max(3, Math.ceil(driveItems.length / 4));
      const sections: SectionItem[] = [];

      for (let i = 0; i < driveItems.length; i += chunkSize) {
        const chunk = driveItems.slice(i, i + chunkSize);
        const secIndex = Math.floor(i / chunkSize) + 1;
        const isFirstSec = secIndex === 1;

        let secTitle = `Phần ${secIndex}: Kiến thức & Thực hành bài giảng`;
        if (isFirstSec) secTitle = 'Phần 1: Giới thiệu & Cài đặt chuẩn bị';
        else if (i + chunkSize >= driveItems.length) secTitle = `Phần ${secIndex}: Đồ án thực chiến & Tài nguyên tổng kết`;

        sections.push({
          id: `sec-${secIndex}`,
          title: secTitle,
          lessons: chunk.map((item, lIdx) => ({
            id: item.id || `item-${i + lIdx}`,
            title: cleanLessonName(item.name),
            type: detectFileType(item.name, item.is_folder),
            duration: detectFileType(item.name, item.is_folder) === 'video' ? estimateDuration(item.name, lIdx) : undefined,
            isPreview: isFirstSec && lIdx === 0,
          })),
        });
      }

      const totalLessons = driveItems.length;
      return {
        totalSections: sections.length,
        totalLessons,
        totalDurationText: `${Math.max(2, Math.round(totalLessons * 20 / 60))} giờ ${Math.round((totalLessons * 20) % 60)} phút`,
        sections,
      };
    }
  }

  // 2. FALLBACK TỰ ĐỘNG SINH KHUNG CHƯƠNG TRÌNH CHUẨN THEO CHUYÊN MÔN
  const cTitle = course.title || 'Khóa học';
  const cat = (course.categorySlug || '').toLowerCase();

  let defaultTemplates: { section: string; lessons: string[] }[] = [];

  if (cat.includes('cong-nghe') || cat.includes('it') || cat.includes('lap-trinh') || /vibe coding|ai|python|web|react|java/i.test(cTitle)) {
    defaultTemplates = [
      {
        section: 'Chương 1: Tổng quan, Tư duy & Cài đặt môi trường',
        lessons: [
          'Giới thiệu lộ trình đào tạo và mục tiêu đầu ra',
          'Cài đặt môi trường phát triển, IDE, SDK và công cụ hỗ trợ',
          'Tư duy giải thuật và nguyên lý kiến trúc nền tảng',
          'Khởi tạo project mẫu đầu tiên và kiểm tra cấu hình',
        ],
      },
      {
        section: 'Chương 2: Kiến thức nền tảng & Các kỹ thuật cốt lõi',
        lessons: [
          'Cú pháp nâng cao & các thành phần kiến trúc thiết yếu',
          'Tổ chức module, quy ước Clean Code và cấu trúc thư mục',
          'Xử lý luồng dữ liệu bất đồng bộ & kết nối API',
          'Các bẫy lỗi thường gặp và phương pháp Debug chuyên nghiệp',
        ],
      },
      {
        section: 'Chương 3: Thực chiến Xây dựng Dự án thực tế từ A - Z',
        lessons: [
          'Phân tích nghiệp vụ thực tế và thiết kế Database',
          'Lập trình module lõi theo kiến trúc chuẩn doanh nghiệp',
          'Bảo mật dữ liệu, xác thực phân quyền và chống tấn công',
          'Tối ưu hiệu năng, caching và kiểm thử tự động',
        ],
      },
      {
        section: 'Chương 4: Triển khai (Deploy) & Quà tặng Tài nguyên',
        lessons: [
          'Đóng gói Docker, cấu hình Production và CI/CD tự động',
          'Triển khai lên Server / Cloud và giám sát hệ thống 24/7',
          'Trọn bộ Source Code mẫu đầy đủ & Slide hướng dẫn độc quyền',
        ],
      },
    ];
  } else if (cat.includes('marketing') || cat.includes('tiktok') || cat.includes('facebook') || cat.includes('mmo')) {
    defaultTemplates = [
      {
        section: 'Chương 1: Nghiên cứu thị trường & Chân dung khách hàng',
        lessons: [
          'Tổng quan bức tranh thị trường và cơ hội chuyển đổi',
          'Phác họa chân dung khách hàng và tìm kiếm nỗi đau sản phẩm',
          'Phân tích đối thủ cạnh tranh và định vị thương hiệu khác biệt',
        ],
      },
      {
        section: 'Chương 2: Xây dựng Kịch bản & Content Viral giữ chân người xem',
        lessons: [
          'Công thức viết kịch bản 3 giây đầu giật tít, tò mò',
          'Quy trình sản xuất Video ngắn số lượng lớn với chi phí tối ưu',
          'Kỹ thuật điều hướng traffic tự nhiên về kênh bán hàng',
        ],
      },
      {
        section: 'Chương 3: Cài đặt Chiến dịch Quảng cáo & Tối ưu chuyển đổi',
        lessons: [
          'Cài đặt Pixel, tạo tài khoản quảng cáo an toàn chống khóa',
          'Kỹ thuật test tệp, đọc chỉ số CPM, CTR và vít ngân sách',
          'Kịch bản tư vấn và chốt sale tự động tăng tỷ lệ hoàn tất',
        ],
      },
      {
        section: 'Chương 4: Tự Động Hóa & Trọn bộ Tài liệu Mẫu độc quyền',
        lessons: [
          'Ứng dụng AI vào nghiên cứu và viết content tự động',
          'Bộ Template kịch bản mẫu & Bảng tính quản lý tài chính chuẩn',
        ],
      },
    ];
  } else if (cat.includes('thiet-ke') || cat.includes('dung-phim') || cat.includes('nhiep-anh')) {
    defaultTemplates = [
      {
        section: 'Chương 1: Tư duy Thẩm mỹ, Bố cục & Phối màu',
        lessons: [
          'Nguyên lý thị giác, quy tắc bố cục và phân cấp thông tin',
          'Cách chọn bảng màu và kết hợp Typography chuẩn',
          'Làm quen giao diện và bộ phím tắt tăng tốc làm việc gấp 3 lần',
        ],
      },
      {
        section: 'Chương 2: Kỹ năng Thực hành Chuyên sâu với Công cụ',
        lessons: [
          'Kỹ thuật cắt ghép, tách nền và xử lý ánh sáng chân thực',
          'Xử lý chất liệu, tạo bóng đổ và chiều sâu không gian',
          'Chỉnh màu điện ảnh và hiệu ứng âm thanh sống động',
        ],
      },
      {
        section: 'Chương 3: Thiết kế Ấn phẩm Thực chiến theo Yêu cầu Khách hàng',
        lessons: [
          'Thiết kế Key Visual, Banner và Thumbnail triệu view',
          'Dựng video ngắn viral đa nền tảng (Tiktok, Reels, Shorts)',
          'Quy chuẩn xuất file in ấn và hiển thị sắc nét trên mạng xã hội',
        ],
      },
      {
        section: 'Chương 4: Kho Tài nguyên Độc quyền & Preset Màu VIP',
        lessons: [
          'Trọn bộ Preset màu điện ảnh, Font chữ Việt hóa và Sound FX',
          'File Project thực hành mẫu (.PSD, .PRPROJ, .AEP) dùng được ngay',
        ],
      },
    ];
  } else {
    defaultTemplates = [
      {
        section: 'Chương 1: Giới thiệu & Khởi động lộ trình học tập',
        lessons: [
          'Mục tiêu khóa học và phương pháp tiếp thu nhanh nhất',
          'Chuẩn bị tâm thế, công cụ và tài liệu học tập cần thiết',
        ],
      },
      {
        section: 'Chương 2: Hệ thống Kiến thức Nền tảng cốt lõi',
        lessons: [
          'Các nguyên lý quan trọng được giải thích trực quan, dễ hiểu',
          'Phân tích các tình huống thực tiễn từ chuyên gia',
          'Những sai lầm phổ biến cần tránh khi mới bắt đầu',
        ],
      },
      {
        section: 'Chương 3: Ứng dụng Thực chiến & Đúc kết kinh nghiệm',
        lessons: [
          'Thực hành giải quyết các bài toán thực tế thường gặp',
          'Các mẹo tối ưu hiệu suất và tiết kiệm thời gian',
          'Xây dựng kế hoạch phát triển kỹ năng lâu dài',
        ],
      },
      {
        section: 'Chương 4: Tổng kết & Bộ Tài liệu Khóa học',
        lessons: [
          'Tổng kết toàn bộ kiến thức và bài tập tự đánh giá',
          'Trọn bộ Ebook, Slide tóm tắt và hướng dẫn thực hành chuyên sâu',
        ],
      },
    ];
  }

  const sections: SectionItem[] = defaultTemplates.map((tpl, sIdx) => ({
    id: `tpl-sec-${sIdx + 1}`,
    title: tpl.section,
    lessons: tpl.lessons.map((lTitle, lIdx) => ({
      id: `tpl-l-${sIdx + 1}-${lIdx + 1}`,
      title: lTitle,
      type: lTitle.toLowerCase().includes('tài liệu') || lTitle.toLowerCase().includes('slide') || lTitle.toLowerCase().includes('source') ? 'document' : 'video',
      duration: estimateDuration(lTitle, lIdx),
      isPreview: sIdx === 0 && lIdx === 0,
    })),
  }));

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return {
    totalSections: sections.length,
    totalLessons,
    totalDurationText: `${Math.max(2, Math.round(totalLessons * 18 / 60))} giờ ${Math.round((totalLessons * 18) % 60)} phút`,
    sections,
  };
}
