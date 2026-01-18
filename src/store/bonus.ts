import { create } from 'zustand';

interface BonusState {
  isBonusUsed: boolean;
  toggleBonus: () => void;
  setBonusUsed: (value: boolean) => void;
  resetBonus: () => void;
}

export const useBonusStore = create<BonusState>((set) => ({
  isBonusUsed: false,
  toggleBonus: () => set((state) => ({ isBonusUsed: !state.isBonusUsed })),
  setBonusUsed: (value) => set({ isBonusUsed: value }),
  resetBonus: () => set({ isBonusUsed: false }),
}));
