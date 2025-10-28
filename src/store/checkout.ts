import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'takeout' | 'dinein' | 'delivery';

type CheckoutState = {
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;

  // UI: bottom sheet open state (not persisted)
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
};

export const useCheckout = create<CheckoutState>()(
  devtools(
    persist(
      (set) => ({
        orderType: 'dinein',
        setOrderType: (t) => set({ orderType: t }),

        sheetOpen: false,
        openSheet: () => set({ sheetOpen: true }),
        closeSheet: () => set({ sheetOpen: false }),
      }),
      {
        name: 'checkout',
        storage: createJSONStorage(() => localStorage),
        version: 2,
        // Persist only business state, not ephemeral UI
        partialize: (s) => ({ orderType: s.orderType }),
      }
    ),
    { name: 'checkout' }
  )
);
