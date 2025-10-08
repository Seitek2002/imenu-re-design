import { Category } from '@/lib/api/types';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type CartState = {
  setCategories: (categories: Category[]) => void;
  categories: Category[];
};

export const useCart = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        categories: [],
        setCategories: (categories: Category[]) => set({ categories }),
      })),
      {
        name: 'categories',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ categories: state.categories }),
        version: 1,
      }
    ),
    { name: 'categories' }
  )
);
