import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ActiveOrderState {
  lastOrderId: string | number | null;
  setLastOrderId: (id: string | number | null) => void;
  clearLastOrder: () => void;
}

export const useActiveOrderStore = create<ActiveOrderState>()(
  persist(
    (set) => ({
      lastOrderId: null,
      setLastOrderId: (id) => set({ lastOrderId: id }),
      clearLastOrder: () => set({ lastOrderId: null }),
    }),
    {
      name: 'imenu-active-order',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
