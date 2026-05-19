import { API_V2_URL } from '../config';

/**
 * Контракт Kuma от 2026-05-19 (см. `frontend-api-changes.md`).
 * Access token живёт в памяти (см. `useAuthStore`), refresh — в HttpOnly cookie
 * на path `/api/v2/auth/`, поэтому все эти запросы идут с credentials: 'include'.
 *
 * Поля бэка приходят в snake_case; мы конвертируем в camelCase один раз тут,
 * чтобы остальной фронт жил в едином стиле (см. project_auth_profile_contract).
 */

export interface AuthClient {
  id: number;
  phone: string;
  firstname: string | null;
  lastname: string | null;
  patronymic: string | null;
  email: string | null;
  birthday: string | null; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | null;
  locale: 'ru' | 'ky' | 'en' | null;
  tastes: string[];
  createdAt: string;
}

export interface OtpRequestResult {
  requestId: string;
  expiresIn: number;
  resendAfter: number;
  codeLength: number;
  channel: string;
}

export interface VerifyResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  client: AuthClient;
}

export interface RefreshResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/** Ошибка с распознанным `detail` от бэка и опц. данными. */
export class AuthApiError extends Error {
  constructor(
    public readonly detail: string,
    public readonly status: number,
    public readonly data?: Record<string, unknown>,
  ) {
    super(detail);
    this.name = 'AuthApiError';
  }
}

async function authFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_V2_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function parseError(res: Response): Promise<AuthApiError> {
  let data: Record<string, unknown> | undefined;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // не JSON — оставим detail из statusText
  }
  const detail =
    (data && typeof data.detail === 'string' && data.detail) ||
    res.statusText ||
    'request_failed';
  return new AuthApiError(detail, res.status, data);
}

function mapClient(raw: Record<string, unknown>): AuthClient {
  return {
    id: Number(raw.id),
    phone: String(raw.phone),
    firstname: (raw.firstname as string | null) ?? null,
    lastname: (raw.lastname as string | null) ?? null,
    patronymic: (raw.patronymic as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    birthday: (raw.birthday as string | null) ?? null,
    gender: (raw.gender as AuthClient['gender']) ?? null,
    locale: (raw.locale as AuthClient['locale']) ?? null,
    tastes: Array.isArray(raw.tastes) ? (raw.tastes as string[]) : [],
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  };
}

export async function requestOtp({
  phone,
  venueSlug,
}: {
  phone: string;
  venueSlug?: string;
}): Promise<OtpRequestResult> {
  const res = await authFetch('/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      ...(venueSlug ? { venue_slug: venueSlug } : {}),
    }),
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    requestId: String(data.requestId ?? data.request_id),
    expiresIn: Number(data.expiresIn ?? data.expires_in ?? 120),
    resendAfter: Number(data.resendAfter ?? data.resend_after ?? 60),
    codeLength: Number(data.codeLength ?? data.code_length ?? 4),
    channel: String(data.channel ?? 'sms'),
  };
}

export async function verifyOtp({
  requestId,
  phone,
  code,
}: {
  requestId: string;
  phone: string;
  code: string;
}): Promise<VerifyResult> {
  const res = await authFetch('/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({
      request_id: requestId,
      phone,
      code,
    }),
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    accessToken: String(data.accessToken ?? data.access_token),
    tokenType: String(data.tokenType ?? data.token_type ?? 'Bearer'),
    expiresIn: Number(data.expiresIn ?? data.expires_in ?? 3600),
    client: mapClient(data.client as Record<string, unknown>),
  };
}

/**
 * Использует HttpOnly cookie `client_refresh_token`. Кидает AuthApiError(401)
 * если cookie нет / отозван — вызывающий код должен почистить стор.
 */
export async function refreshAuth(): Promise<RefreshResult> {
  const res = await authFetch('/auth/refresh/', { method: 'POST' });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    accessToken: String(data.accessToken ?? data.access_token),
    tokenType: String(data.tokenType ?? data.token_type ?? 'Bearer'),
    expiresIn: Number(data.expiresIn ?? data.expires_in ?? 3600),
  };
}

export async function logoutAuth(): Promise<void> {
  // 204 — cookie очищается на бэке. Ошибки игнорируем, фронт всё равно чистит стор.
  await authFetch('/auth/logout/', { method: 'POST' }).catch(() => null);
}
