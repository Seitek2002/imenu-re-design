import { create } from 'zustand';

interface BonusState {
  isBonusUsed: boolean;
  bonusAmount: number;
  toggleBonus: () => void;
  setBonusUsed: (value: boolean) => void;
  setBonusAmount: (value: number) => void;
  resetBonus: () => void;
}

export const useBonusStore = create<BonusState>((set) => ({
  isBonusUsed: false,
  bonusAmount: 0,
  toggleBonus: () => set((state) => ({ isBonusUsed: !state.isBonusUsed })),
  setBonusUsed: (value) => set({ isBonusUsed: value }),
  setBonusAmount: (value) => set({ bonusAmount: Math.max(0, Math.floor(value)) }),
  resetBonus: () => set({ isBonusUsed: false, bonusAmount: 0 }),
}));
