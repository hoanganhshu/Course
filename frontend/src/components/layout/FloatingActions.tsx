'use client';

import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import WebLiveChat from '@/components/chat/WebLiveChat';

export default function FloatingActions() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
        {/* 1. Nút Chat Trực Tiếp Với Shop Qua Website */}
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          title="Chat trực tiếp với Shop qua Website"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-2xl flex items-center justify-center transition-all hover:scale-110 aspect-square group relative"
        >
          {/* Online dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0B0E17]"></span>
          </span>

          <div className="flex flex-col items-center justify-center">
            <MessageSquareText size={24} className="group-hover:scale-110 transition-transform text-slate-950" />
            <span className="text-[10px] font-black tracking-tight leading-none mt-0.5">CHAT</span>
          </div>
        </button>

        {/* 2. Nút Zalo chính thức - Hình tròn hoàn hảo */}
        <a
          href="https://zalo.me/0583953426"
          target="_blank"
          rel="noreferrer"
          title="Chat Zalo hỗ trợ 24/7"
          className="w-14 h-14 rounded-full bg-[#0068FF] hover:bg-[#0054cc] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 aspect-square group"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="font-black text-sm tracking-tight leading-none">Zalo</span>
          </div>
        </a>

        {/* 3. Nút Facebook chính thức - Hình tròn hoàn hảo */}
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noreferrer"
          title="Facebook hỗ trợ"
          className="w-14 h-14 rounded-full bg-[#1877F2] hover:bg-[#1465cc] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 aspect-square"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      </div>

      {/* Cửa sổ Web Live Chat trực tiếp với Shop */}
      <WebLiveChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

