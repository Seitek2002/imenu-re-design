'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import { useOrdersV2, useClientBonus } from '@/lib/api/queries';
import { OrderStatus } from '@/types/api';
import type { OrderV2 } from '@/lib/order';
import { calculateOrderProgress } from '@/lib/helpers/progressHelper';

import OrdersSheet from './OrdersSheet';
import ScheduleModal from '@/components/modals/ScheduleModal';

import ActiveOrderCard from './widgets/ActiveOrderCard';
import BonusHero from './widgets/BonusHero';
import BonusChip from './widgets/BonusChip';
import HoursChip from './widgets/HoursChip';
import RedeemChip from './widgets/RedeemChip';

interface IWidgetsProps {
  venueSlug: string;
}

/**
 * Live-Status section — adaptive hero + 2-up chip row.
 *   - active order → ActiveOrderCard (step ladder, items strip, CTA на Ready)
 *   - no order + bonus on → BonusHero (balance, accrual/cap pair, прогресс)
 *   - no order + bonus off → HoursChip только, на всю ширину
 */
const Widgets = ({ venueSlug }: IWidgetsProps) => {
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
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
  const activeOrders = (ordersData?.results ?? []).filter(
    (o) =>
      o.status !== OrderStatus.Completed &&
      o.status !== OrderStatus.Cancelled &&
      o.paymentStatus !== 'expired' &&
      o.paymentStatus !== 'failed' &&
      o.paymentStatus !== 'cancelled',
  );

  // Featured = closest-to-ready. Остальные доступны через "+N" pill.
  const featuredOrder: OrderV2 | null = activeOrders.length
    ? activeOrders.reduce((best, o) =>
        calculateOrderProgress(o.status, o.serviceMode) >
        calculateOrderProgress(best.status, best.serviceMode)
          ? o
          : best,
      )
    : null;

  const extraCount = Math.max(0, activeOrders.length - 1);
  const hasOrder = featuredOrder !== null;
  const bonusEnabled = venue?.isBonusSystemEnabled ?? false;

  // BonusResponse не отдаёт bonusAccrualPercent — берём дефолт venue. Это
  // повторяет логику BonusAccrualBadge.tsx (см. c615b84): для анонов
  // /calculate/ возвращает 0, фронт фоллбэчит на venue.bonusAccrualPercent.
  const accrualPercent = venue?.bonusAccrualPercent ?? 0;
  const maxDeductiblePercent = venue?.bonusMaxDeductiblePercent ?? 50;

  return (
    <>
      <div className='mt-2 flex flex-col gap-2'>
        {hasOrder ? (
          <ActiveOrderCard
            order={featuredOrder!}
            extraCount={extraCount}
            venueSlug={venueSlug}
            onMultiClick={() => setOrdersOpen(true)}
          />
        ) : bonusEnabled ? (
          <BonusHero
            balance={bonusData?.bonus ?? 0}
            accrualPercent={accrualPercent}
            maxDeductiblePercent={maxDeductiblePercent}
            nextGroupName={bonusData?.nextGroup?.name ?? null}
            turnoverToNext={
              bonusData?.turnoverToNext != null
                ? Number(bonusData.turnoverToNext)
                : null
            }
            venueSlug={venueSlug}
            locale={locale}
          />
        ) : null}

        <div
          className={`grid gap-2.5 ${
            bonusEnabled ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {bonusEnabled &&
            (hasOrder ? (
              <BonusChip
                balance={bonusData?.bonus ?? 0}
                accrualPercent={accrualPercent}
                venueSlug={venueSlug}
                locale={locale}
              />
            ) : (
              <RedeemChip maxDeductiblePercent={maxDeductiblePercent} />
            ))}
          <HoursChip
            schedules={venue?.schedules ?? []}
            onClick={() => setScheduleOpen(true)}
          />
        </div>
      </div>

      <OrdersSheet
        open={isOrdersOpen}
        onClose={() => setOrdersOpen(false)}
        orders={activeOrders}
        venueSlug={venueSlug}
      />
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />
    </>
  );
};

export default Widgets;
