import { useAuthStore, getAccessTokenSnapshot } from '@/store/auth';
import { useClientStore } from '@/store/client';
import { refreshAuth, AuthApiError } from './auth';

/**
 * fetch с автоматическим Bearer и одиночным retry после /auth/refresh/.
 *
 * Используется для эндпоинтов, требующих авторизованного клиента:
 *  - GET/PATCH /clients/me/
 *  - CRUD /clients/me/addresses/
 *  - GET /client/bonus/transactions/
 *
 * Гостевой флоу (POST /orders/ с code/hash) идёт мимо — там Bearer
 * опционален и навешивается явно в createOrderApi.
 */

let refreshPromise: Promise<string | null> | null = null;

/** Параллельные 401-запросы не должны делать N refresh-запросов. */
async function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const result = await refreshAuth();
        useAuthStore.getState().setSession({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        });
        return result.accessToken;
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 401) {
          if (useClientStore.getState().phone) {
            useAuthStore.getState().setSoftLoggedOut();
          }
          useAuthStore.getState().clear();
        }
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export interface AuthedFetchInit extends RequestInit {
  /** Если true и нет токена — не пытаться вообще запрос делать, кинуть 401. */
  requireAuth?: boolean;
}

export async function authedFetch(
  input: string,
  init: AuthedFetchInit = {},
): Promise<Response> {
  const { requireAuth, headers: rawHeaders, ...rest } = init;
  let token = getAccessTokenSnapshot();

  if (!token && requireAuth) {
    throw new AuthApiError('not_authenticated', 401);
  }

  const buildHeaders = (t: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(rawHeaders as Record<string, string> | undefined),
  });

  let res = await fetch(input, {
    ...rest,
    headers: buildHeaders(token),
  });

  if (res.status !== 401) return res;

  // 401 → один раз пробуем refresh.
  const newToken = await refreshOnce();
  if (!newToken) return res;

  token = newToken;
  res = await fetch(input, {
    ...rest,
    headers: buildHeaders(token),
  });
  return res;
}
