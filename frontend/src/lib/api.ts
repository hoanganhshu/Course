import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: tự động đính kèm Access Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý 401 (token hết hạn)
apiClient.interceptors.response.use(
  (response) => response.data, // Tự unwrap .data
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/dang-nhap-dang-ky';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;

// ==================== AUTH ====================
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/me'),
};

// ==================== COURSES ====================
export const courseApi = {
  getList: (params: {
    page?: number;
    size?: number;
    keyword?: string;
    category?: string;
    sort?: string;
  }) => apiClient.get('/courses', { params }),

  getDetail: (slug: string) => apiClient.get(`/courses/${slug}`),
  getFlashSale: () => apiClient.get('/courses/flash-sale'),
  getBestSellers: () => apiClient.get('/courses/best-sellers'),
  getLatest: () => apiClient.get('/courses/latest'),
  search: (q: string) => apiClient.get('/courses/search', { params: { q, size: 8 } }),
};

// ==================== CATEGORIES ====================
export const categoryApi = {
  getTree: () => apiClient.get('/categories'),
};

// ==================== ORDERS ====================
export const orderApi = {
  checkout: (data: {
    courseIds: number[];
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    couponCode?: string;
  }) => apiClient.post('/orders/checkout', data),

  checkStatus: (orderCode: string) =>
    apiClient.get(`/orders/check-status/${orderCode}`),
};

// ==================== MY COURSES ====================
export const myCourseApi = {
  getAll: () => apiClient.get('/my-courses'),
  getDriveLink: (courseId: number) =>
    apiClient.get(`/my-courses/${courseId}/drive-link`),
};

// ==================== MEMBERSHIPS ====================
export const membershipApi = {
  getPlans: () => apiClient.get('/memberships'),
  claimCourse: (courseId: number) =>
    apiClient.post(`/memberships/claim-course/${courseId}`),
};

// ==================== FEEDBACKS ====================
export const feedbackApi = {
  getAll: () => apiClient.get('/feedbacks'),
};

// ==================== COUPON ====================
export const couponApi = {
  validate: (code: string) =>
    apiClient.post('/coupons/validate', { code }),
};
