import { create } from 'zustand';

// 🔥 1. Тип для графика работы (добавил)
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

  spots: VenueSpot[];

  // 🔥 2. Массив графиков (добавил)
  schedules: VenueSchedule[];

  colorTheme?: string;

  table?: {
    id: number;
    tableNum: string;
  };
}

interface VenueState {
  data: Venue | null;

  tableId: number | null;
  spotId: number | null;
  isKioskMode: boolean;
  tableNumber: string | null;

  setVenue: (venue: Venue) => void;
  setContext: (ctx: {
    tableId?: number;
    spotId?: number;
    isKioskMode?: boolean;
    tableNumber?: string;
  }) => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  data: null,
  tableId: null,
  spotId: null,
  isKioskMode: false,
  tableNumber: null,

  setVenue: (venue) => set({ data: venue }),

  setContext: ({ tableId, spotId, isKioskMode, tableNumber }) =>
    set((state) => ({
      tableId: tableId ?? state.tableId,
      spotId: spotId ?? state.spotId,
      isKioskMode: isKioskMode ?? state.isKioskMode,
      tableNumber: tableNumber ?? state.tableNumber,
    })),
}));
