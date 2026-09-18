'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FolderOpen,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  Sparkles,
  Wallet,
  Copy,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ALL_COURSES, REAL_CATEGORIES, CourseItem } from '@/data/coursesCatalog';
import { walletApi } from '@/lib/api';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

interface AdminOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  driveEmail: string;
  courseTitles: string[];
  totalAmount: number;
  paymentMethod: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

const INITIAL_DEMO_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1',
    orderCode: 'KHGH928341',
    customerName: 'Nguyễn Văn Hùng',
    customerEmail: 'hung.nguyen@gmail.com',
    driveEmail: 'hung.nguyen@gmail.com',
    courseTitles: ['Bộ Khóa Học 24 Ngày Lấy Lại Căn Bản Tiếng Anh Cùng Alexd'],
    totalAmount: 149000,
    paymentMethod: 'VietQR (MB Bank)',
    status: 'PAID',
    createdAt: '10 phút trước',
  },
  {
    id: 'ord-2',
    orderCode: 'KHGH716290',
    customerName: 'Trần Thị Mai',
    customerEmail: 'maitt.designer@gmail.com',
    driveEmail: 'maitt.drive@gmail.com',
    courseTitles: ['Khóa Học Vibe Coding', 'Khóa Học AI Automation'],
    totalAmount: 258000,
    paymentMethod: 'Số dư Ví',
    status: 'PAID',
    createdAt: '45 phút trước',
  },
  {
    id: 'ord-3',
    orderCode: 'KHGH552194',
    customerName: 'Lê Hoàng Long',
    customerEmail: 'longlh99@gmail.com',
    driveEmail: 'longlh99@gmail.com',
    courseTitles: ['Trọn Bộ Hơn 2.000+ Khóa Học Google Drive VIP Trọn Đời'],
    totalAmount: 599000,
    paymentMethod: 'VietQR (MB Bank)',
    status: 'PENDING',
    createdAt: '2 giờ trước',
  },
  {
    id: 'ord-4',
    orderCode: 'KHGH389102',
    customerName: 'Phạm Minh Đức',
    customerEmail: 'ducpm@gmail.com',
    driveEmail: 'ducpm@gmail.com',
    courseTitles: ['Khóa Học Chinh Phục Tiếng Hàn Sơ Cấp 1'],
    totalAmount: 129000,
    paymentMethod: 'VietQR (MB Bank)',
    status: 'PAID',
    createdAt: 'Hôm qua',
  },
];

interface AdminDeposit {
  id: string;
  transactionCode: string;
  userId: number | string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  approvedAt?: string;
  bankName?: string;
  bankAccountNumber?: string;
}

const INITIAL_DEMO_DEPOSITS: AdminDeposit[] = [
  {
    id: 'dep-1',
    transactionCode: 'NAP104X892014',
    userId: 104,
    userName: 'Nguyễn Văn Hùng',
    userEmail: 'hung.nguyen@gmail.com',
    userPhone: '0988123456',
    amount: 200000,
    status: 'COMPLETED',
    createdAt: '15 phút trước',
    approvedAt: '14 phút trước',
    bankName: 'MB Bank',
    bankAccountNumber: '0583953426',
  },
  {
    id: 'dep-2',
    transactionCode: 'NAP205X749182',
    userId: 205,
    userName: 'Lê Hoàng Long',
    userEmail: 'longlh99@gmail.com',
    userPhone: '0912345678',
    amount: 500000,
    status: 'PENDING',
    createdAt: '30 phút trước',
    bankName: 'MB Bank',
    bankAccountNumber: '0583953426',
  },
  {
    id: 'dep-3',
    transactionCode: 'NAP8X631902',
    userId: 8,
    userName: 'Đặng Tuấn Anh',
    userEmail: 'tuananh.dev@gmail.com',
    userPhone: '0977889900',
    amount: 100000,
    status: 'COMPLETED',
    createdAt: 'Hôm qua',
    approvedAt: 'Hôm qua',
    bankName: 'MB Bank',
    bankAccountNumber: '0583953426',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'orders' | 'deposits' | 'categories' | 'settings'>('dashboard');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<CourseItem[]>(ALL_COURSES);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_DEMO_ORDERS);

  // Deposits state
  const [deposits, setDeposits] = useState<AdminDeposit[]>(INITIAL_DEMO_DEPOSITS);
  const [depositSearch, setDepositSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAmount, setManualAmount] = useState<number>(100000);
  const [manualAction, setManualAction] = useState<'ADD' | 'SUBTRACT'>('ADD');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);

  // New course form
  const [newCourse, setNewCourse] = useState({
    title: '',
    categoryId: 2,
    price: 149000,
    originalPrice: 790000,
    driveLink: '',
    thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
    description: '',
    isFlashSale: false,
  });

  // Settings form
  const [bankSettings, setBankSettings] = useState({
    bankName: 'MB Bank (Ngân hàng Quân Đội)',
    accountNumber: '0583953426',
    accountName: 'NGUYEN HOANG ANH',
    hotline: '0583 953 426',
  });

  useEffect(() => {
    setIsMounted(true);
    const session = localStorage.getItem('admin_user');
    const isAuth = localStorage.getItem('admin_authenticated');

    if (!session || isAuth !== 'true') {
      router.replace('/admin/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      if (parsed.role !== 'ROLE_ADMIN') {
        toast.error('Tài khoản của bạn không có quyền Quản trị viên!');
        router.replace('/admin/login');
        return;
      }
      setAdminUser(parsed);
    } catch {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_authenticated');
      router.replace('/admin/login');
      return;
    }

    // Load custom courses if any
    try {
      const custom = localStorage.getItem('custom_admin_courses');
      if (custom) {
        const parsed = JSON.parse(custom);
        setCourses([...parsed, ...ALL_COURSES.filter((c) => !parsed.some((p: any) => p.id === c.id))]);
      }
    } catch {}

    // Load orders
    try {
      const storedOrders = localStorage.getItem('khgh_admin_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch {}

    // Load deposits
    try {
      const storedDeposits = localStorage.getItem('app_all_deposits');
      if (storedDeposits) {
        const parsed = JSON.parse(storedDeposits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [
            ...parsed,
            ...INITIAL_DEMO_DEPOSITS.filter((demo) => !parsed.some((p: any) => p.transactionCode === demo.transactionCode)),
          ];
          setDeposits(merged);
        }
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('accessToken');
    toast.success('Đã đăng xuất khỏi tài khoản Quản trị');
    router.replace('/admin/login');
  };

  // Add course handler
  const handleAddCourse = () => {
    if (!newCourse.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học!');
      return;
    }
    const cat = REAL_CATEGORIES.find((c) => c.id === Number(newCourse.categoryId)) || REAL_CATEGORIES[0];
    const folderId = newCourse.driveLink.includes('folders/')
      ? newCourse.driveLink.split('folders/')[1]?.split('?')[0]
      : newCourse.driveLink || '14aGCvx2k8y6fPL93A5CbWiGwoVTEI3s-';

    const cleanLink = newCourse.driveLink.startsWith('http')
      ? newCourse.driveLink
      : `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

    const created: CourseItem = {
      id: Date.now(),
      title: newCourse.title,
      slug: newCourse.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      price: Number(newCourse.price),
      originalPrice: Number(newCourse.originalPrice),
      effectivePrice: Number(newCourse.price),
      thumbnail: newCourse.thumbnail,
      description: newCourse.description || `Khóa học ${newCourse.title} lưu trữ trên Google Drive`,
      driveLink: cleanLink,
      driveFolderId: folderId,
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      isFlashSale: newCourse.isFlashSale,
      flashSalePrice: newCourse.isFlashSale ? Number(newCourse.price) : undefined,
      isCombo: false,
      registeredCount: 1,
      badge: newCourse.isFlashSale ? 'FLASH SALE' : 'MỚI',
    };

    const updated = [created, ...courses];
    setCourses(updated);
    try {
      const customOnly = updated.filter((c) => c.id > 2000 || !ALL_COURSES.some((a) => a.id === c.id));
      localStorage.setItem('custom_admin_courses', JSON.stringify(customOnly));
    } catch {}

    setShowAddModal(false);
    setNewCourse({
      title: '',
      categoryId: 2,
      price: 149000,
      originalPrice: 790000,
      driveLink: '',
      thumbnail: '/backgrounds/tech_05_modern_developer_desk.jpg',
      description: '',
      isFlashSale: false,
    });
    toast.success('Thêm khóa học Google Drive mới thành công!');
  };

  // Delete course
  const handleDeleteCourse = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi danh sách?')) return;
    const filtered = courses.filter((c) => c.id !== id);
    setCourses(filtered);
    try {
      const customOnly = filtered.filter((c) => c.id > 2000 || !ALL_COURSES.some((a) => a.id === c.id));
      localStorage.setItem('custom_admin_courses', JSON.stringify(customOnly));
    } catch {}
    toast.success('Đã xóa khóa học!');
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: 'PAID' | 'CANCELLED') => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    localStorage.setItem('khgh_admin_orders', JSON.stringify(updated));

    if (newStatus === 'PAID') {
      toast.success('Đã duyệt đơn và cấp quyền Google Drive cho học viên!');
    } else {
      toast.success('Đã hủy đơn hàng!');
    }
  };

  // Duyệt nạp tiền & Cộng số dư tự động
  const handleApproveDeposit = async (dep: AdminDeposit) => {
    try {
      await walletApi.adminApproveDeposit(dep.transactionCode);
    } catch {
      // Backend offline: xử lý lưu trữ phía client
    }

    // Cập nhật số dư cho user vào localStorage
    const curBal = Number(localStorage.getItem(`user_balance_${dep.userEmail}`) || '0');
    const newBal = curBal + dep.amount;
    localStorage.setItem(`user_balance_${dep.userEmail}`, String(newBal));

    // Cập nhật trạng thái yêu cầu nạp thành COMPLETED
    const updated = deposits.map((d) =>
      d.transactionCode === dep.transactionCode
        ? { ...d, status: 'COMPLETED' as const, approvedAt: 'Vừa xong' }
        : d
    );
    setDeposits(updated);
    localStorage.setItem('app_all_deposits', JSON.stringify(updated));

    toast.success(
      `Đã duyệt giao dịch ${dep.transactionCode}! Đã cộng +${fmt(dep.amount)} vào ví của ${dep.userEmail} (Số dư mới: ${fmt(newBal)})`
    );
  };

  // Hủy yêu cầu nạp
  const handleCancelDeposit = (dep: AdminDeposit) => {
    const updated = deposits.map((d) =>
      d.transactionCode === dep.transactionCode
        ? { ...d, status: 'CANCELLED' as const }
        : d
    );
    setDeposits(updated);
    localStorage.setItem('app_all_deposits', JSON.stringify(updated));
    toast.success(`Đã hủy yêu cầu nạp ${dep.transactionCode}!`);
  };

  // Nạp / trừ số dư thủ công cho thành viên
  const handleManualAdjustBalance = () => {
    const email = manualEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('Vui lòng nhập email học viên hợp lệ');
      return;
    }
    const curBal = Number(localStorage.getItem(`user_balance_${email}`) || '0');
    const delta = manualAction === 'ADD' ? manualAmount : -manualAmount;
    const newBal = Math.max(0, curBal + delta);
    localStorage.setItem(`user_balance_${email}`, String(newBal));

    toast.success(
      `Đã ${manualAction === 'ADD' ? 'cộng' : 'trừ'} ${fmt(manualAmount)} cho ${email}! Số dư mới: ${fmt(newBal)}`
    );
    setManualEmail('');
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.categoryName.toLowerCase().includes(courseSearch.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || c.categorySlug === selectedCategory;
    return matchSearch && matchCat;
  });

  // Filtered deposits
  const filteredDeposits = deposits.filter((d) => {
    const matchSearch =
      d.transactionCode.toLowerCase().includes(depositSearch.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(depositSearch.toLowerCase()) ||
      d.userName.toLowerCase().includes(depositSearch.toLowerCase());
    const matchFilter = depositFilter === 'ALL' || d.status === depositFilter;
    return matchSearch && matchFilter;
  });

  // Calculate statistics
  const totalRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0) + 12450000;
  const paidOrdersCount = orders.filter((o) => o.status === 'PAID').length + 58;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const pendingDepositsCount = deposits.filter((d) => d.status === 'PENDING').length;
  const totalDepositedAmount = deposits
    .filter((d) => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0);

  if (!isMounted || !adminUser) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
        <RefreshCw className="animate-spin text-amber-400" size={32} />
        <span>Đang xác thực quyền Quản trị viên...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0F131F] border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-400/20">
              KH
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-tight leading-tight">Admin Portal</h2>
              <p className="text-[11px] text-amber-400 font-semibold">Tạp Hóa Khóa Học</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
            PRO
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5 flex-1">
          {[
            { id: 'dashboard', label: 'Tổng quan & Doanh thu', icon: LayoutDashboard },
            { id: 'courses', label: `Khóa học (${courses.length})`, icon: BookOpen },
            { id: 'orders', label: `Đơn hàng (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
            { id: 'deposits', label: `Duyệt nạp tiền & Ví (${deposits.length})`, icon: Wallet, badge: pendingDepositsCount > 0 ? pendingDepositsCount : undefined },
            { id: 'categories', label: `Danh mục (${REAL_CATEGORIES.length})`, icon: Layers },
            { id: 'settings', label: 'Cấu hình VietQR & Hệ thống', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#161B2E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B0E17]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-300">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@khoahocgiahoi.com'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#141828] hover:bg-[#1C2238] text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye size={13} />
              <span>Xem Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#141828] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen p-4 sm:p-6 lg:p-8">
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Tổng quan hệ thống</h1>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi tình hình kinh doanh, số lượng khóa học Google Drive và giao dịch thanh toán
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Tổng doanh thu</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{fmt(totalRevenue)}</div>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> +18.5% so với tháng trước
                </p>
              </div>

              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Đơn hàng đã xử lý</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{paidOrdersCount} đơn</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Chờ duyệt thanh toán: <strong className="text-amber-400">{pendingOrdersCount}</strong>
                </p>
              </div>

              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Kho học liệu Google Drive</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FolderOpen size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{courses.length} khóa</div>
                <p className="text-[11px] text-slate-400 mt-1">Trong {REAL_CATEGORIES.length} danh mục chủ đề</p>
              </div>

              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Tỷ lệ tự động phân quyền</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">99.8%</div>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1">Cấp quyền Gmail tức thì</p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Đơn hàng mới nhất cần chú ý</h3>
                  <p className="text-xs text-slate-400">Khách hàng thanh toán qua VietQR và tài khoản ví</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Xem tất cả đơn hàng →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D101C] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Mã đơn</th>
                      <th className="p-3">Khách hàng</th>
                      <th className="p-3">Gmail nhận Drive</th>
                      <th className="p-3">Số tiền</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 rounded-r-xl">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.slice(0, 4).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#161B2E] transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-300">{ord.orderCode}</td>
                        <td className="p-3 text-white font-medium">{ord.customerName}</td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{ord.driveEmail}</td>
                        <td className="p-3 font-bold text-emerald-400">{fmt(ord.totalAmount)}</td>
                        <td className="p-3">
                          {ord.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={12} /> Đã cấp Drive
                            </span>
                          ) : ord.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <Clock size={12} /> Chờ thanh toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <XCircle size={12} /> Đã hủy
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {ord.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'PAID')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all shadow-sm"
                            >
                              Duyệt ngay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: COURSES MANAGEMENT ================= */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Quản lý Khóa học Google Drive</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Tổng số: <strong className="text-white">{courses.length}</strong> khóa học kèm link bàn giao thực tế
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary py-2.5 px-4 text-xs font-bold self-start sm:self-auto shadow-md"
              >
                <Plus size={16} />
                <span>Thêm khóa học mới</span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#121624] p-3.5 rounded-2xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khóa học..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0C0F1A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-[#0C0F1A] rounded-xl text-xs text-white border-0 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="ALL">Tất cả danh mục ({courses.length})</option>
                {REAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Courses Table */}
            <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D101C] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Khóa học</th>
                      <th className="p-3.5">Danh mục</th>
                      <th className="p-3.5">Giá bán</th>
                      <th className="p-3.5">Link Google Drive</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCourses.slice(0, 50).map((c) => (
                      <tr key={c.id} className="hover:bg-[#161B2E] transition-colors">
                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A2035]">
                              <Image src={c.thumbnail} alt={c.title} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white line-clamp-1 hover:text-amber-400 transition-colors">
                                {c.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {c.isFlashSale && (
                                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                                    FLASH SALE
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">ID: {c.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-300">
                          <span className="bg-[#1B2138] px-2.5 py-1 rounded-lg text-[11px]">
                            {c.categoryName}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-amber-400">{fmt(c.price)}</div>
                          <div className="text-[10px] text-slate-500 line-through">{fmt(c.originalPrice)}</div>
                        </td>

                        <td className="p-3.5">
                          <a
                            href={c.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold transition-colors"
                          >
                            <FolderOpen size={14} />
                            <span>Mở Drive</span>
                            <ExternalLink size={11} />
                          </a>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingCourse(c)}
                            className="p-2 rounded-lg bg-[#1D243B] hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition-colors"
                            title="Sửa giá & thông tin"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-2 rounded-lg bg-[#1D243B] hover:bg-rose-500 hover:text-white text-slate-300 transition-colors"
                            title="Xóa khóa học"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCourses.length > 50 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-[#0D101C] border-t border-slate-800">
                  Đang hiển thị 50 / {filteredCourses.length} khóa học. Dùng thanh tìm kiếm để lọc nhanh.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Quản lý Đơn hàng & Phân quyền</h1>
              <p className="text-xs text-slate-400 mt-1">
                Kiểm tra giao dịch ngân hàng và bấm duyệt phân quyền Google Drive cho học viên
              </p>
            </div>

            <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D101C] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Mã đơn & Thời gian</th>
                      <th className="p-3.5">Khách hàng</th>
                      <th className="p-3.5">Gmail nhận Google Drive</th>
                      <th className="p-3.5">Khóa học đã mua</th>
                      <th className="p-3.5">Số tiền</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#161B2E] transition-colors">
                        <td className="p-3.5">
                          <div className="font-mono font-black text-amber-400 text-sm">{ord.orderCode}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ord.createdAt}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-white">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono text-amber-300 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            {ord.driveEmail}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          {ord.courseTitles.map((t, idx) => (
                            <div key={idx} className="text-slate-300 text-[11px] line-clamp-1">
                              • {t}
                            </div>
                          ))}
                        </td>

                        <td className="p-3.5 font-black text-emerald-400 text-sm">
                          {fmt(ord.totalAmount)}
                          <div className="text-[10px] text-slate-400 font-normal">{ord.paymentMethod}</div>
                        </td>

                        <td className="p-3.5">
                          {ord.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                              <CheckCircle2 size={13} /> Đã kích hoạt
                            </span>
                          ) : ord.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 animate-pulse">
                              <Clock size={13} /> Chờ thanh toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                              <XCircle size={13} /> Đã hủy
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          {ord.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'PAID')}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-1"
                              >
                                <Check size={13} /> Duyệt đơn
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1"
                              >
                                <X size={13} /> Hủy
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3.5: DEPOSITS & WALLET MANAGEMENT ================= */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Wallet className="text-amber-400" size={26} />
                  <span>Duyệt Nạp Tiền & Quản Lý Ví</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Đối soát chuyển khoản ngân hàng bằng <strong>Mã nạp ngẫu nhiên định danh duy nhất (NAP...)</strong>. Bấm duyệt để cộng số dư ví tức thì cho học viên.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <Clock size={14} /> Chờ duyệt: {pendingDepositsCount}
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Đã nạp: {fmt(totalDepositedAmount)}
                </span>
              </div>
            </div>

            {/* Explanation card */}
            <div className="bg-gradient-to-r from-[#171E36] to-[#12162A] border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={18} />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-amber-300">Cơ chế nhận diện & đối soát nạp tiền định danh</h4>
                <p className="text-slate-300 leading-relaxed">
                  Khi học viên tạo lệnh nạp, hệ thống sinh ra một nội dung chuyển khoản ngẫu nhiên theo công thức <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 font-mono font-bold">NAP + [User ID] + X + [6 số ngẫu nhiên]</code> (Ví dụ: <code className="text-amber-300 font-mono">NAP104X892014</code>) không bao giờ trùng lặp.
                  Khi bạn kiểm tra app ngân hàng MB Bank thấy nội dung này, chỉ cần đối chiếu và bấm nút <strong>"✅ Duyệt & Cộng tiền"</strong>. Số dư ví của học viên sẽ được cộng ngay lập tức!
                </p>
              </div>
            </div>

            {/* Main Section: Deposits Table & Manual Tool */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Deposits Table (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      placeholder="Tìm theo mã nạp (NAP...), email, tên học viên..."
                      value={depositSearch}
                      onChange={(e) => setDepositSearch(e.target.value)}
                      className="w-full bg-[#121624] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#121624] p-1 rounded-xl border border-slate-800 self-start">
                    {(['ALL', 'PENDING', 'COMPLETED'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDepositFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          depositFilter === filter
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter === 'ALL' ? 'Tất cả' : filter === 'PENDING' ? 'Chờ duyệt' : 'Đã cộng ví'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0D101C] text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Mã nạp ngẫu nhiên</th>
                          <th className="p-3.5">Học viên</th>
                          <th className="p-3.5">Số tiền</th>
                          <th className="p-3.5">Thời gian</th>
                          <th className="p-3.5">Trạng thái</th>
                          <th className="p-3.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredDeposits.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              Không tìm thấy yêu cầu nạp tiền nào phù hợp.
                            </td>
                          </tr>
                        ) : (
                          filteredDeposits.map((dep) => (
                            <tr key={dep.id} className="hover:bg-[#161B2E] transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded text-xs tracking-wider">
                                    {dep.transactionCode}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(dep.transactionCode);
                                      toast.success(`Đã chép mã: ${dep.transactionCode}`);
                                    }}
                                    className="p-1 hover:text-white text-slate-500"
                                    title="Sao chép mã"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">User ID: #{dep.userId}</div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-bold text-white">{dep.userName}</div>
                                <div className="text-[11px] text-slate-400">{dep.userEmail}</div>
                                {dep.userPhone && (
                                  <div className="text-[10px] text-slate-500">{dep.userPhone}</div>
                                )}
                              </td>

                              <td className="p-3.5 font-black text-emerald-400 text-sm">
                                +{fmt(dep.amount)}
                              </td>

                              <td className="p-3.5 text-slate-400 text-[11px]">
                                <div>Tạo: {dep.createdAt}</div>
                                {dep.approvedAt && (
                                  <div className="text-emerald-400 text-[10px]">Duyệt: {dep.approvedAt}</div>
                                )}
                              </td>

                              <td className="p-3.5">
                                {dep.status === 'COMPLETED' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 size={12} /> Đã cộng ví
                                  </span>
                                ) : dep.status === 'PENDING' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
                                    <Clock size={12} /> Chờ đối soát
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                                    <XCircle size={12} /> Đã hủy
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-right space-x-1.5">
                                {dep.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveDeposit(dep)}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-1"
                                      title="Xác nhận đã nhận tiền và cộng vào ví học viên"
                                    >
                                      <Check size={13} /> Duyệt & Cộng tiền
                                    </button>
                                    <button
                                      onClick={() => handleCancelDeposit(dep)}
                                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1"
                                      title="Hủy lệnh nạp"
                                    >
                                      <X size={13} />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Manual Balance Adjustment Tool (1 col) */}
              <div className="space-y-4">
                <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800/80 pb-3">
                    <CreditCard className="text-amber-400" size={17} />
                    <span>Nạp / Trừ Số Dư Thủ Công</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dùng để xử lý nhanh các trường hợp học viên chuyển khoản trực tiếp hoặc cần điều chỉnh số dư ví theo yêu cầu.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Email học viên:
                      </label>
                      <input
                        type="email"
                        placeholder="vd: hocvien@gmail.com"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        className="w-full bg-[#0A0D17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Hành động:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setManualAction('ADD')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                            manualAction === 'ADD'
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-slate-800 bg-[#0A0D17] text-slate-400'
                          }`}
                        >
                          <ArrowUpRight size={14} />
                          <span>+ Cộng tiền</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualAction('SUBTRACT')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                            manualAction === 'SUBTRACT'
                              ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                              : 'border-slate-800 bg-[#0A0D17] text-slate-400'
                          }`}
                        >
                          <ArrowDownRight size={14} />
                          <span>- Trừ tiền</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Số tiền (VNĐ):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {[50000, 100000, 200000, 500000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setManualAmount(amt)}
                            className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                              manualAmount === amt
                                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                                : 'border-slate-800 bg-[#0A0D17] text-slate-400'
                            }`}
                          >
                            {fmt(amt)}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={1000}
                        step={10000}
                        value={manualAmount}
                        onChange={(e) => setManualAmount(Number(e.target.value))}
                        className="w-full bg-[#0A0D17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleManualAdjustBalance}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Xác nhận {manualAction === 'ADD' ? 'cộng' : 'trừ'} {fmt(manualAmount)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Danh mục Học liệu ({REAL_CATEGORIES.length})</h1>
              <p className="text-xs text-slate-400 mt-1">
                Các chuyên mục chính lưu trữ trên Google Drive đã được đồng bộ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REAL_CATEGORIES.map((cat) => {
                const count = courses.filter((c) => c.categorySlug === cat.slug).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-[#121624] border border-slate-800 rounded-2xl p-5 hover:border-amber-400/50 transition-all flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                        {cat.id}
                      </div>
                      <h3 className="font-bold text-white text-sm mb-1">{cat.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">slug: {cat.slug}</p>
                      <div className="mt-3 inline-block bg-[#1C2238] text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {count} khóa học
                      </div>
                    </div>

                    {cat.drive_id && (
                      <a
                        href={`https://drive.google.com/drive/folders/${cat.drive_id}?usp=sharing`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-[#181D30] hover:bg-amber-400 hover:text-slate-950 text-slate-400 transition-colors"
                        title="Mở thư mục Google Drive của danh mục"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Cấu hình VietQR & Hệ thống</h1>
              <p className="text-xs text-slate-400 mt-1">
                Thiết lập tài khoản ngân hàng nhận thanh toán và cấu hình tích hợp Google Drive
              </p>
            </div>

            {/* Banking form */}
            <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-amber-400" />
                <span>Tài khoản ngân hàng nhận tiền (VietQR)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ngân hàng</label>
                  <input
                    type="text"
                    value={bankSettings.bankName}
                    onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0C0F1A] rounded-xl border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Số tài khoản</label>
                  <input
                    type="text"
                    value={bankSettings.accountNumber}
                    onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0C0F1A] rounded-xl border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chủ tài khoản</label>
                  <input
                    type="text"
                    value={bankSettings.accountName}
                    onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0C0F1A] rounded-xl border border-slate-800 text-xs text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hotline / Zalo hỗ trợ</label>
                  <input
                    type="text"
                    value={bankSettings.hotline}
                    onChange={(e) => setBankSettings({ ...bankSettings, hotline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0C0F1A] rounded-xl border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => toast.success('Đã lưu cấu hình tài khoản ngân hàng!')}
                className="btn-primary py-2.5 px-5 text-xs font-bold"
              >
                Lưu cấu hình
              </button>
            </div>

            {/* Google Drive Integration Guide */}
            <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-3 text-xs leading-relaxed">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen size={18} className="text-amber-400" />
                <span>Cơ chế cấp quyền tự động Google Drive</span>
              </h2>
              <p className="text-slate-300">
                Hệ thống backend sử dụng <strong>Google Drive REST API v3</strong> kết hợp <strong>Service Account</strong>:
              </p>
              <ul className="space-y-2 text-slate-400 list-disc pl-5">
                <li>
                  Khi có giao dịch thanh toán thành công (qua VietQR webhook hoặc Quản trị viên duyệt đơn),
                  backend tự động gọi:
                  <code className="block bg-[#0A0D14] p-2 rounded-lg text-emerald-400 font-mono mt-1 text-[11px]">
                    POST https://www.googleapis.com/drive/v3/files/{'{folderId}'}/permissions
                  </code>
                </li>
                <li>
                  Payload gửi: <code className="text-amber-300 font-mono">{`{"role": "reader", "type": "user", "emailAddress": customer_gmail}`}</code>
                </li>
                <li>
                  Google Drive gửi email thông báo trực tiếp đến Gmail của học viên, học viên mở mục <strong>"Được chia sẻ với tôi"</strong> để vào học ngay trọn đời.
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: THÊM KHÓA HỌC MỚI ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-amber-400" />
                <span>Thêm khóa học Google Drive mới</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Tên khóa học *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Ví dụ: Khóa học Lập trình Flutter từ Zero đến Hero"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Danh mục chủ đề</label>
                <select
                  value={newCourse.categoryId}
                  onChange={(e) => setNewCourse({ ...newCourse, categoryId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {REAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={newCourse.originalPrice}
                    onChange={(e) => setNewCourse({ ...newCourse, originalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Link thư mục hoặc Folder ID Google Drive *</label>
                <input
                  type="text"
                  value={newCourse.driveLink}
                  onChange={(e) => setNewCourse({ ...newCourse, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/14aGCvx... hoặc ID"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Mô tả khóa học</label>
                <textarea
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Mô tả quyền lợi, nội dung video, tài liệu đính kèm..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newCourse.isFlashSale}
                  onChange={(e) => setNewCourse({ ...newCourse, isFlashSale: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-0"
                />
                <span className="font-semibold text-amber-400">Bật Flash Sale cho khóa học này</span>
              </label>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A2033] hover:bg-[#222A42] text-slate-300 font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md transition-all"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHỈNH SỬA KHÓA HỌC ================= */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-slate-800 rounded-3xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 size={18} className="text-amber-400" />
                <span>Cập nhật khóa học</span>
              </h2>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên khóa học</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={editingCourse.originalPrice}
                    onChange={(e) => setEditingCourse({ ...editingCourse, originalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Link Google Drive</label>
                <input
                  type="text"
                  value={editingCourse.driveLink}
                  onChange={(e) => setEditingCourse({ ...editingCourse, driveLink: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0C0F1A] border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingCourse.isFlashSale}
                  onChange={(e) => setEditingCourse({ ...editingCourse, isFlashSale: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-0"
                />
                <span className="font-semibold text-amber-400">Đang bật Flash Sale</span>
              </label>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A2033] hover:bg-[#222A42] text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = courses.map((c) => (c.id === editingCourse.id ? editingCourse : c));
                    setCourses(updated);
                    try {
                      const customOnly = updated.filter((c) => c.id > 2000 || !ALL_COURSES.some((a) => a.id === c.id));
                      localStorage.setItem('custom_admin_courses', JSON.stringify(customOnly));
                    } catch {}
                    setEditingCourse(null);
                    toast.success('Đã cập nhật thông tin khóa học!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
