/**
 * Парсер ошибок DRF от наших ручек /orders/, /orders/calculate/.
 *
 * `useCreateOrderV2` и `useCalculateOrder` бросают сырую JSON-ошибку
 * (см. queries.ts: `throw errData`). Это либо `{ error: "..." }`,
 * либо `{ <fieldName>: "..." | ["..."] }`, либо вложенные структуры
 * для `orderProducts`.
 *
 * Возвращает локализованное человекочитаемое сообщение через колбэк-переводчик
 * (next-intl `t`), чтобы можно было вызвать из любого компонента.
 *
 * Известные ключи backend-а (контракт Kuma 2026-05-12):
 *  - serviceMode: "Доставка недоступна в этом заведении." / "...для выбранной точки." / "Точка не принадлежит заведению."
 *  - bonus: "Недостаточно бонусов Poster."
 *  - error: "venue_slug is required." / "Venue not found." / "Заказ можно создать только в рабочее время заведения."
 *  - orderProducts: [{ groupModifications: "Invalid group modification selection." }]
 *
 * Если ключ неизвестен — возвращаем `fallback` или сырую строку, чтобы юзер хоть что-то увидел.
 */
export type ApiErrorT = (key: string, params?: Record<string, string | number>) => string;

interface ParseOptions {
  /** next-intl translator scoped по `Cart.errors`. */
  t: ApiErrorT;
  /** Сообщение, которое показать если распознать ничего не удалось. */
  fallback: string;
}

export function parseApiError(err: unknown, { t, fallback }: ParseOptions): string {
  if (err == null) return fallback;

  // Network error / стандартный Error
  if (err instanceof Error) return err.message || fallback;

  if (typeof err !== 'object') return String(err);

  const obj = err as Record<string, unknown>;

  // 1) { error: "..." } — top-level бизнес-ошибка.
  if (typeof obj.error === 'string') {
    return mapKnownMessage(obj.error, t) ?? obj.error;
  }

  // 2) serviceMode
  const serviceModeMsg = firstString(obj.serviceMode);
  if (serviceModeMsg) {
    return mapKnownMessage(serviceModeMsg, t) ?? serviceModeMsg;
  }

  // 3) bonus
  const bonusMsg = firstString(obj.bonus);
  if (bonusMsg) {
    return mapKnownMessage(bonusMsg, t) ?? bonusMsg;
  }

  // 4) orderProducts: [{ groupModifications: "..."}]
  if (Array.isArray(obj.orderProducts)) {
    for (const row of obj.orderProducts) {
      if (row && typeof row === 'object') {
        const gm = firstString((row as Record<string, unknown>).groupModifications);
        if (gm) return t('invalidGroupMods');
      }
    }
  }

  // 5) phone
  const phoneMsg = firstString(obj.phone);
  if (phoneMsg) return phoneMsg;

  // 6) detail (DRF AuthenticationFailed и т.п.)
  if (typeof obj.detail === 'string') return obj.detail;

  // 7) message (наш network-fallback)
  if (typeof obj.message === 'string') return obj.message;

  return fallback;
}

function firstString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return null;
}

/**
 * Маппинг известных backend-сообщений на ключи переводов.
 * Сравнение по подстроке, чтобы не зависеть от точной пунктуации.
 */
function mapKnownMessage(msg: string, t: ApiErrorT): string | null {
  const m = msg.toLowerCase();

  if (m.includes('доставка недоступна') && m.includes('заведении')) {
    return t('deliveryUnavailableVenue');
  }
  if (m.includes('доставка недоступна') && m.includes('точки')) {
    return t('deliveryUnavailableSpot');
  }
  if (m.includes('точка не принадлежит')) {
    return t('spotMismatch');
  }
  if (m.includes('недостаточно бонусов')) {
    return t('notEnoughBonus');
  }
  if (m.includes('рабочее время')) {
    return t('venueClosed');
  }
  if (m.includes('venue not found')) {
    return t('venueNotFound');
  }

  return null;
}
