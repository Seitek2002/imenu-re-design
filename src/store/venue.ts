import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface VenueSchedule {
  dayOfWeek: number;
  dayName: string;
  workStart: string;
  workEnd: string;
  isDayOff: boolean;
  is24h: boolean;
}

export interface VenueSpot {
  id: number;
  name: string;
  address: string;
  wifiText?: string;
  wifiUrl?: string | null;
}

export interface Venue {
  id?: number;
  slug: string;
  companyName: string;
  logo?: string;
  deliveryFixedFee: string;
  deliveryFreeFrom: string | null;
  isDeliveryAvailable: boolean;
  latitude?: number | null;
  longitude?: number | null;
  deliveryRadiusKm?: number | null;
  spots: VenueSpot[];
  schedules: VenueSchedule[];
  colorTheme?: string;
  table?: {
    id: number;
    tableNum: string;
  };
}

// --- Стейт ---
interface VenueState {
  data: Venue | null;

  // Поля контекста (их мы будем сохранять)
  tableId: number | null;
  spotId: number | null;
  isKioskMode: boolean;
  tableNumber: string | null;
  venueSlug: string | null; // 🔥 Добавил, чтобы сверять заведение

  // Actions
  setVenue: (venue: Venue) => void;
  setContext: (ctx: {
    tableId?: number | null;
    spotId?: number | null;
    isKioskMode?: boolean;
    tableNumber?: string | null;
    venueSlug?: string | null;
  }) => void;
}

export const useVenueStore = create<VenueState>()(
  persist(
    (set) => ({
      data: null,
      tableId: null,
      spotId: null,
      isKioskMode: false,
      tableNumber: null,
      venueSlug: null,

      setVenue: (venue) => set({ data: venue }),

      setContext: (ctx) =>
        set((state) => ({
          ...state,
          ...ctx,
        })),
    }),
    {
      name: 'imenu-session-storage',
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        tableId: state.tableId,
        spotId: state.spotId,
        isKioskMode: state.isKioskMode,
        tableNumber: state.tableNumber,
        venueSlug: state.venueSlug,
      }),
    },
  ),
);
