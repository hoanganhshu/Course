'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { courseApi, feedbackApi, membershipApi } from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CourseGrid from '@/components/home/CourseGrid';
import MembershipSection from '@/components/home/MembershipSection';
import FeedbackGallery from '@/components/home/FeedbackGallery';
import TrustBadges from '@/components/home/TrustBadges';

export default function HomePage() {
  const { data: flashSaleData } = useQuery({
    queryKey: ['flash-sale'],
    queryFn: () => courseApi.getFlashSale(),
    staleTime: 60_000,
  });

  const { data: bestSellersData } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => courseApi.getBestSellers(),
    staleTime: 300_000,
  });

  const { data: latestData } = useQuery({
    queryKey: ['latest-courses'],
    queryFn: () => courseApi.getLatest(),
    staleTime: 300_000,
  });

  const { data: membershipsData } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => membershipApi.getPlans(),
    staleTime: 600_000,
  });

  const { data: feedbacksData } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => feedbackApi.getAll(),
    staleTime: 600_000,
  });

  const flashSaleCourses = (flashSaleData as any)?.data || [];
  const bestSellers = (bestSellersData as any)?.data || [];
  const latestCourses = (latestData as any)?.data || [];
  const memberships = (membershipsData as any)?.data || [];
  const feedbacks = (feedbacksData as any)?.data || [];

  return (
    <>
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Danh mục kỹ năng (cuộn chuột) & Khóa học của lĩnh vực đang chọn (grid 4 cột) */}
      <CategoryGrid />

      {/* 3. Flash Sale theo khung giờ (nếu có) */}
      {flashSaleCourses.length > 0 && (
        <FlashSaleSection courses={flashSaleCourses} />
      )}

      {/* 5. Gói học & Khóa học mới cập nhật */}
      <CourseGrid
        title="Nội dung mới cập nhật"
        subtitle="Các khóa học công nghệ, thiết kế và kinh doanh vừa được bổ sung"
        courses={latestCourses}
        viewAllHref="/mua?sortBy=createdAt"
        bgClass="bg-transparent"
      />

      {/* 6. Bảng giá Hội Viên */}
      {memberships.length > 0 && (
        <MembershipSection memberships={memberships} />
      )}

      {/* 7. Feedback khách hàng */}
      {feedbacks.length > 0 && (
        <FeedbackGallery feedbacks={feedbacks} />
      )}
    </>
  );
}
