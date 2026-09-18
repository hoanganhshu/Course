'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ExternalLink,
  Bot,
  User as UserIcon,
  RotateCcw,
  Headphones,
  ShieldCheck,
} from 'lucide-react';
import { chatStore, ChatMessage, ChatSession } from '@/lib/chatStore';

const QUICK_ACTIONS = [
  { label: '💳 Cách nạp tiền vào ví', query: 'Cách nạp tiền vào ví như thế nào?' },
  { label: '📦 Combo 2.000+ Khóa học', query: 'Tư vấn combo 2.000 khóa học VIP' },
  { label: '⚡ Cách nhận link Drive', query: 'Sau khi mua thì nhận khóa học qua Drive như thế nào?' },
  { label: '💬 Chat Zalo hỗ trợ', query: 'Tôi muốn chat trực tiếp qua Zalo với nhân viên' },
];

interface WebLiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebLiveChat({ isOpen, onClose }: WebLiveChatProps) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or get current chat session
  useEffect(() => {
    // Try to get user profile if logged in
    let userInfo: { name?: string; email?: string; id?: any } = {};
    try {
      const savedUser = localStorage.getItem('auth_user') || localStorage.getItem('profile_data');
      if (savedUser) {
        userInfo = JSON.parse(savedUser);
      }
    } catch {}

    const sess = chatStore.getOrCreateUserSession(userInfo);
    setSession(sess);
    setMessages(sess.messages);

    // Subscribe to realtime updates from Admin or other tabs
    const unsubscribe = chatStore.subscribe(() => {
      const refreshed = chatStore.getSession(sess.sessionId);
      if (refreshed) {
        setSession(refreshed);
        setMessages([...refreshed.messages]);
      }
    });

    return () => unsubscribe();
  }, []);

  // When chat window is opened, mark unread messages as read
  useEffect(() => {
    if (isOpen && session) {
      chatStore.markAsReadByUser(session.sessionId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, session, messages.length]);

  const getTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const generateBotReply = (userText: string): { text: string; actionLink?: { label: string; url: string } } | null => {
    const lower = userText.toLowerCase();

    if (lower.includes('nạp') || lower.includes('ví') || lower.includes('tiền') || lower.includes('stk') || lower.includes('ngân hàng')) {
      return {
        text: 'Dạ để nạp tiền vào ví:\n1. Bạn vào mục "Ví & Tài Khoản" (hoặc bấm nút bên dưới).\n2. Chọn số tiền và bấm "Tạo Mã QR Nạp Tiền".\n3. Quét mã VietQR bằng App Ngân Hàng. Hệ thống sẽ tự tạo NỘI DUNG CHUYỂN KHOẢN NGẪU NHIÊN ĐỊNH DANH (VD: NAP104X892014) duy nhất cho bạn.\n4. Sau khi chuyển đúng nội dung đó, hệ thống sẽ nhận diện và tự động cộng số dư vào ví của bạn ngay!',
        actionLink: {
          label: '👉 Đến trang Nạp Tiền Vào Ví',
          url: '/tai-khoan',
        },
      };
    }

    if (lower.includes('combo') || lower.includes('2000') || lower.includes('trọn bộ') || lower.includes('vip')) {
      return {
        text: '🔥 Trọn bộ COMBO 2.000+ Khóa Học Google Drive VIP đang được ưu đãi chỉ 599.000đ (tiết kiệm hơn 95%). Gồm đầy đủ tài liệu, video bài giảng, source code các ngành: Lập trình, AI, Marketing, Thiết kế, Ngoại ngữ, Kinh doanh... Sở hữu trọn đời và cập nhật liên tục!',
        actionLink: {
          label: '👉 Xem chi tiết Combo 2.000 Khóa',
          url: '/combo',
        },
      };
    }

    if (lower.includes('drive') || lower.includes('link') || lower.includes('bảo hành') || lower.includes('truy cập')) {
      return {
        text: '✨ Sau khi thanh toán thành công, hệ thống sẽ tự động cấp quyền truy cập folder Google Drive trực tiếp vào Gmail bạn đã đăng ký. Bạn có thể xem online hoặc tải về máy trọn đời. Shop cam kết bảo hành link vĩnh viễn, hỏng link đổi link mới!',
      };
    }

    if (lower.includes('zalo') || lower.includes('nhân viên') || lower.includes('hotline') || lower.includes('sđt') || lower.includes('gọi')) {
      return {
        text: 'Dạ bạn có thể chat trực tiếp với chuyên viên qua Zalo 0583 953 426 (hỗ trợ 24/7, phản hồi trong 1-2 phút) để được tư vấn cụ thể và gửi link test thử nhé!',
        actionLink: {
          label: '💬 Mở Zalo 0583 953 426 ngay',
          url: 'https://zalo.me/0583953426',
        },
      };
    }

    if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('khuyến mãi') || lower.includes('sale')) {
      return {
        text: 'Khóa học lẻ tại shop đang Flash Sale đồng giá chỉ từ 49k - 149k/khóa. Bạn có thể gõ tên khóa học vào ô tìm kiếm hoặc vào mục "Khám phá khóa học" để xem danh sách hơn 290+ khóa học thực tế nhé!',
        actionLink: {
          label: '🔍 Xem kho khóa học',
          url: '/mua',
        },
      };
    }

    // Default polite acknowledgment
    return {
      text: 'Cảm ơn bạn đã nhắn tin! Tin nhắn của bạn đã được chuyển trực tiếp đến Quản trị viên của shop.\n\nShop đang online và sẽ phản hồi cho bạn trong giây lát!',
      actionLink: {
        label: '💬 Chat nhanh Zalo nếu cần gấp',
        url: 'https://zalo.me/0583953426',
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || !session) return;

    // Send user message through shared store
    chatStore.sendUserMessage(session.sessionId, text);
    if (!textToSend) setInputValue('');

    // Reload messages
    const updated = chatStore.getSession(session.sessionId);
    if (updated) {
      setMessages([...updated.messages]);
    }

    // Trigger intelligent automated bot reply & record it so Admin sees it too
    const botReply = generateBotReply(text);
    if (botReply) {
      setIsTyping(true);
      setTimeout(() => {
        chatStore.sendAdminReply(session.sessionId, botReply.text, 'Trợ lý Hỗ trợ Shop');
        const refreshed = chatStore.getSession(session.sessionId);
        if (refreshed) {
          setMessages([...refreshed.messages]);
        }
        setIsTyping(false);
      }, 700);
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('khgh_current_user_session_id');
    }
    const newSess = chatStore.getOrCreateUserSession();
    setSession(newSess);
    setMessages(newSess.messages);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-h-[580px] h-[520px] bg-[#0E121F] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#171E36] to-[#12162A] p-3.5 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Headphones size={20} />
            </div>
            {/* Online Green Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0E121F] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white leading-tight">Chat Với Shop</h3>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Admin Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {session?.userName ? `Đang kết nối: ${session.userName}` : 'Tư vấn khóa học & nạp tiền 24/7'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleResetSession}
            title="Bắt đầu phiên chat mới"
            className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={onClose}
            title="Đóng chat"
            className="p-1.5 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isShop = msg.sender === 'shop';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isShop ? 'justify-start' : 'justify-end'}`}
            >
              {isShop && (
                <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 shadow-md whitespace-pre-line leading-relaxed ${
                  isShop
                    ? 'bg-[#181F33] text-slate-200 border border-slate-800/80 rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-medium rounded-tr-sm'
                }`}
              >
                {/* Sender badge if shop */}
                {isShop && msg.senderName && (
                  <div className="text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>{msg.senderName}</span>
                  </div>
                )}

                <p>{msg.text}</p>

                {msg.actionLink && (
                  <a
                    href={msg.actionLink.url}
                    target={msg.actionLink.url.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-transform hover:scale-[1.02] shadow-sm ${
                      isShop
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <span>{msg.actionLink.label}</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                <div
                  className={`text-[9px] mt-1.5 ${
                    isShop ? 'text-slate-500' : 'text-slate-800 font-semibold'
                  } text-right`}
                >
                  {msg.time}
                </div>
              </div>

              {!isShop && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserIcon size={14} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Bot size={15} />
            </div>
            <div className="bg-[#181F33] px-3.5 py-2 rounded-2xl rounded-tl-sm border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-1.5 bg-[#0A0D17] border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.query)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 text-slate-300 text-[11px] font-medium transition-colors flex-shrink-0 border border-slate-700/60"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#111626] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Nhập câu hỏi cần tư vấn..."
          className="flex-1 bg-[#0A0D17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim()}
          className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
          title="Gửi tin nhắn"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
