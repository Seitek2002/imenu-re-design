'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { useClientStore } from '@/store/client';
import { AuthApiError, refreshAuth } from '@/lib/api/auth';
import { fetchMyProfile } from '@/lib/api/me';

/**
 * При маунте тихо дёргает /auth/refresh/ — если HttpOnly cookie
 * `client_refresh_token` валиден, восстанавливаем сессию без UI.
 * 401 — нормально (гость), просто помечаем bootstrapped.
 *
 * Дополнительно: планирует следующий refresh за 60 сек до expiresAt,
 * чтобы у пользователя никогда не было «висящего» 401 в UI.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setSession = useAuthStore((s) => s.setSession);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const updateClient = useAuthStore((s) => s.updateClient);
  const clear = useAuthStore((s) => s.clear);
  const setSoftLoggedOut = useAuthStore((s) => s.setSoftLoggedOut);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const accessToken = useAuthStore((s) => s.accessToken);

  const bootstrapRan = useRef(false);

  // Bootstrap один раз — React StrictMode иначе вызовет дважды.
  useEffect(() => {
    if (bootstrapRan.current) return;
    bootstrapRan.current = true;

    (async () => {
      try {
        const result = await refreshAuth();
        setSession({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        });
        // /refresh/ не отдаёт client object — подтягиваем его сразу,
        // чтобы потребители стора (профиль, чекаут) увидели данные сразу.
        try {
          const client = await fetchMyProfile();
          updateClient(client);
        } catch (err) {
          if (!(err instanceof AuthApiError && err.status === 401)) {
            console.error('fetchMyProfile after refresh failed:', err);
          }
        }
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 401) {
          // 401 — cookie нет или истёк. Если в clientStore остался телефон от
          // прошлой сессии — это «soft logout»: фронт пометит флаг, чтобы
          // /profile предложил OTP с префиллом вместо чистого guest UX.
          if (useClientStore.getState().phone) {
            setSoftLoggedOut();
          }
        } else {
          console.error('Auth bootstrap failed:', err);
        }
      } finally {
        setBootstrapped();
      }
    })();
  }, [setSession, setBootstrapped, updateClient, setSoftLoggedOut]);

  // Авто-refresh за 60 сек до истечения access токена.
  useEffect(() => {
    if (!accessToken || !expiresAt) return;
    const msLeft = expiresAt - Date.now() - 60_000;
    if (msLeft <= 0) {
      // токен уже почти / уже истёк — refresh немедленно
      void doRefresh();
      return;
    }
    const t = window.setTimeout(doRefresh, msLeft);
    return () => window.clearTimeout(t);

    async function doRefresh() {
      try {
        const result = await refreshAuth();
        setSession({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        });
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 401) {
          if (useClientStore.getState().phone) {
            setSoftLoggedOut();
          }
          clear();
        }
      }
    }
  }, [accessToken, expiresAt, setSession, clear, setSoftLoggedOut]);

  return <>{children}</>;
}
