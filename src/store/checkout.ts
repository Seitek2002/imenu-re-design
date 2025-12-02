import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { isTabletRoutePath } from '@/lib/utils/slug';

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

  // Delivery details (persisted)
  deliveryStreet: string;
  setDeliveryStreet: (v: string) => void;
  deliveryEntrance: string;
  setDeliveryEntrance: (v: string) => void;
  deliveryFloor: string;
  setDeliveryFloor: (v: string) => void;
  deliveryApartment: string;
  setDeliveryApartment: (v: string) => void;

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

        deliveryStreet: '',
        setDeliveryStreet: (v) => set({ deliveryStreet: v }),
        deliveryEntrance: '',
        setDeliveryEntrance: (v) => set({ deliveryEntrance: v }),
        deliveryFloor: '',
        setDeliveryFloor: (v) => set({ deliveryFloor: v }),
        deliveryApartment: '',
        setDeliveryApartment: (v) => set({ deliveryApartment: v }),

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
        // Персистим только бизнес-состояние.
        // В режиме планшета НЕ сохраняем телефон, адрес и слоты времени (pickupMode/pickupTime).
        partialize: (s) => {
          const base: any = {
            orderType: s.orderType,
            selectedSpotId: s.selectedSpotId,
            deliveryStreet: s.deliveryStreet,
            deliveryEntrance: s.deliveryEntrance,
            deliveryFloor: s.deliveryFloor,
            deliveryApartment: s.deliveryApartment,
          };
          const isTabletRoute =
            typeof window !== 'undefined' && isTabletRoutePath(window.location?.pathname);
          if (!isTabletRoute) {
            base.pickupMode = s.pickupMode;
            base.pickupTime = s.pickupTime;
            base.phone = s.phone;
            base.address = s.address;
          }
          return base;
        },
        // При гидратации в режиме планшета — сбрасываем чувствительные поля и форсим dine-in
        onRehydrateStorage: () => (state, _error) => {
          if (typeof window === 'undefined') return;
          if (!state) return;
          const isTabletRoute =
            typeof window !== 'undefined' && isTabletRoutePath(window.location?.pathname);
          if (isTabletRoute) {
            try {
              state.setPhone('+996');
              state.setAddress('');
              state.setPickupMode('asap');
              state.setPickupTime(null);
              state.setOrderType('dinein');
            } catch {}
          }
        },
      }
    ),
    { name: 'checkout' }
  )
);
