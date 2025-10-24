import { Venue } from '@/lib/api/types';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type VenueState = {
  venue: Venue | { slug: string };
  tableId: string | number | null;
  tableNum: string | null;
  setVenue: (venue: Venue) => void;
  setTableInfo: (info: {
    tableId?: string | number | null;
    tableNum?: string | null;
  }) => void;
};

export const useVenueQuery = create<VenueState>()(
  devtools(
    persist(
      immer((set) => ({
        venue: { slug: '' },
        tableId: null,
        tableNum: null,
        setVenue: (venue: Venue) => set({ venue }),
        setTableInfo: (info) =>
          set((state) => {
            if ('tableId' in info) state.tableId = info.tableId ?? null;
            if ('tableNum' in info) state.tableNum = info.tableNum ?? null;
          }),
      })),
      {
        name: 'venue',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          venue: state.venue,
          tableId: state.tableId,
          tableNum: state.tableNum,
        }),
        version: 2,
      }
    ),
    { name: 'venue' }
  )
);
