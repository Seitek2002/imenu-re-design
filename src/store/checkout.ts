import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type OrderType = 'takeout' | 'dinein' | 'delivery';

type CheckoutState = {
  // Business
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;

  selectedSpotId: number | null;
  setSelectedSpotId: (id: number | null) => void;

  // Business: contact data
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;

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

  // UI feedback
  shakeKey: number;
  bumpShake: () => void;
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

        phone: '+996',
        setPhone: (v) => set({ phone: v }),
        address: '',
        setAddress: (v) => set({ address: v }),

        pickupMode: 'asap',
        pickupTime: null,
        setPickupMode: (m) => set({ pickupMode: m }),
        setPickupTime: (t) => set({ pickupTime: t }),

        // UI
        sheetOpen: false,
        openSheet: () => set({ sheetOpen: true }),
        closeSheet: () => set({ sheetOpen: false }),

        shakeKey: 0,
        bumpShake: () =>
          set((s) => ({ shakeKey: (s.shakeKey + 1) % Number.MAX_SAFE_INTEGER })),
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
          phone: s.phone,
          address: s.address,
        }),
      }
    ),
    { name: 'checkout' }
  )
);
