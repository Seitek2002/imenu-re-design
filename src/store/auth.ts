import { create } from 'zustand';
import type { AuthClient } from '@/lib/api/auth';

/**
 * Access token хранится ТОЛЬКО в памяти (нет persist), чтобы не давать XSS
 * выкрасть его из localStorage. Refresh-токен живёт в HttpOnly cookie,
 * выставленной бэком на path `/api/v2/auth/`, и поэтому переживает перезагрузку
 * страницы — bootstrap-логика (AuthProvider) тихо дёргает /auth/refresh/
 * при маунте и восстанавливает сессию.
 *
 * Контракт см. `project_auth_profile_contract` (Kuma 2026-05-19).
 */
interface AuthState {
  accessToken: string | null;
  expiresAt: number | null; // unix ms
  client: AuthClient | null;
  /**
   * Прошёл ли первый bootstrap (попытка refresh при загрузке приложения).
   * До него скрывать UI «войти» — иначе при F5 на пол-секунды покажется
   * экран логина, хотя пользователь на самом деле залогинен.
   */
  bootstrapped: boolean;
  setSession: (data: {
    accessToken: string;
    expiresIn: number;
    client?: AuthClient | null;
  }) => void;
  updateClient: (client: AuthClient) => void;
  setBootstrapped: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  expiresAt: null,
  client: null,
  bootstrapped: false,
  setSession: ({ accessToken, expiresIn, client }) =>
    set((prev) => ({
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
      client: client ?? prev.client,
    })),
  updateClient: (client) => set({ client }),
  setBootstrapped: () => set({ bootstrapped: true }),
  clear: () =>
    set({
      accessToken: null,
      expiresAt: null,
      client: null,
    }),
}));

/** Хелпер для подмены Bearer-заголовка в не-React коде (queries.ts и т.п.). */
export function getAccessTokenSnapshot(): string | null {
  return useAuthStore.getState().accessToken;
}
