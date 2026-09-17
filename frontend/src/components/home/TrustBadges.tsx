export default function TrustBadges() {
  const items = [
    { icon: '⚡', title: 'Khoảng 30 giây', desc: 'Nhận link sau thanh toán' },
    { icon: '♾️', title: 'Học lại lâu dài', desc: 'Không giới hạn số lần xem' },
    { icon: '📁', title: 'Google Drive', desc: 'Học thuận tiện trên mọi thiết bị' },
    { icon: '💬', title: 'Zalo hỗ trợ', desc: 'Xử lý nhanh khi cần trợ giúp' },
  ];

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-2">Chọn khoá học, phần còn lại để tụi mình lo</h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          Từ lúc thanh toán đến khi bắt đầu học đều đơn giản, rõ ràng và luôn có người hỗ trợ khi bạn cần.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center p-5 bg-[#11141E] rounded-2xl shadow-md">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="font-bold text-white text-base">{item.title}</div>
              <div className="text-slate-400 text-xs mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
