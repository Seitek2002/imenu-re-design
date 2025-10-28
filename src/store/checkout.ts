import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'takeout' | 'dinein' | 'delivery';

type CheckoutState = {
  // Business
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;

  selectedSpotId: number | null;
  setSelectedSpotId: (id: number | null) => void;

  // Pickup time selection (нет данных с сервера — локальное состояние)
  // 'asap' — быстрее всего (40–55 минут); 'time' — пользователь выбрал конкретное время
  pickupMode: 'asap' | 'time';
  pickupTime: string | null; // формат 'HH:MM' (24h)
  setPickupMode: (m: 'asap' | 'time') => void;
  setPickupTime: (t: string | null) => void;

  // UI (не персистим)
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
};

export const useCheckout = create<CheckoutState>()(
  devtools(
    persist(
      (set) => ({
        // Business defaults
        orderType: 'dinein',
        setOrderType: (t) => set({ orderType: t }),

        selectedSpotId: null,
        setSelectedSpotId: (id) => set({ selectedSpotId: id }),

        pickupMode: 'asap',
        pickupTime: null,
        setPickupMode: (m) => set({ pickupMode: m }),
        setPickupTime: (t) => set({ pickupTime: t }),

        // UI
        sheetOpen: false,
        openSheet: () => set({ sheetOpen: true }),
        closeSheet: () => set({ sheetOpen: false }),
      }),
      {
        name: 'checkout',
        storage: createJSONStorage(() => localStorage),
        version: 4,
        // Персистим только бизнес-состояние
        partialize: (s) => ({
          orderType: s.orderType,
          selectedSpotId: s.selectedSpotId,
          pickupMode: s.pickupMode,
          pickupTime: s.pickupTime,
        }),
      }
    ),
    { name: 'checkout' }
  )
);
