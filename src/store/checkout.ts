import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CheckoutState {
  phone: string;
  address: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  needUtensils: boolean;
  comment: string;
  setAddress: (address: string) => void;
  setPhone: (phone: string) => void;
  setDeliveryCoords: (lat: number | null, lng: number | null) => void;
  setNeedUtensils: (val: boolean) => void;
  setComment: (comment: string) => void;
  reset: () => void;
  resetOrderOptions: () => void;
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      phone: '',
      setPhone: (phone) => set({ phone }),
      address: '',
      setAddress: (address) => set({ address }),
      deliveryLat: null,
      deliveryLng: null,
      setDeliveryCoords: (lat, lng) =>
        set({ deliveryLat: lat, deliveryLng: lng }),
      needUtensils: false,
      setNeedUtensils: (needUtensils) => set({ needUtensils }),
      comment: '',
      setComment: (comment) => set({ comment }),
      reset: () =>
        set({
          phone: '',
          address: '',
          deliveryLat: null,
          deliveryLng: null,
          needUtensils: false,
          comment: '',
        }),
      resetOrderOptions: () => set({ needUtensils: false, comment: '' }),
    }),
    {
      name: 'imenu-checkout-storage', // Ключ в localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
