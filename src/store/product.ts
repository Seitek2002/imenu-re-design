import { create } from 'zustand';
import { Product } from '@/types/api';

interface ProductState {
  selectedProduct: Product | null;
  setProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  selectedProduct: null,
  setProduct: (product) => set({ selectedProduct: product }),
}));