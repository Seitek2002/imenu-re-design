// src/services/venue.service.ts
import { apiClient } from '@/lib/api-client';
import { Venue, Product, MainButton } from '@/types/api';
import type { Locale } from '@/lib/locale';

export const VenueService = {
  // Получить информацию о заведении
  getVenue: async (slug: string, tableId?: number, locale?: Locale) => {
    return apiClient<Venue>(`/venues/${slug}/`, {
      params: { tableId },
      locale,
    });
  },

  // Получить товары
  getProducts: async (
    venueSlug: string,
    spotId?: string,
    search?: string,
    locale?: Locale,
  ) => {
    return apiClient<Product[]>('/v2/products/', {
      params: { venueSlug, spotId, search },
      locale,
    });
  },

  getMainButtons: async (venueSlug: string, locale?: Locale) => {
    return apiClient<MainButton[][]>('/v2/main-buttons/', {
      params: { venueSlug },
      locale,
    });
  },

  getCategoriesBySection: async (
    venueSlug: string,
    sectionId: number,
    locale?: Locale,
  ) => {
    return apiClient<import('@/types/api').Category[]>('/v2/categories/', {
      params: { venueSlug, sectionId },
      locale,
    });
  },

  getAllProducts: async (
    venueSlug: string,
    spotId?: number | null,
    locale?: Locale,
    categoryIds?: number[] | null,
  ) => {
    const categories =
      categoryIds && categoryIds.length > 0 ? categoryIds : undefined;
    return apiClient<Product[]>('v2/products/', {
      params: { venueSlug, spotId: spotId ?? undefined, categories },
      locale,
    });
  },
};
