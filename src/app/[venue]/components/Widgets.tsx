'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import { useOrdersV2, useClientBonus } from '@/lib/api/queries';
import type { OrderV2 } from '@/lib/order';
import { OrderStatus } from '@/types/api';
import { calculateOrderProgress } from '@/lib/helpers/progressHelper';

import ScheduleModal from '@/components/modals/ScheduleModal';

import ActiveOrderCard from './widgets/ActiveOrderCard';
import BonusHero from './widgets/BonusHero';
import HoursChip from './widgets/HoursChip';

interface IWidgetsProps {
  venueSlug: string;
}

/**
 * Live-Status section на странице заведения.
 *   - активные заказы → стопка компактных чипов ActiveOrderCard (тап ведёт на
 *     /order-status/[id]);
 *   - бонус-виджет ниже НЕ зависит от наличия заказа: bonus on → BonusHero
 *     (полный, с прогрессом), bonus off → HoursChip.
 */
const Widgets = ({ venueSlug }: IWidgetsProps) => {
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  // «Сейчас» для отсечки устаревших заказов держим в state (ленивая инициализация
  // + редкий тик), чтобы не звать Date.now() прямо в рендере (react-hooks/purity).
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const locale = useLocale();

  const { phone } = useCheckout();
  const venue = useVenueStore((s) => s.data);

  const { data: bonusData } = useClientBonus({ phone, venueSlug });
  const { data: ordersData } = useOrdersV2({
    phone,
    venueSlug,
    limit: 20,
    includeUnpaid: true,
  });

  // Cron бэка переводит зависший pending → expired/cancelled с лагом до ~6 мин
  // (Kuma 2026-05-25 §5.1), поэтому дублируем фильтр по paymentStatus.
  //
  // Отсечка по возрасту: dine-in, который официант не закрыл в POS, застревает
  // в «Готовится» навсегда (бэк не истекает такие заказы), и ghost висит на
  // главной сутками. Прячем всё старше 12 часов. createdAt нет/битый → не
  // прячем (не знаем возраст, лучше показать живой заказ, чем спрятать его).
  const MAX_ACTIVE_AGE_MS = 12 * 60 * 60 * 1000;
  const freshEnough = (o: OrderV2) => {
    const ms = o.createdAt ? new Date(o.createdAt).getTime() : NaN;
    if (!Number.isFinite(ms)) return true;
    return nowMs - ms < MAX_ACTIVE_AGE_MS;
  };

  const activeOrders = (ordersData?.results ?? []).filter(
    (o) =>
      o.status !== OrderStatus.Completed &&
      o.status !== OrderStatus.Cancelled &&
      o.paymentStatus !== 'expired' &&
      o.paymentStatus !== 'failed' &&
      o.paymentStatus !== 'cancelled' &&
      freshEnough(o),
  );

  // Виджет дышит только живыми заказами — pending уходит в /history.
  // Заказы — компактные чипы (одна строка + тонкий прогресс). Несколько
  // активных просто стопкой сверху вниз, отсортированы по прогрессу
  // (ближе к выдаче — выше).
  const visibleOrders = activeOrders
    .filter((o) => o.status !== OrderStatus.PendingPayment)
    .sort(
      (a, b) =>
        calculateOrderProgress(b.status, b.serviceMode) -
        calculateOrderProgress(a.status, a.serviceMode),
    );

  const hasOrder = visibleOrders.length > 0;
  const bonusEnabled = venue?.isBonusSystemEnabled ?? false;

  // BonusResponse не отдаёт bonusAccrualPercent — берём дефолт venue. Это
  // повторяет логику BonusAccrualBadge.tsx (см. c615b84): для анонов
  // /calculate/ возвращает 0, фронт фоллбэчит на venue.bonusAccrualPercent.
  const accrualPercent = venue?.bonusAccrualPercent ?? 0;
  const maxDeductiblePercent = venue?.bonusMaxDeductiblePercent ?? 50;

  // Пока venue не загружен (store ещё null при первом рендере / гидратации
  // sessionStorage), bonusEnabled падает в дефолт false и на миг рисуется
  // HoursChip «уточните часы», который тут же сменяется на BonusHero. Гасим
  // этот флеш: ничего не рендерим, пока не знаем venue.
  if (!venue) return null;

  return (
    <>
      <div className='mt-2 flex flex-col gap-2'>
        {hasOrder &&
          visibleOrders.map((o) => (
            <ActiveOrderCard key={o.id} order={o} venueSlug={venueSlug} />
          ))}

        {bonusEnabled ? (
          <BonusHero
            balance={bonusData?.bonus ?? 0}
            accrualPercent={accrualPercent}
            maxDeductiblePercent={maxDeductiblePercent}
            currentGroupName={bonusData?.clientGroup?.name ?? null}
            nextGroupName={bonusData?.nextGroup?.name ?? null}
            turnoverToNext={
              bonusData?.turnoverToNext != null
                ? Number(bonusData.turnoverToNext)
                : null
            }
            totalPayedSum={
              bonusData?.totalPayedSum != null
                ? Number(bonusData.totalPayedSum)
                : null
            }
            currentGroupRequiredTurnover={
              bonusData?.clientGroup?.requiredTurnover != null
                ? Number(bonusData.clientGroup.requiredTurnover)
                : null
            }
            nextGroupRequiredTurnover={
              bonusData?.nextGroup?.requiredTurnover != null
                ? Number(bonusData.nextGroup.requiredTurnover)
                : null
            }
            nextGroupDiscountPercent={
              bonusData?.nextGroup?.discountPercent ?? null
            }
            nextGroupLoyaltyType={bonusData?.nextGroup?.loyaltyType ?? null}
            schedules={venue?.schedules ?? []}
            onScheduleClick={() => setScheduleOpen(true)}
            venueSlug={venueSlug}
            locale={locale}
          />
        ) : (
          <HoursChip
            schedules={venue?.schedules ?? []}
            onClick={() => setScheduleOpen(true)}
          />
        )}
      </div>

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />
    </>
  );
};

export default Widgets;
