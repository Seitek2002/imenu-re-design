'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { AuthApiError, refreshAuth } from '@/lib/api/auth';

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
  const clear = useAuthStore((s) => s.clear);
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
        // client object не отдаётся в /refresh/ — подтянется при первом
        // запросе /auth/me/ или /clients/me/, см. AuthProvider-потребителей.
      } catch (err) {
        if (err instanceof AuthApiError && err.status === 401) {
          // нормально для гостей — cookie нет или истёк
        } else {
          console.error('Auth bootstrap failed:', err);
        }
      } finally {
        setBootstrapped();
      }
    })();
  }, [setSession, setBootstrapped]);

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
          clear();
        }
      }
    }
  }, [accessToken, expiresAt, setSession, clear]);

  return <>{children}</>;
}
