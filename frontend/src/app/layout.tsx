import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/layout/FloatingActions';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: {
    default: 'Tạp Hóa Khóa Học - Share khóa học online giá rẻ, uy tín, chất lượng',
    template: '%s | Tạp Hóa Khóa Học',
  },
  description:
    'Khám phá hàng ngàn khóa học online chất lượng thuộc nhiều lĩnh vực với mức giá tốt, nhận khóa học nhanh chóng qua Google Drive tại Tạp Hóa Khóa Học.',
  keywords: ['tạp hóa khóa học', 'khóa học online', 'học lập trình', 'học thiết kế', 'khóa học giá rẻ', 'google drive'],
  openGraph: {
    type: 'website',
    siteName: 'Tạp Hóa Khóa Học',
    locale: 'vi_VN',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} text-slate-100 antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FloatingActions />
        </Providers>
      </body>
    </html>
  );
}
