import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  originalPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInCart(item.id)) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [] }),

      isInCart: (id) => get().items.some((i) => i.id === id),

      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'khgh-cart' }
  )
);

/**
 * Hook an toàn tuyệt đối với Hydration của Next.js (SSR).
 * Đảm bảo SSR và lần render đầu tiên trên Client giống hệt nhau,
 * sau khi mount mới cập nhật trạng thái giỏ hàng từ localStorage.
 */
export function useCart() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    isMounted: mounted,
    items: mounted ? items : [],
    cartCount: mounted ? items.length : 0,
    isInCart: (id: number) => (mounted ? items.some((i) => i.id === id) : false),
    addItem,
    removeItem,
    clearCart,
    total: () => (mounted ? items.reduce((sum, i) => sum + i.price, 0) : 0),
  };
}

