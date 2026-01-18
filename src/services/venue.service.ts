// src/services/venue.service.ts
import { apiClient } from '@/lib/api-client';
import { Venue, Category, Product, MainButton } from '@/types/api';

export const VenueService = {
  // Получить информацию о заведении
  getVenue: async (slug: string, tableId?: number) => {
    return apiClient<Venue>(`/venues/${slug}/`, {
      params: { tableId },
    });
  },

  // Получить категории
  getCategories: async (venueSlug: string, sectionId?: number) => {
    return apiClient<Category[]>('/v2/categories/', {
      params: { venueSlug, sectionId },
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

  getCategoriesBySection: async (venueSlug: string, sectionId: string) => {
    return apiClient<Category[]>('/v2/categories/', {
      params: {
        venueSlug,
        sectionId: Number(sectionId), // API требует число
      },
      next: { revalidate: 300 }, // Кэшируем на 5 минут
    });
  },

  getAllProducts: async (venueSlug: string) => {
    return apiClient<Product[]>('v2/products/', {
      params: { venueSlug },
      next: { revalidate: 300 }, // Кэш на 5 минут
    });
  },

  getAllCategories: async (venueSlug: string) => {
    return apiClient<Category[]>('/v2/categories/', {
      params: { venueSlug },
      next: { revalidate: 300 },
    });
  },
};
