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
  PaginatedResponse,
  Client,
  OrderCreate,
  MainButtonsResponse,
  OrderByIdResponse,
  OrderV2,
} from './types';

const API_BASE = 'https://imenu.kg';
import { isApiErrorDetail } from './types';

type UnknownObject = Record<string, unknown>;
export type ClientBonusResponse = UnknownObject;

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
      'Accept-Language':
        (typeof window !== 'undefined' &&
          (localStorage.getItem('lang') || 'ru')) ||
        'ru',
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
  v2Banners: (venueSlug?: string) => ['v2-banners', venueSlug] as QueryKey,

  categories: (venueSlug?: string) => ['categories', venueSlug] as QueryKey,
  v2Categories: (params?: { venueSlug?: string; sectionId?: number }) =>
    [
      'v2-categories',
      params?.venueSlug ?? '',
      params?.sectionId ?? '',
    ] as QueryKey,

  products: (opts?: { search?: string; spotId?: string; venueSlug?: string }) =>
    [
      'products',
      opts?.search ?? '',
      opts?.spotId ?? '',
      opts?.venueSlug ?? '',
    ] as QueryKey,
  v2Products: (opts?: {
    search?: string;
    spotId?: string | number;
    venueSlug?: string;
  }) =>
    [
      'v2-products',
      opts?.search ?? '',
      String(opts?.spotId ?? ''),
      opts?.venueSlug ?? '',
    ] as QueryKey,

  venue: (slug: string) => ['venue', slug] as QueryKey,
  v2Venue: (slug: string) => ['v2-venue', slug] as QueryKey,
  venueTable: (slug: string, tableId: string | number) =>
    ['venue-table', slug, String(tableId)] as QueryKey,
  v2VenueTable: (slug: string, tableId: string | number) =>
    ['v2-venue-table', slug, String(tableId)] as QueryKey,

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
  v2Orders: (opts?: {
    phone?: string;
    spotId?: number;
    tableId?: number;
    venueSlug?: string;
  }) =>
    [
      'v2-orders',
      opts?.phone ?? '',
      opts?.spotId ?? '',
      opts?.tableId ?? '',
      opts?.venueSlug ?? '',
    ] as QueryKey,
  v2OrderById: (id: string) => ['v2-order', id] as QueryKey,

  mainButtons: (venueSlug: string) => ['main-buttons', venueSlug] as QueryKey,
  v2MainButtons: (venueSlug: string) =>
    ['v2-main-buttons', venueSlug] as QueryKey,

  callWaiter: (tableId: number) => ['call-waiter', tableId] as QueryKey,
  v2CallWaiter: (tableId: number) => ['v2-call-waiter', tableId] as QueryKey,

  clientBonus: (phone?: string, venueSlug?: string) =>
    ['client-bonus', phone ?? '', venueSlug ?? ''] as QueryKey,
  v2ClientBonus: (phone?: string, venueSlug?: string) =>
    ['v2-client-bonus', phone ?? '', venueSlug ?? ''] as QueryKey,

  v2Client: (phoneNumber: string) => ['v2-client', phoneNumber] as QueryKey,
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

/** GET /api/v2/banners/?venueSlug=... */
export function useBannersV2(
  venueSlug?: string,
  options?: Omit<UseQueryOptions<ListResponse<Banner>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListResponse<Banner>>({
    queryKey: qk.v2Banners(venueSlug),
    queryFn: () =>
      fetchJSON<ListResponse<Banner>>('/api/v2/banners/', { venueSlug }),
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

/** GET /api/v2/products/?search=&spotId=&venueSlug= */
export function useProductsV2(
  params?: { search?: string; spotId?: string | number; venueSlug?: string },
  options?: Omit<UseQueryOptions<ListResponse<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ListResponse<Product>>({
    queryKey: qk.v2Products(params),
    queryFn: () =>
      fetchJSON<ListResponse<Product>>('/api/v2/products/', {
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

/** GET /api/v2/venues/{slug}/ */
export function useVenueV2(
  slug: string,
  options?: Omit<UseQueryOptions<Venue>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Venue>({
    queryKey: qk.v2Venue(slug),
    queryFn: () =>
      fetchJSON<Venue>(`/api/v2/venues/${encodeURIComponent(slug)}/`),
    enabled: (options?.enabled ?? true) && !!slug,
    ...options,
  });
}

/** GET /api/venues/{slug}/table/{tableId}/ */
export function useVenueTable(
  params: { slug: string; tableId: string | number },
  options?: Omit<UseQueryOptions<Venue>, 'queryKey' | 'queryFn'>
) {
  const { slug, tableId } = params;
  return useQuery<Venue>({
    queryKey: qk.venueTable(slug, tableId),
    queryFn: () =>
      fetchJSON<Venue>(
        `/api/venues/${encodeURIComponent(slug)}/table/${encodeURIComponent(
          String(tableId)
        )}/`
      ),
    enabled: (options?.enabled ?? true) && !!slug && !!tableId,
    ...options,
  });
}

/** GET /api/v2/venues/{slug}/?tableId=... */
export function useVenueTableV2(
  params: { slug: string; tableId: string | number },
  options?: Omit<UseQueryOptions<Venue>, 'queryKey' | 'queryFn'>
) {
  const { slug, tableId } = params;
  return useQuery<Venue>({
    queryKey: qk.v2VenueTable(slug, tableId),
    queryFn: () =>
      fetchJSON<Venue>(`/api/v2/venues/${encodeURIComponent(slug)}/`, {
        tableId: String(tableId),
      }),
    enabled: (options?.enabled ?? true) && !!slug && !!tableId,
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
    UseQueryOptions<PaginatedResponse<OrderList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<OrderList>>({
    queryKey: qk.orders(params),
    queryFn: () =>
      fetchJSON<PaginatedResponse<OrderList>>('/api/orders/', {
        phone: params?.phone,
        spotId: params?.spotId,
        tableId: params?.tableId,
        venueSlug: params?.venueSlug,
      }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/v2/orders/?phone=&spotId=&tableId=&venueSlug= */
export function useOrdersV2(
  params?: {
    phone?: string;
    spotId?: number;
    tableId?: number;
    venueSlug?: string;
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<OrderList>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<OrderList>>({
    queryKey: qk.v2Orders(params),
    queryFn: () =>
      fetchJSON<PaginatedResponse<OrderList>>('/api/v2/orders/', {
        phone: params?.phone,
        spotId: params?.spotId,
        tableId: params?.tableId,
        venueSlug: params?.venueSlug,
      }),
    enabled: options?.enabled ?? true,
    ...options,
  });
}

/** GET /api/v2/orders/{id}/ (safe union: success or ApiErrorDetail) */
async function fetchOrderByIdV2Safe(id: string): Promise<OrderByIdResponse> {
  const u = new URL(`/api/v2/orders/${id}/`, API_BASE);
  const res = await fetch(u.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language':
        (typeof window !== 'undefined' &&
          (localStorage.getItem('lang') || 'ru')) ||
        'ru',
    },
  });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    try {
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data && typeof (data as any).detail === 'string') {
          return data as OrderByIdResponse;
        }
      }
    } catch {}
    return { detail: `HTTP ${res.status} ${res.statusText}` };
  }
  if (!ct.includes('application/json')) {
    return { detail: 'Invalid content-type' };
  }
  return (await res.json()) as OrderByIdResponse;
}

export function useOrderByIdV2(
  id: string,
  options?: Omit<
    UseQueryOptions<OrderByIdResponse, Error, OrderV2 | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) {
  return useQuery<OrderByIdResponse, Error, OrderV2 | undefined>({
    queryKey: qk.v2OrderById(id),
    queryFn: () => fetchOrderByIdV2Safe(id),
    select: (r): OrderV2 | undefined =>
      isApiErrorDetail(r) ? undefined : (r as OrderV2),
    enabled: (options?.enabled ?? true) && !!id,
    ...options,
  });
}

/** POST /api/v2/orders/ */
export function useCreateOrderV2() {
  // Accept venueSlug to satisfy backend requirement (some environments expect venue_slug as query)
  return useMutation<
    OrderCreate,
    Error,
    { body: OrderCreate; venueSlug?: string }
  >({
    mutationKey: ['v2-create-order'],
    mutationFn: ({ body, venueSlug }) => {
      return fetchJSON<OrderCreate>('/api/v2/orders/', undefined, {
        method: 'POST',
        body: JSON.stringify({ ...body, venue_slug: venueSlug }),
      });
    },
  });
}

/** GET /api/main-buttons/?venueSlug=... (schema unspecified) */
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

/** GET /api/v2/main-buttons/?venueSlug=... (schema unspecified) */
export function useMainButtonsV2(
  venueSlug: string,
  options?: Omit<UseQueryOptions<MainButtonsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MainButtonsResponse>({
    queryKey: qk.v2MainButtons(venueSlug),
    queryFn: () =>
      fetchJSON<MainButtonsResponse>('/api/v2/main-buttons/', { venueSlug }),
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

/** GET /api/v2/call-waiter/?tableId=... (returns unspecified object) */
export function useCallWaiterV2() {
  return useMutation<CallWaiterResponse, Error, { tableId: number }>({
    mutationKey: ['v2-call-waiter'],
    mutationFn: ({ tableId }) =>
      fetchJSON<CallWaiterResponse>('/api/v2/call-waiter/', { tableId }),
  });
}

/** GET /api/client/bonus/?phone=&venueSlug= */
export function useClientBonus(
  params?: { phone?: string; venueSlug?: string },
  options?: Omit<UseQueryOptions<ClientBonusResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClientBonusResponse>({
    queryKey: qk.clientBonus(params?.phone, params?.venueSlug),
    queryFn: () =>
      fetchJSON<ClientBonusResponse>('/api/client/bonus/', {
        phone: params?.phone,
        venueSlug: params?.venueSlug,
      }),
    enabled:
      (options?.enabled ?? true) && !!params?.phone && !!params?.venueSlug,
    ...options,
  });
}

/** GET /api/v2/client/bonus/?phone=&venueSlug= */
export function useClientBonusV2(
  params?: { phone?: string; venueSlug?: string },
  options?: Omit<UseQueryOptions<ClientBonusResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClientBonusResponse>({
    queryKey: qk.v2ClientBonus(params?.phone, params?.venueSlug),
    queryFn: () =>
      fetchJSON<ClientBonusResponse>('/api/v2/client/bonus/', {
        phone: params?.phone,
        venueSlug: params?.venueSlug,
      }),
    enabled:
      (options?.enabled ?? true) && !!params?.phone && !!params?.venueSlug,
    ...options,
  });
}

/** GET /api/v2/clients/{phoneNumber}/ */
export function useClientV2(
  phoneNumber: string,
  options?: Omit<UseQueryOptions<Client>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Client>({
    queryKey: qk.v2Client(phoneNumber),
    queryFn: () =>
      fetchJSON<Client>(`/api/v2/clients/${encodeURIComponent(phoneNumber)}/`),
    enabled: (options?.enabled ?? true) && !!phoneNumber,
    ...options,
  });
}

/** PUT /api/v2/clients/{phoneNumber}/ */
export function useUpdateClientV2() {
  return useMutation<Client, Error, { phoneNumber: string; body: Client }>({
    mutationKey: ['v2-client-update'],
    mutationFn: ({ phoneNumber, body }) =>
      fetchJSON<Client>(
        `/api/v2/clients/${encodeURIComponent(phoneNumber)}/`,
        undefined,
        { method: 'PUT', body: JSON.stringify(body) }
      ),
  });
}

/** PATCH /api/v2/clients/{phoneNumber}/ */
export function usePatchClientV2() {
  return useMutation<
    Client,
    Error,
    { phoneNumber: string; body: Partial<Client> }
  >({
    mutationKey: ['v2-client-patch'],
    mutationFn: ({ phoneNumber, body }) =>
      fetchJSON<Client>(
        `/api/v2/clients/${encodeURIComponent(phoneNumber)}/`,
        undefined,
        { method: 'PATCH', body: JSON.stringify(body) }
      ),
  });
}
