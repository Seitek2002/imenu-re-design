import { Venue } from '@/lib/api/types';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type VenueState = {
  setVenue: (categories: Venue) => void;
  venue: Venue | {
    slug: string;
  };
};

export const useVenueQuery = create<VenueState>()(
  devtools(
    persist(
      immer((set, get) => ({
        venue: {
          slug: '',
        },
        setVenue: (venue: Venue) => set({ venue }),
      })),
      {
        name: 'venue',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ venue: state.venue }),
        version: 1,
      }
    ),
    { name: 'venue' }
  )
);
