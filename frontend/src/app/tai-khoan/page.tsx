'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, ExternalLink, User, FolderOpen } from 'lucide-react';
import { authApi, myCourseApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TaiKhoanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [driveLinks, setDriveLinks] = useState<Record<number, string>>({});
  const [loadingLink, setLoadingLink] = useState<number | null>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    retry: false,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => myCourseApi.getAll(),
    enabled: !!profileData,
  });

  const profile = (profileData as any)?.data;
  const courses = (coursesData as any)?.data || [];

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      router.replace('/dang-nhap-dang-ky');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Đã đăng xuất');
    router.push('/');
  };

  const handleGetDriveLink = async (courseId: number) => {
    if (driveLinks[courseId]) {
      window.open(driveLinks[courseId], '_blank');
      return;
    }
    setLoadingLink(courseId);
    try {
      const res: any = await myCourseApi.getDriveLink(courseId);
      const link = res.data?.driveLink;
      setDriveLinks((prev) => ({ ...prev, [courseId]: link }));
      window.open(link, '_blank');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lấy link. Vui lòng thử lại.');
    } finally {
      setLoadingLink(null);
    }
  };

  if (profileLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-[#141828] rounded w-1/3 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[#141828] rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#181F3B] to-[#12162B] rounded-2xl p-6 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">{profile.name}</h1>
            <p className="text-slate-400 text-xs sm:text-sm">{profile.email}</p>
            {profile.hasMembership && (
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5">
                👑 Hội viên {profile.membershipName}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#1F253C] hover:bg-[#28314F] text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors self-start sm:self-center"
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>

      {/* Stats */}
      {profile.hasMembership && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Gói hội viên', value: profile.membershipName },
            { label: 'Đã nhận hôm nay', value: `${profile.dailyClaimedCount} / ${profile.dailyQuota === -1 ? '∞' : profile.dailyQuota}` },
            { label: 'Hết hạn', value: profile.membershipExpiresAt ? new Date(profile.membershipExpiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn' },
          ].map((s) => (
            <div key={s.label} className="bg-[#141828] rounded-2xl p-4 text-center">
              <div className="font-black text-amber-400 text-lg">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-[#141828] p-1 rounded-xl inline-flex gap-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'courses' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} /> Khóa học của tôi ({courses.length})
          </button>
        </div>
        <Link
          href="/khoa-hoc-cua-toi"
          className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
        >
          <span>Xem chế độ danh sách học</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Course List */}
      {coursesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#141828] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-[#141828]">
          <FolderOpen size={44} className="mx-auto text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Chưa có khóa học nào</h3>
          <p className="text-slate-400 text-xs mb-6">Hãy chọn các khóa học bạn yêu thích để bắt đầu học nhé!</p>
          <Link href="/mua" className="btn-primary">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-[#141828] hover:bg-[#181D30] rounded-2xl overflow-hidden transition-all flex flex-col justify-between">
              <div className="relative w-full h-36 bg-[#1A2035] overflow-hidden">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-white text-sm line-clamp-2 mb-3 min-h-[36px]">
                  {course.title}
                </h3>
                <button
                  onClick={() => handleGetDriveLink(course.id)}
                  disabled={loadingLink === course.id}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
                >
                  <ExternalLink size={14} />
                  {loadingLink === course.id ? 'Đang lấy link...' : driveLinks[course.id] ? 'Mở Google Drive' : '📁 Học ngay'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
