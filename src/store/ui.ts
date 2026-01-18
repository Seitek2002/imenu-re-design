import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  setSearchOpen: (isOpen) =>
    set({ isSearchOpen: isOpen, searchQuery: isOpen ? '' : '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
