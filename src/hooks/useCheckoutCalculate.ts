'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useBasketStore } from '@/store/basket';
import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import { useBonusStore } from '@/store/bonus';
import { useCalculateOrder } from '@/lib/api/queries';
import type {
  CalculatePromotion,
  CalculateResponse,
  CalculateOrderProduct,
} from '@/lib/order';

interface Options {
  /** 'takeout' | 'delivery' | 'dinein' */
  orderType: 'takeout' | 'delivery' | 'dinein';
  /** Сколько ждать перед отправкой /calculate/ после последнего изменения. */
  debounceMs?: number;
}

/**
 * Серверный расчёт корзины (контракт Kuma 2026-05-12).
 *
 * Дёргает /api/v2/orders/calculate/ с debounce на любое изменение
 * basket / serviceMode / spot / address / coords / phone / bonus.
 *
 * Стратегия UX:
 *  - последний успешный ответ сохраняется и продолжает рендериться,
 *    пока летит новый запрос (никаких "0 c." между debounce);
 *  - isLoading отражает текущий полёт;
 *  - isFresh=true означает что lastInputs совпадают с inputs ответа.
 */
export function useCheckoutCalculate({ orderType, debounceMs = 400 }: Options) {
  const venue = useVenueStore((s) => s.data);
  const spotId = useVenueStore((s) => s.spotId);
  const tableId = useVenueStore((s) => s.tableId);
  const items = useBasketStore((s) => s.items);
  const { phone, deliveryLat, deliveryLng, address } = useCheckout();
  const isBonusUsed = useBonusStore((s) => s.isBonusUsed);
  const bonusAmount = useBonusStore((s) => s.bonusAmount);

  const serviceMode: 1 | 2 | 3 =
    orderType === 'dinein' ? 1 : orderType === 'delivery' ? 3 : 2;

  // Сериализуем orderProducts стабильно: id-сортировка, чтобы перестановка
  // не дёргала расчёт.
  const orderProductsPayload = useMemo(() => {
    return items.map((i) => {
      const flatGroupMods = i.groupSelections
        ?.flatMap((g) => g.items.map((it) => ({ id: it.id, count: it.count })))
        ?.filter((x) => x.count > 0);
      return {
        product: i.id,
        count: i.quantity,
        modificator: i.flatModId ?? null,
        ...(flatGroupMods && flatGroupMods.length > 0
          ? { groupModifications: flatGroupMods }
          : {}),
      };
    });
  }, [items]);

  const bonusToRequest = isBonusUsed ? Math.max(0, Math.floor(bonusAmount)) : 0;

  const inputs = useMemo(
    () => ({
      venueSlug: venue?.slug ?? '',
      serviceMode,
      spot: spotId ?? null,
      table: tableId ?? null,
      phone: phone || undefined,
      address: address || null,
      deliveryLatitude:
        serviceMode === 3 && deliveryLat != null
          ? deliveryLat.toFixed(6)
          : null,
      deliveryLongitude:
        serviceMode === 3 && deliveryLng != null
          ? deliveryLng.toFixed(6)
          : null,
      bonus: bonusToRequest,
      orderProducts: orderProductsPayload,
    }),
    [
      venue?.slug,
      serviceMode,
      spotId,
      tableId,
      phone,
      address,
      deliveryLat,
      deliveryLng,
      bonusToRequest,
      orderProductsPayload,
    ],
  );

  const mutation = useCalculateOrder();
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const inFlightInputsRef = useRef<string | null>(null);
  const lastSentInputsRef = useRef<string | null>(null);

  const inputsKey = useMemo(() => JSON.stringify(inputs), [inputs]);

  useEffect(() => {
    if (!inputs.venueSlug || inputs.orderProducts.length === 0) {
      setResult(null);
      return;
    }
    const handle = setTimeout(() => {
      if (lastSentInputsRef.current === inputsKey) return;
      inFlightInputsRef.current = inputsKey;
      lastSentInputsRef.current = inputsKey;
      mutation.mutate(inputs, {
        onSuccess: (data) => {
          // Игнорируем устаревшие ответы.
          if (inFlightInputsRef.current !== inputsKey) return;
          setError(null);
          setResult(data);
        },
        onError: (err) => {
          if (inFlightInputsRef.current !== inputsKey) return;
          setError(err);
        },
      });
    }, debounceMs);
    return () => clearTimeout(handle);
    // mutation объект референциально стабилен у react-query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsKey, debounceMs]);

  const isFresh = result != null && lastSentInputsRef.current === inputsKey;

  return {
    /** Сырой ответ сервера (последний успешный). */
    raw: result,
    promotion: result?.promotion ?? null,
    /** Финальная сумма к оплате (number, рубли/сом). */
    totalPrice: toNumber(result?.totalPrice),
    productsTotal: toNumber(result?.productsTotal),
    itemsTotal: toNumber(result?.itemsTotal),
    containerTotal: toNumber(result?.containerTotal),
    promotionDiscount: toNumber(result?.promotionDiscount),
    discountedProductsTotal: toNumber(result?.discountedProductsTotal),
    servicePrice: toNumber(result?.servicePrice),
    deliveryPrice: toNumber(result?.deliveryPrice),
    bonusAvailable: toNumber(result?.bonusAvailable),
    bonusApplied: toNumber(result?.bonusApplied),
    bonusEarned: result?.bonusEarned,
    bonusAccrualPercent: result?.bonusAccrualPercent,
    orderProducts: (result?.orderProducts ?? []) as CalculateOrderProduct[],
    isLoading: mutation.isPending && !isFresh,
    isFresh,
    error,
  };
}

function toNumber(v: string | undefined | null): number {
  if (v == null) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export type UseCheckoutCalculateReturn = ReturnType<typeof useCheckoutCalculate>;
export type { CalculatePromotion };
