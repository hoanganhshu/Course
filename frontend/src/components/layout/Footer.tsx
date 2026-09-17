import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-transparent text-slate-400 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 text-2xl tracking-tight">
              Tạp Hóa Khóa Học
            </span>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-md">
              Sàn chia sẻ khóa học online và tài nguyên số bàn giao tự động qua Google Drive.
              Học trọn đời, cập nhật liên tục, hỗ trợ tận tâm 24/7.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href="https://zalo.me/0583953426"
                target="_blank"
                rel="noreferrer"
                className="bg-[#0068FF] hover:bg-[#0054cc] text-white text-xs px-4 py-2.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>💬 Chat Zalo: 0583 953 426</span>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-[#1877F2] hover:bg-[#1465cc] text-white text-xs px-4 py-2.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>🌐 Fanpage Facebook</span>
              </a>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Danh mục nổi bật</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Công nghệ thông tin', '/danh-muc/cong-nghe-thong-tin'],
                ['Thiết kế đồ họa',    '/danh-muc/thiet-ke-do-hoa'],
                ['Marketing & Ads',    '/danh-muc/marketing'],
                ['Ngoại ngữ',           '/danh-muc/ngoai-ngu'],
                ['Tin học văn phòng',   '/danh-muc/tin-hoc-van-phong'],
                ['Kiếm tiền và MMO',    '/danh-muc/kiem-tien-va-mmo'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-yellow-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ & Chính sách */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Trang chủ',           '/'],
                ['Tất cả khóa học',     '/mua'],
                ['Gói hội viên',         '/hoi-vien'],
                ['Hướng dẫn mua hàng',  '/huong-dan-mua-hang'],
                ['Chính sách bảo hành', '/chinh-sach-bao-hanh'],
                ['Phản hồi khách hàng', '/feedback'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-yellow-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tạp Hóa Khóa Học — Hệ thống chia sẻ học liệu số tự động.</p>
        </div>
      </div>
    </footer>
  );
}
