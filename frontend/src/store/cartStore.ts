import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
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
