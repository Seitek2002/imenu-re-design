import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  searchQuery: string;
  headerTitleOverride: string | null;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setHeaderTitleOverride: (title: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  headerTitleOverride: null,
  setSearchOpen: (isOpen) =>
    set({ isSearchOpen: isOpen, searchQuery: isOpen ? '' : '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setHeaderTitleOverride: (title) => set({ headerTitleOverride: title }),
}));
