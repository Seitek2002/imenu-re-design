import { OrderStatus } from '@/types/api';

/**
 * Интервал поллинга статуса заказа (react-query refetchInterval).
 *
 * Терминальные статусы (Completed/Cancelled) — поллинг выключен.
 * `PendingPayment` — лимб ожидания оплаты: резолюция придёт webhook'ом шлюза
 * или cron'ом протухания (~5 мин), поэтому поллим всё реже (5→15→30с), чтобы
 * не слать десятки запросов; быстрый путь — refetchOnWindowFocus. Активные
 * статусы (готовится/готов/в доставке) держим живо на 5с.
 *
 * Вынесено из queries.ts отдельным модулем, чтобы тестировать без подтягивания
 * всего графа зависимостей (next-intl, react-query и пр.).
 */
export function orderPollInterval(
  status: number | undefined,
  dataUpdateCount: number,
): number | false {
  if (status === OrderStatus.Completed || status === OrderStatus.Cancelled) {
    return false;
  }
  if (status === OrderStatus.PendingPayment) {
    if (dataUpdateCount < 4) return 5000;
    if (dataUpdateCount < 8) return 15000;
    return 30000;
  }
  return 5000;
}
