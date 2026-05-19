import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_V2_URL } from '../config';
import { authedFetch } from './authed-fetch';
import { AuthApiError, type AuthClient } from './auth';
import { useAuthStore } from '@/store/auth';
import type { Locale } from '../locale';

/**
 * GET/PATCH /api/v2/clients/me/ — Bearer.
 *
 * Контракт Kuma 2026-05-19, поля сверены со свагером 2026-05-20: всё camelCase
 * на проводе (бэк-middleware конвертирует snake↔camel прозрачно).
 *
 * Источник истины — useAuthStore.client. После любого PATCH здесь же
 * обновляем стор, чтобы все потребители (страница профиля, чекаут и т.п.)
 * увидели свежие данные без перезагрузки.
 */

export type Gender = 'male' | 'female' | 'other';

export interface MyProfilePatch {
  firstname?: string | null;
  lastname?: string | null;
  patronymic?: string | null;
  email?: string | null;
  /** YYYY-MM-DD; не в будущем, год ≥ 1900 (валидация на бэке). */
  birthday?: string | null;
  gender?: Gender | null;
  locale?: Locale | null;
  /** max 20 элементов × ≤32 символов каждый (валидация на бэке). */
  tastes?: string[];
}

export async function fetchMyProfile(): Promise<AuthClient> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/`, {
    method: 'GET',
    requireAuth: true,
  });
  if (!res.ok) throw new AuthApiError(`me_failed_${res.status}`, res.status);
  return (await res.json()) as AuthClient;
}

export async function updateMyProfile(
  patch: MyProfilePatch,
): Promise<AuthClient> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/`, {
    method: 'PATCH',
    requireAuth: true,
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    let data: Record<string, unknown> | undefined;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      // не JSON — оставим как есть
    }
    const detail =
      (data && typeof data.detail === 'string' && data.detail) ||
      `me_patch_failed_${res.status}`;
    throw new AuthApiError(detail, res.status, data);
  }
  return (await res.json()) as AuthClient;
}

const ME_KEY = ['me'] as const;

export function useMe() {
  const hasToken = useAuthStore((s) => !!s.accessToken);
  const setClient = useAuthStore((s) => s.updateClient);
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      const client = await fetchMyProfile();
      setClient(client);
      return client;
    },
    enabled: hasToken,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const setClient = useAuthStore((s) => s.updateClient);
  return useMutation({
    mutationFn: (patch: MyProfilePatch) => updateMyProfile(patch),
    onSuccess: (client) => {
      setClient(client);
      qc.setQueryData(ME_KEY, client);
    },
  });
}
