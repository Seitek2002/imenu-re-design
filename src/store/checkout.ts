import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CheckoutState {
  phone: string;
  countryId: string;
  userSelectedType: 'takeout' | 'delivery';
  setUserSelectedType: (type: 'takeout' | 'delivery') => void;
  address: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  needUtensils: boolean;
  comment: string;
  deliveryComment: string;
  pickupComment: string;
  setAddress: (address: string) => void;
  setPhone: (phone: string) => void;
  setCountryId: (id: string) => void;
  setDeliveryCoords: (lat: number | null, lng: number | null) => void;
  setNeedUtensils: (val: boolean) => void;
  setComment: (comment: string) => void;
  setDeliveryComment: (comment: string) => void;
  setPickupComment: (comment: string) => void;
  reset: () => void;
  resetOrderOptions: () => void;
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      phone: '',
      setPhone: (phone) => set({ phone }),
      countryId: 'KG',
      userSelectedType: 'takeout',
      setUserSelectedType: (userSelectedType) => set({ userSelectedType }),
      setCountryId: (countryId) => set({ countryId }),
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
      deliveryComment: '',
      setDeliveryComment: (deliveryComment) => set({ deliveryComment }),
      pickupComment: '',
      setPickupComment: (pickupComment) => set({ pickupComment }),
      reset: () =>
        set({
          phone: '',
          countryId: 'KG',
          address: '',
          deliveryLat: null,
          deliveryLng: null,
          needUtensils: false,
          comment: '',
          deliveryComment: '',
          pickupComment: '',
        }),
      resetOrderOptions: () =>
        set({
          needUtensils: false,
          comment: '',
          deliveryComment: '',
          pickupComment: '',
        }),
    }),
    {
      name: 'imenu-checkout-storage', // Ключ в localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
