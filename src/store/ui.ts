import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  searchQuery: string;
  headerTitleOverride: string | null;
  isHeaderCollapsed: boolean;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setHeaderTitleOverride: (title: string | null) => void;
  setHeaderCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  headerTitleOverride: null,
  isHeaderCollapsed: false,
  setSearchOpen: (isOpen) =>
    set({ isSearchOpen: isOpen, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setHeaderTitleOverride: (title) => set({ headerTitleOverride: title }),
  setHeaderCollapsed: (collapsed) => set({ isHeaderCollapsed: collapsed }),
}));
