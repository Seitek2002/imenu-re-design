import { OrderStatus, ServiceMode } from '@/types/api';

const STEPS_COUNT: Record<ServiceMode, number> = {
  [ServiceMode.DineIn]: 3,
  [ServiceMode.Takeaway]: 4,
  [ServiceMode.Delivery]: 4,
};

export function isPendingPayment(status?: number): boolean {
  return status === OrderStatus.PendingPayment;
}

export function isCancelled(status?: number): boolean {
  return status === OrderStatus.Cancelled;
}

/**
 * Маппинг статуса заказа (`OrderStatus`) на индекс шага в прогресс-баре.
 *
 * Статусы 4 (PendingPayment) и 7 (Cancelled) не входят в линейный прогресс —
 * для них вызывающий код показывает отдельные оверлеи. Для совместимости
 * функция всё равно возвращает 0, но опираться на это не стоит.
 */
export function statusToStepIndex(
  status: number | undefined,
  serviceMode: number | undefined,
): number {
  if (status === undefined || serviceMode === undefined) return 0;

  const total =
    STEPS_COUNT[serviceMode as ServiceMode] ?? STEPS_COUNT[ServiceMode.Takeaway];
  const lastIndex = total - 1;

  switch (status) {
    case OrderStatus.Created:
    case OrderStatus.PendingPayment:
    case OrderStatus.Cancelled:
      return 0;
    case OrderStatus.Preparing:
      return 1;
    case OrderStatus.Ready:
      // Для доставки "готов" ≠ доставлен — курьер только забирает; держим на кухне.
      return serviceMode === ServiceMode.Delivery ? 1 : Math.min(2, lastIndex);
    case OrderStatus.InDelivery:
      return Math.min(2, lastIndex);
    case OrderStatus.Completed:
      return lastIndex;
    default:
      return 0;
  }
}

export function calculateOrderProgress(
  status?: number,
  serviceMode?: number,
): number {
  if (status === undefined || serviceMode === undefined) return 0;
  if (isCancelled(status) || isPendingPayment(status)) return 0;

  const total =
    STEPS_COUNT[serviceMode as ServiceMode] ?? STEPS_COUNT[ServiceMode.Takeaway];
  const stepIndex = statusToStepIndex(status, serviceMode);
  const percent = Math.round(((stepIndex + 1) / total) * 100);
  return Math.min(100, Math.max(0, percent));
}
