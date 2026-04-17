import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CheckoutState {
  phone: string;
  address: string;
  needUtensils: boolean;
  setAddress: (address: string) => void;
  setPhone: (phone: string) => void;
  setNeedUtensils: (val: boolean) => void;
  reset: () => void;
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      phone: '',
      setPhone: (phone) => set({ phone }),
      reset: () => set({ phone: '' }),
      address: '',
      setAddress: (address) => set({ address }),
      needUtensils: false,
      setNeedUtensils: (needUtensils) => set({ needUtensils }),
    }),
    {
      name: 'imenu-checkout-storage', // Ключ в localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
