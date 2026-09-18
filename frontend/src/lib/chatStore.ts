// Centralized Live Chat Store with Real-time Cross-Tab Sync via BroadcastChannel & LocalStorage

export interface ChatMessage {
  id: string;
  sender: 'user' | 'shop';
  senderName?: string;
  text: string;
  time: string;
  timestamp: number;
  imageUrl?: string;
  actionLink?: {
    label: string;
    url: string;
  };
}

export interface ChatSession {
  sessionId: string;
  userId?: number | string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  isOnline: boolean;
  createdAt: number;
  updatedAt: number;
  unreadAdminCount: number;
  unreadUserCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'khgh_chat_sessions';
const CHANNEL_NAME = 'khgh_live_chat_bus';

const INITIAL_DEMO_SESSIONS: ChatSession[] = [
  {
    sessionId: 'sess_demo_1',
    userName: 'Nguyễn Hoàng Nam',
    userEmail: 'nam.nguyen@gmail.com',
    userPhone: '0988123456',
    isOnline: true,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 600000,
    unreadAdminCount: 1,
    unreadUserCount: 0,
    lastMessage: 'Shop ơi cho mình hỏi combo 2.000 khóa học có được update thêm các khóa mới sau này không ạ?',
    lastMessageTime: '10 phút trước',
    messages: [
      {
        id: 'msg_d1_1',
        sender: 'shop',
        senderName: 'CSKH Khoahocgiahoi',
        text: 'Chào bạn Nam! 👋 Cảm ơn bạn đã quan tâm đến kho khóa học của shop.',
        time: '12 phút trước',
        timestamp: Date.now() - 720000,
      },
      {
        id: 'msg_d1_2',
        sender: 'user',
        senderName: 'Nguyễn Hoàng Nam',
        text: 'Shop ơi cho mình hỏi combo 2.000 khóa học có được update thêm các khóa mới sau này không ạ?',
        time: '10 phút trước',
        timestamp: Date.now() - 600000,
      },
    ],
  },
  {
    sessionId: 'sess_demo_2',
    userName: 'Trần Minh Đức',
    userEmail: 'duc.tm@gmail.com',
    userPhone: '0912345678',
    isOnline: false,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
    unreadAdminCount: 0,
    unreadUserCount: 0,
    lastMessage: 'Dạ mình đã nhận được quyền Google Drive rồi nhé shop, tài liệu rất đầy đủ và nét!',
    lastMessageTime: '30 phút trước',
    messages: [
      {
        id: 'msg_d2_1',
        sender: 'user',
        senderName: 'Trần Minh Đức',
        text: 'Mình vừa nạp tiền qua VietQR mã NAP104X892014, shop kiểm tra giúp mình nhé.',
        time: '35 phút trước',
        timestamp: Date.now() - 2100000,
      },
      {
        id: 'msg_d2_2',
        sender: 'shop',
        senderName: 'CSKH Khoahocgiahoi',
        text: 'Dạ shop đã xác nhận và cộng số dư ví cho bạn rồi ạ! Quyền Google Drive đã được cấp trực tiếp qua Gmail duc.tm@gmail.com nhé.',
        time: '32 phút trước',
        timestamp: Date.now() - 1920000,
      },
      {
        id: 'msg_d2_3',
        sender: 'user',
        senderName: 'Trần Minh Đức',
        text: 'Dạ mình đã nhận được quyền Google Drive rồi nhé shop, tài liệu rất đầy đủ và nét!',
        time: '30 phút trước',
        timestamp: Date.now() - 1800000,
      },
    ],
  },
  {
    sessionId: 'sess_demo_3',
    userName: 'Lê Thu Trang (Designer)',
    userEmail: 'trang.design@gmail.com',
    userPhone: '0977665544',
    isOnline: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    unreadAdminCount: 1,
    unreadUserCount: 0,
    lastMessage: 'Khóa Thiết kế UI/UX Figma có kèm file source .fig và template bài tập thực hành không shop?',
    lastMessageTime: '2 giờ trước',
    messages: [
      {
        id: 'msg_d3_1',
        sender: 'user',
        senderName: 'Lê Thu Trang',
        text: 'Khóa Thiết kế UI/UX Figma có kèm file source .fig và template bài tập thực hành không shop?',
        time: '2 giờ trước',
        timestamp: Date.now() - 7200000,
      },
    ],
  },
];

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    return new BroadcastChannel(CHANNEL_NAME);
  }
  return null;
}

export const chatStore = {
  getSessions(): ChatSession[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_SESSIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // Initialize with demo sessions
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SESSIONS));
    } catch {}
    return INITIAL_DEMO_SESSIONS;
  },

  saveSessions(sessions: ChatSession[]) {
    if (typeof window === 'undefined') return;
    try {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (storageErr) {
        // Quota exceeded: retain only the latest 10 messages with images in each session
        const sanitized = sessions.map((sess) => ({
          ...sess,
          messages: sess.messages.map((m, idx) => {
            if (idx < sess.messages.length - 10 && m.imageUrl && m.imageUrl.length > 500) {
              return { ...m, imageUrl: undefined };
            }
            return m;
          }),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }

      // Notify other tabs via custom DOM event & BroadcastChannel
      window.dispatchEvent(new Event('khgh_chat_updated'));
      const ch = getBroadcastChannel();
      if (ch) {
        ch.postMessage({ type: 'SESSIONS_UPDATED' });
        ch.close();
      }
    } catch {}
  },

  getSession(sessionId: string): ChatSession | undefined {
    const sessions = this.getSessions();
    return sessions.find((s) => s.sessionId === sessionId);
  },

  getOrCreateUserSession(user?: { name?: string; email?: string; phone?: string; id?: any }): ChatSession {
    const sessions = this.getSessions();

    // Check if user already has an active session in local storage
    let currentSessionId = '';
    if (typeof window !== 'undefined') {
      currentSessionId = localStorage.getItem('khgh_current_user_session_id') || '';
    }

    if (currentSessionId) {
      const existing = sessions.find((s) => s.sessionId === currentSessionId);
      if (existing) {
        // Update user info if logged in
        if (user?.name && existing.userName.startsWith('Khách #')) {
          existing.userName = user.name;
          if (user.email) existing.userEmail = user.email;
          if (user.phone) existing.userPhone = user.phone;
          if (user.id) existing.userId = user.id;
          this.saveSessions(sessions);
        }
        return existing;
      }
    }

    // Create a new session
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const newSessionId = `sess_${Date.now()}_${guestId}`;
    const newSession: ChatSession = {
      sessionId: newSessionId,
      userId: user?.id,
      userName: user?.name || `Khách #${guestId}`,
      userEmail: user?.email,
      userPhone: user?.phone,
      isOnline: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadAdminCount: 0,
      unreadUserCount: 0,
      lastMessage: 'Cuộc trò chuyện mới bắt đầu',
      lastMessageTime: 'Vừa xong',
      messages: [
        {
          id: `msg_welcome_1`,
          sender: 'shop',
          senderName: 'CSKH Khoahocgiahoi',
          text: 'Xin chào! 👋 Chào mừng bạn đến với Khoahocgiahoi.com.',
          time: 'Vừa xong',
          timestamp: Date.now(),
        },
        {
          id: `msg_welcome_2`,
          sender: 'shop',
          senderName: 'CSKH Khoahocgiahoi',
          text: 'Mình là hỗ trợ viên trực tuyến của shop. Bạn đang quan tâm đến khóa học nào, hướng dẫn nạp tiền hay kích hoạt Google Drive trọn đời ạ?',
          time: 'Vừa xong',
          timestamp: Date.now(),
        },
      ],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('khgh_current_user_session_id', newSessionId);
    }

    this.saveSessions([newSession, ...sessions]);
    return newSession;
  },

  sendUserMessage(
    sessionId: string,
    text: string,
    imageUrl?: string,
    actionLink?: { label: string; url: string }
  ): ChatMessage {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const displayText = text.trim() ? text : (imageUrl ? '📷 [Hình ảnh]' : '');

    const newMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      senderName: session?.userName || 'Khách hàng',
      text: displayText,
      imageUrl,
      time,
      timestamp: Date.now(),
      actionLink,
    };

    if (session) {
      session.messages.push(newMsg);
      session.lastMessage = displayText;
      session.lastMessageTime = 'Vừa xong';
      session.updatedAt = Date.now();
      session.unreadAdminCount += 1;
      session.isOnline = true;

      // Bump to top
      const others = sessions.filter((s) => s.sessionId !== sessionId);
      this.saveSessions([session, ...others]);
    }

    return newMsg;
  },

  sendAdminReply(
    sessionId: string,
    text: string,
    adminName = 'CSKH Khoahocgiahoi',
    imageUrl?: string
  ): ChatMessage | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (!session) return null;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const displayText = text.trim() ? text : (imageUrl ? '📷 [Hình ảnh]' : '');

    const newMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'shop',
      senderName: adminName,
      text: displayText,
      imageUrl,
      time,
      timestamp: Date.now(),
    };

    session.messages.push(newMsg);
    session.lastMessage = displayText;
    session.lastMessageTime = 'Vừa xong';
    session.updatedAt = Date.now();
    session.unreadUserCount += 1;

    // Move to top of conversations list
    const others = sessions.filter((s) => s.sessionId !== sessionId);
    this.saveSessions([session, ...others]);

    return newMsg;
  },

  markAsReadByAdmin(sessionId: string) {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session && session.unreadAdminCount > 0) {
      session.unreadAdminCount = 0;
      this.saveSessions(sessions);
    }
  },

  markAsReadByUser(sessionId: string) {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session && session.unreadUserCount > 0) {
      session.unreadUserCount = 0;
      this.saveSessions(sessions);
    }
  },

  deleteSession(sessionId: string) {
    const sessions = this.getSessions().filter((s) => s.sessionId !== sessionId);
    this.saveSessions(sessions);
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback();
      }
    };

    const handleCustom = () => {
      callback();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('khgh_chat_updated', handleCustom);

    let ch: BroadcastChannel | null = null;
    try {
      ch = getBroadcastChannel();
      if (ch) {
        ch.onmessage = () => {
          callback();
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('khgh_chat_updated', handleCustom);
      if (ch) ch.close();
    };
  },
};
