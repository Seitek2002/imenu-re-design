import { create } from 'zustand';
import { Product } from '@/types/api';

interface VideoProductState {
  selectedProduct: Product | null;
  setProduct: (product: Product | null) => void;
}

export const useVideoProductStore = create<VideoProductState>((set) => ({
  selectedProduct: null,
  setProduct: (product) => set({ selectedProduct: product }),
}));
