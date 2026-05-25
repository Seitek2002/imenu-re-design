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
  /** Spot-level флаг доставки (контракт Kuma 2026-05-12). Если undefined — поле не пришло с бэка, считать "доступно". */
  isDeliveryAvailable?: boolean;
  /** Координаты точки. Decimal string ("42.875100"). */
  latitude?: string | null;
  longitude?: string | null;
  /** Радиус бесплатной доставки в км (decimal string), per-spot. */
  freeDeliveryRadiusKm?: string | null;
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
  /** Decimal string per swagger (e.g. "5.00"). Parse with parseFloat. */
  freeDeliveryRadiusKm?: string | null;
  /** ID точки по умолчанию для доставки (контракт Kuma 2026-05-12). */
  defaultDeliverySpot?: number | null;
  isTakeoutAvailable?: boolean;
  isDineinAvailable?: boolean;
  spots: VenueSpot[];
  schedules: VenueSchedule[];
  colorTheme?: string;
  isBonusSystemEnabled?: boolean;
  bonusAccrualPercent?: number;
  /**
   * Максимум % от суммы заказа, который клиент может оплатить бонусами.
   * Integer 0..100; дефолт 50. Kuma 2026-05-24 §4. Per-venue.
   */
  bonusMaxDeductiblePercent?: number;
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
        data: state.data,
        tableId: state.tableId,
        spotId: state.spotId,
        isKioskMode: state.isKioskMode,
        tableNumber: state.tableNumber,
        venueSlug: state.venueSlug,
      }),
    },
  ),
);
