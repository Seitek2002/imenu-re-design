import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'takeout' | 'dinein' | 'delivery';

type CheckoutState = {
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
};

export const useCheckout = create<CheckoutState>()(
  devtools(
    persist(
      (set) => ({
        orderType: 'dinein',
        setOrderType: (t) => set({ orderType: t }),
      }),
      {
        name: 'checkout',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        partialize: (s) => ({ orderType: s.orderType }),
      }
    ),
    { name: 'checkout' }
  )
);
