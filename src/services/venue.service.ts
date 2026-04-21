// src/services/venue.service.ts
import { apiClient } from '@/lib/api-client';
import { Venue, Product, MainButton } from '@/types/api';

export const VenueService = {
  // Получить информацию о заведении
  getVenue: async (slug: string, tableId?: number) => {
    return apiClient<Venue>(`/venues/${slug}/`, {
      params: { tableId },
    });
  },

  // Получить товары
  getProducts: async (venueSlug: string, spotId?: string, search?: string) => {
    return apiClient<Product[]>('/v2/products/', {
      params: { venueSlug, spotId, search },
    });
  },

  getMainButtons: async (venueSlug: string) => {
    return apiClient<MainButton[][]>('/v2/main-buttons/', {
      params: { venueSlug },
    });
  },

  getAllProducts: async (venueSlug: string, spotId?: number | null) => {
    return apiClient<Product[]>('v2/products/', {
      params: { venueSlug, spotId: spotId ?? undefined },
      next: { revalidate: 300 }, // Кэш на 5 минут
    });
  },
};
