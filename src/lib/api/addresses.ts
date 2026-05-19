import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_V2_URL } from '../config';
import { authedFetch } from './authed-fetch';
import { AuthApiError } from './auth';
import { readSnakeJson, snakeJsonBody } from './case';
import { useAuthStore } from '@/store/auth';

/**
 * CRUD /api/v2/clients/me/addresses/ — Bearer.
 *
 * Контракт Kuma 2026-05-19 (project_auth_profile_contract §3).
 * Поля бэка snake_case; конвертируем через case.ts.
 *
 * Лимит 10 адресов на клиента (400 при превышении). При `isDefault=true`
 * бэк сам снимает default у остальных — никакой клиентской синхронизации.
 */

export interface MyAddress {
  id: number;
  label: string;
  address: string;
  /** decimal-string, не округлять */
  latitude: string;
  /** decimal-string, не округлять */
  longitude: string;
  entrance: string | null;
  apartment: string | null;
  floor: string | null;
  intercom: string | null;
  comment: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyAddressCreate {
  label: string;
  address: string;
  latitude: string;
  longitude: string;
  entrance?: string | null;
  apartment?: string | null;
  floor?: string | null;
  intercom?: string | null;
  comment?: string | null;
  isDefault?: boolean;
}

export type MyAddressUpdate = Partial<MyAddressCreate>;

const QK = ['addresses', 'me'] as const;

async function parseError(res: Response): Promise<AuthApiError> {
  let data: Record<string, unknown> | undefined;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // не JSON
  }
  const detail =
    (data && typeof data.detail === 'string' && data.detail) ||
    `addresses_failed_${res.status}`;
  return new AuthApiError(detail, res.status, data);
}

export async function listMyAddresses(): Promise<MyAddress[]> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/addresses/`, {
    method: 'GET',
    requireAuth: true,
  });
  if (!res.ok) throw await parseError(res);
  const data = await readSnakeJson<MyAddress[] | { results: MyAddress[] }>(res);
  return Array.isArray(data) ? data : data.results;
}

export async function createMyAddress(
  body: MyAddressCreate,
): Promise<MyAddress> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/addresses/`, {
    method: 'POST',
    requireAuth: true,
    body: snakeJsonBody(body),
  });
  if (!res.ok) throw await parseError(res);
  return readSnakeJson<MyAddress>(res);
}

export async function updateMyAddress(
  id: number,
  body: MyAddressUpdate,
): Promise<MyAddress> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/addresses/${id}/`, {
    method: 'PATCH',
    requireAuth: true,
    body: snakeJsonBody(body),
  });
  if (!res.ok) throw await parseError(res);
  return readSnakeJson<MyAddress>(res);
}

export async function deleteMyAddress(id: number): Promise<void> {
  const res = await authedFetch(`${API_V2_URL}/clients/me/addresses/${id}/`, {
    method: 'DELETE',
    requireAuth: true,
  });
  if (!res.ok && res.status !== 204) throw await parseError(res);
}

export function useMyAddresses() {
  const hasToken = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: QK,
    queryFn: listMyAddresses,
    enabled: hasToken,
    staleTime: 1000 * 60,
  });
}

export function useCreateMyAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMyAddress,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateMyAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; patch: MyAddressUpdate }) =>
      updateMyAddress(args.id, args.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteMyAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMyAddress,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
