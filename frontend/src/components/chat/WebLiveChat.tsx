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
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'shop' | 'user';
  text: string;
  time: string;
  actionLink?: {
    label: string;
    url: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'shop',
    text: 'Xin chào! 👋 Chào mừng bạn đến với Khoahocgiahoi.com.',
    time: 'Vừa xong',
  },
  {
    id: 'msg-2',
    sender: 'shop',
    text: 'Mình là hỗ trợ viên trực tuyến của shop. Bạn đang quan tâm đến khóa học nào, hướng dẫn nạp tiền hay kích hoạt Google Drive trọn đời ạ?',
    time: 'Vừa xong',
  },
];

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
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('web_live_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('web_live_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const generateBotReply = (userText: string): ChatMessage => {
    const lower = userText.toLowerCase();
    const time = getTimeString();

    if (lower.includes('nạp') || lower.includes('ví') || lower.includes('tiền') || lower.includes('stk') || lower.includes('ngân hàng')) {
      return {
        id: `shop-${Date.now()}`,
        sender: 'shop',
        text: 'Dạ để nạp tiền vào ví:\n1. Bạn vào trang "Ví & Tài Khoản" (hoặc bấm nút bên dưới).\n2. Chọn số tiền và bấm "Tạo Mã QR Nạp Tiền".\n3. Quét mã VietQR bằng App Ngân Hàng. Hệ thống sẽ tự tạo NỘI DUNG CHUYỂN KHOẢN NGẪU NHIÊN ĐỊNH DANH (VD: NAP104X829371) duy nhất cho bạn.\n4. Sau khi chuyển đúng nội dung đó, hệ thống sẽ nhận diện và tự động cộng số dư vào ví của bạn ngay!',
        time,
        actionLink: {
          label: '👉 Đến trang Nạp Tiền Vào Ví',
          url: '/tai-khoan',
        },
      };
    }

    if (lower.includes('combo') || lower.includes('2000') || lower.includes('trọn bộ') || lower.includes('vip')) {
      return {
        id: `shop-${Date.now()}`,
        sender: 'shop',
        text: '🔥 Trọn bộ COMBO 2.000+ Khóa Học Google Drive VIP đang được ưu đãi chỉ 599.000đ (tiết kiệm hơn 95%). Gồm đầy đủ tài liệu, video bài giảng, source code các ngành: Lập trình, AI, Marketing, Thiết kế, Ngoại ngữ, Kinh doanh... Sở hữu trọn đời và cập nhật liên tục!',
        time,
        actionLink: {
          label: '👉 Xem chi tiết Combo 2.000 Khóa',
          url: '/combo',
        },
      };
    }

    if (lower.includes('drive') || lower.includes('link') || lower.includes('bảo hành') || lower.includes('truy cập')) {
      return {
        id: `shop-${Date.now()}`,
        sender: 'shop',
        text: '✨ Sau khi thanh toán thành công, hệ thống sẽ tự động cấp quyền truy cập folder Google Drive trực tiếp vào Gmail bạn đã đăng ký. Bạn có thể xem online hoặc tải về máy trọn đời. Shop cam kết bảo hành link vĩnh viễn, hỏng link đổi link mới!',
        time,
      };
    }

    if (lower.includes('zalo') || lower.includes('nhân viên') || lower.includes('hotline') || lower.includes('sđt') || lower.includes('gọi')) {
      return {
        id: `shop-${Date.now()}`,
        sender: 'shop',
        text: 'Dạ bạn có thể chat trực tiếp với chuyên viên qua Zalo 0583 953 426 (hỗ trợ 24/7, phản hồi trong 1-2 phút) để được tư vấn cụ thể và gửi link test thử ạ!',
        time,
        actionLink: {
          label: '💬 Mở Zalo 0583 953 426 ngay',
          url: 'https://zalo.me/0583953426',
        },
      };
    }

    if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('khuyến mãi') || lower.includes('sale')) {
      return {
        id: `shop-${Date.now()}`,
        sender: 'shop',
        text: 'Khóa học lẻ tại shop đang Flash Sale đồng giá chỉ từ 49k - 149k/khóa. Bạn có thể gõ tên khóa học vào ô tìm kiếm hoặc vào mục "Khám phá khóa học" để xem danh sách hơn 290+ khóa học thực tế nhé!',
        time,
        actionLink: {
          label: '🔍 Xem kho khóa học',
          url: '/mua',
        },
      };
    }

    // Default response
    return {
      id: `shop-${Date.now()}`,
      sender: 'shop',
      text: 'Cảm ơn bạn đã nhắn tin! Shop đã nhận được câu hỏi của bạn.\n\nChuyên viên tư vấn đang xử lý. Nếu cần gấp, bạn có thể bấm vào nút Zalo bên dưới để được nhân viên hỗ trợ trực tiếp 24/7 nhé!',
      time,
      actionLink: {
        label: '💬 Chat trực tiếp Zalo với Admin',
        url: 'https://zalo.me/0583953426',
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate shop typing
    setIsTyping(true);
    setTimeout(() => {
      const reply = generateBotReply(text);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('web_live_chat_history');
    } catch {
      // ignore
    }
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
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Tư vấn khóa học & nạp tiền 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleClearHistory}
            title="Làm mới cuộc trò chuyện"
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
