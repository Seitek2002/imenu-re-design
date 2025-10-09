/* TanStack Query setup for the provided OpenAPI endpoints.
   Only types + query functions/hooks (no UI usage here). */

'use client';

import {
  useQuery,
  UseQueryOptions,
  QueryKey,
  useMutation,
} from '@tanstack/react-query';
import type {
  Banner,
  Category,
  Product,
  Venue,
  OrderList,
  ListResponse,
} from './types';

const API_BASE = 'https://imenu.kg';

/* Basic JSON fetcher with query params support */
async function fetchJSON<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  init?: RequestInit
): Promise<T> {
  const u = new URL(url, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '')
        u.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(u.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} ${res.statusText} for ${u.toString()} ${
        text ? '- ' + text : ''
      }`
    );
  }
  // Some endpoints may respond with empty body (204/empty 200)
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    // @ts-expect-error allow unknown non-json
    return null;
  }
  return (await res.json()) as T;
}

/* Query Keys */
export const qk = {
  banners: (venueSlug?: string) => ['banners', venueSlug] as QueryKey,
  categories: (venueSlug?: string) => ['categories', venueSlug] as QueryKey,
  v2Categories: (params?: { venueSlug?: string; sectionId?: number }) =>
    ['v2-categories', params?.venueSlug ?? '', params?.sectionId ?? ''] as QueryKey,
  products: (opts?: { search?: string; spotId?: string; venueSlug?: string }) =>
    [
      'products',
      opts?.search ?? '',
      opts?.spotId ?? '',
      opts?.venueSlug ?? '',
    ] as QueryKey,
  venue: (slug: string) => ['venue', slug] as QueryKey,
  orders: (opts?: {
    phone?: string;
    spotId?: number;
    tableId?: number;
    venueSlug?: string;
  }) =>
    [
      'orders',
      opts?.phone ?? '',
      opts?.spotId ?? '',
      opts?.tableId ?? '',
      opts?.venueSlug ?? '',
    ] as QueryKey,
  mainButtons: (venueSlug: string) => ['main-buttons', venueSlug] as QueryKey,
  callWaiter: (tableId: number) => ['call-waiter', tableId] as QueryKey,
} as const;

/* Endpoints (typed) */

/** GET /api/banners/?venueSlug=... */
export function useBanners(
  venueSlug?: string,
  options?: Omit<UseQueryOptions<ListResponse<Banner>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListResponse<Banner>>({
    queryKey: qk.banners(venueSlug),
    queryFn: () =>
      fetchJSON<ListResponse<Banner>>('/api/banners/', { venueSlug }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/categories/?venueSlug=... */
export function useCategories(
  venueSlug?: string,
  options?: Omit<
    UseQueryOptions<ListResponse<Category>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ListResponse<Category>>({
    queryKey: qk.categories(venueSlug),
    queryFn: () =>
      fetchJSON<ListResponse<Category>>('/api/categories/', { venueSlug }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/v2/categories/?venueSlug=&sectionId= */
export function useCategoriesV2(
  params?: { venueSlug?: string; sectionId?: number },
  options?: Omit<
    UseQueryOptions<ListResponse<Category>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ListResponse<Category>>({
    queryKey: qk.v2Categories(params),
    queryFn: () =>
      fetchJSON<ListResponse<Category>>('/api/v2/categories/', {
        venueSlug: params?.venueSlug,
        sectionId: params?.sectionId,
      }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/products/?search=&spotId=&venueSlug= */
export function useProducts(
  params?: { search?: string; spotId?: string; venueSlug?: string },
  options?: Omit<UseQueryOptions<ListResponse<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListResponse<Product>>({
    queryKey: qk.products(params),
    queryFn: () =>
      fetchJSON<ListResponse<Product>>('/api/products/', {
        search: params?.search,
        spotId: params?.spotId,
        venueSlug: params?.venueSlug,
      }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/venues/{slug}/ */
export function useVenue(
  slug: string,
  options?: Omit<UseQueryOptions<Venue>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Venue>({
    queryKey: qk.venue(slug),
    queryFn: () => fetchJSON<Venue>(`/api/venues/${encodeURIComponent(slug)}/`),
    enabled: (options?.enabled ?? true) && !!slug,
    ...options,
  });
}

/** GET /api/orders/?phone=&spotId=&tableId=&venueSlug= */
export function useOrders(
  params?: {
    phone?: string;
    spotId?: number;
    tableId?: number;
    venueSlug?: string;
  },
  options?: Omit<
    UseQueryOptions<ListResponse<OrderList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ListResponse<OrderList>>({
    queryKey: qk.orders(params),
    queryFn: () =>
      fetchJSON<ListResponse<OrderList>>('/api/orders/', {
        phone: params?.phone,
        spotId: params?.spotId,
        tableId: params?.tableId,
        venueSlug: params?.venueSlug,
      }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/main-buttons/?venueSlug=... (schema unspecified) */
export type MainButtonsResponse = unknown;
export function useMainButtons(
  venueSlug: string,
  options?: Omit<UseQueryOptions<MainButtonsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MainButtonsResponse>({
    queryKey: qk.mainButtons(venueSlug),
    queryFn: () =>
      fetchJSON<MainButtonsResponse>('/api/main-buttons/', { venueSlug }),
    enabled: (options?.enabled ?? true) && !!venueSlug,
    ...options,
  });
}

/** GET /api/call-waiter/?tableId=... (returns unspecified object) */
export type CallWaiterResponse = unknown;
/* As this is an action, expose a mutation for clarity. */
export function useCallWaiter() {
  return useMutation<CallWaiterResponse, Error, { tableId: number }>({
    mutationKey: ['call-waiter'],
    mutationFn: ({ tableId }) =>
      fetchJSON<CallWaiterResponse>('/api/call-waiter/', { tableId }),
  });
}
