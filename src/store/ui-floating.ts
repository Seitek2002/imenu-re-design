import { create } from 'zustand';

interface UiFloatingState {
  billBannerOpen: boolean;
  hasOpenBill: boolean;
  setBillBannerOpen: (open: boolean) => void;
  setHasOpenBill: (open: boolean) => void;
}

export const useUiFloatingStore = create<UiFloatingState>((set) => ({
  billBannerOpen: false,
  hasOpenBill: false,
  setBillBannerOpen: (open) => set({ billBannerOpen: open }),
  setHasOpenBill: (open) => set({ hasOpenBill: open }),
}));
