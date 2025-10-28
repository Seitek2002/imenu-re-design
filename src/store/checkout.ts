import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'takeout' | 'dinein' | 'delivery';

type CheckoutState = {
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;

  // Business: selected spot (persisted)
  selectedSpotId: number | null;
  setSelectedSpotId: (id: number | null) => void;

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

        selectedSpotId: null,
        setSelectedSpotId: (id) => set({ selectedSpotId: id }),

        sheetOpen: false,
        openSheet: () => set({ sheetOpen: true }),
        closeSheet: () => set({ sheetOpen: false }),
      }),
      {
        name: 'checkout',
        storage: createJSONStorage(() => localStorage),
        version: 3,
        // Persist only business state, not ephemeral UI
        partialize: (s) => ({ orderType: s.orderType, selectedSpotId: s.selectedSpotId }),
      }
    ),
    { name: 'checkout' }
  )
);
