import { create } from 'zustand';

/**
 * Глобальный редирект на платёжный шлюз.
 *
 * Раньше каждый платёжный путь делал `window.location.href = url` напрямую —
 * между кликом и загрузкой страницы шлюза пользователь видел замёрший UI без
 * обратной связи и мог тапнуть повторно. Теперь вызывающий код просто зовёт
 * `startPaymentRedirect(url)`: глобальный `PaymentRedirectOverlay` (примонтирован
 * в layout заведения) показывает полноэкранный спиннер, затем уводит браузер,
 * а на случай зависшего шлюза предлагает ручную ссылку.
 */
interface PaymentRedirectState {
  url: string | null;
  start: (url: string) => void;
  reset: () => void;
}

export const usePaymentRedirect = create<PaymentRedirectState>((set) => ({
  url: null,
  start: (url) => set({ url }),
  reset: () => set({ url: null }),
}));

/** Императивный шорткат — удобно звать из обработчиков вне React-render. */
export function startPaymentRedirect(url: string): void {
  usePaymentRedirect.getState().start(url);
}
