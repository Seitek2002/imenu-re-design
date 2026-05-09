'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, ReceiptText, UtensilsCrossed } from 'lucide-react';

import { useVenueStore } from '@/store/venue';
import { useCheckout } from '@/store/checkout';
import { useCurrentPosOrder } from '@/lib/api/pos-orders';
import PosPaymentModal from './PosPaymentModal';
import { useTableOrderSocket } from '@/hooks/useTableOrderSocket';
import { useMounted } from '@/hooks/useMounted';
import { useOrdersV2 } from '@/lib/api/queries';
import { useCartLogic } from '@/hooks/useCartLogic';
import { useOrderSummary } from '@/hooks/useOrderSummary';
import { OrderV2 } from '@/lib/order';
import { OrderStatus } from '@/types/api';
import { PosOrder } from '@/types/pos-order';
import BasketItem from '../../cart/components/BasketItem';

const DrawerCheckout = dynamic(
  () => import('../../cart/components/Drawer/DrawerCheckout'),
  { ssr: false },
);

interface Props {
  venueSlug: string;
}

function toNumber(v: string | undefined | null): number {
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: string | number): string {
  const n = typeof value === 'string' ? toNumber(value) : value;
  return Math.round(n).toString();
}

function formatQty(qty: string): string {
  const n = toNumber(qty);
  return Number.isInteger(n) ? String(n) : n.toString();
}

export default function CurrentOrderView({ venueSlug }: Props) {
  const t = useTranslations('TableOrder');
  const queryClient = useQueryClient();
  const mounted = useMounted();
  const tableId = useVenueStore((s) => s.tableId);
  const tableNumberFromStore = useVenueStore((s) => s.tableNumber);
  const { phone, comment, setComment } = useCheckout();

  const {
    data: restOrder,
    isLoading,
    isError,
    refetch,
  } = useCurrentPosOrder(tableId);

  const { data: guestOrdersData } = useOrdersV2({
    phone,
    venueSlug,
    limit: 20,
    includeUnpaid: true,
  });
  const guestOrders = useMemo<OrderV2[]>(() => {
    if (!guestOrdersData?.results || !tableId) return [];
    return guestOrdersData.results
      .filter(
        (o) =>
          o.table?.id === tableId &&
          o.status !== OrderStatus.Completed &&
          o.status !== OrderStatus.Cancelled,
      )
      .sort((a, b) => a.id - b.id);
  }, [guestOrdersData, tableId]);

  const {
    order: wsOrder,
    hasSnapshot,
    isConnected,
    reconnectKey,
  } = useTableOrderSocket(tableId);

  useEffect(() => {
    if (reconnectKey > 0) {
      queryClient.invalidateQueries({
        queryKey: ['pos-order', 'current', tableId],
      });
    }
  }, [reconnectKey, queryClient, tableId]);

  const posOrder: PosOrder | null = hasSnapshot ? wsOrder : (restOrder ?? null);
  const posItems = useMemo(
    () => posOrder?.items.filter((it) => toNumber(it.qty) > 0) ?? [],
    [posOrder],
  );
  const posVisibleSubtotal = useMemo(
    () =>
      posItems.reduce((acc, it) => {
        const modsSum = it.modifiers.reduce(
          (s, m) => s + toNumber(m.sum),
          0,
        );
        return acc + toNumber(it.sum) + modsSum;
      }, 0),
    [posItems],
  );

  // ===== Draft (basket) =====
  const {
    items: draftItems,
    orderType,
    handleIncrement,
    handleDecrement,
    handleRemove,
    subtotal: draftSubtotal,
    total: draftTotal,
    deliveryPrice,
  } = useCartLogic();

  const {
    discount,
    promoDiscount,
    finalDisplayTotal: draftFinal,
    applied,
    effectiveAmount: bonusToApply,
    availableBonuses,
    maxDeductible,
  } = useOrderSummary({
    subtotal: draftSubtotal,
    deliveryType: orderType,
    deliveryCost: deliveryPrice,
  });

  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isPayOpen, setPayOpen] = useState(false);

  const posTotal = toNumber(posOrder?.total);
  const posPaid = toNumber(posOrder?.paidAmount);
  const posRemaining = Math.max(0, posTotal - posPaid);

  const venueData = useVenueStore((s) => s.data);
  const accrualPercent = venueData?.isBonusSystemEnabled ? (venueData?.bonusAccrualPercent ?? 0) : 0;
  const earnedDraftBonus = accrualPercent > 0 ? Math.floor((draftFinal * accrualPercent) / 100) : 0;
  const earnedPosBonus = accrualPercent > 0 ? Math.floor((posRemaining * accrualPercent) / 100) : 0;
  const canPayPos = !!posOrder && posRemaining > 0;

  // ===== Aggregate counts =====
  const ticketCount =
    (posItems.length > 0 ? 1 : 0) +
    guestOrders.length +
    (draftItems.length > 0 ? 1 : 0);

  const tableLabel = posOrder?.tableName ?? tableNumberFromStore ?? '';

  // ===== Early exits =====
  if (!mounted) {
    return <CardEmpty>{t('loading')}</CardEmpty>;
  }
  if (!tableId) {
    return <CardEmpty>{t('noTable')}</CardEmpty>;
  }
  if (isLoading && !hasSnapshot && draftItems.length === 0 && guestOrders.length === 0) {
    return <CardEmpty>{t('loading')}</CardEmpty>;
  }
  if (isError && !hasSnapshot && draftItems.length === 0 && guestOrders.length === 0) {
    return (
      <CardEmpty>
        <p className='text-[#6B6B6B] mb-3'>{t('loadError')}</p>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold'
        >
          {t('retry')}
        </button>
      </CardEmpty>
    );
  }
  if (
    !posOrder &&
    guestOrders.length === 0 &&
    draftItems.length === 0
  ) {
    return (
      <div className='flex flex-col gap-3 '>
        <TableHeaderCard
          tableLabel={tableLabel}
          isConnected={isConnected}
          ticketCount={0}
          tableLabelText={t('tableLabel')}
          liveOn={t('live.connected')}
          liveOff={t('live.disconnected')}
          ticketsLabel={t('summary.empty')}
        />
        <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
          <UtensilsCrossed className='mx-auto mb-3 text-[#A4A4A4]' size={32} />
          <p className='text-[#6B6B6B] mb-4'>{t('empty')}</p>
          <Link
            href={`/${venueSlug}`}
            className='inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-brand text-white font-bold text-sm active:scale-95 transition-transform'
          >
            <Plus size={16} /> {t('addItems')}
          </Link>
        </div>
      </div>
    );
  }

  const hasDraft = draftItems.length > 0;

  return (
    <>
      <div className='flex flex-col gap-3  pb-40'>
        {/* === Хедер счёта === */}
        <TableHeaderCard
          tableLabel={tableLabel}
          isConnected={isConnected}
          ticketCount={ticketCount}
          tableLabelText={t('tableLabel')}
          liveOn={t('live.connected')}
          liveOff={t('live.disconnected')}
          ticketsLabel={t('summary.tickets', { count: ticketCount })}
        />

        {/* === POS-чек официанта === */}
        {posOrder && posItems.length > 0 && (
          <TicketCard
            stripe='neutral'
            icon={<Bell size={14} />}
            title={t('posOrderLabel')}
            statusLabel={t('status.open')}
            sum={formatMoney(posVisibleSubtotal)}
            numericSum={posVisibleSubtotal}
            currency={t('currency')}
          >
            <ul className='divide-y divide-[#E7E7E7]'>
              {posItems.map((item) => {
                const modsSum = item.modifiers.reduce(
                  (acc, m) => acc + toNumber(m.sum),
                  0,
                );
                const lineTotal = toNumber(item.sum) + modsSum;
                return (
                <li key={item.id} className='py-2.5 first:pt-0 last:pb-0'>
                  <div className='flex justify-between items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-[#111111] text-sm'>
                        {item.productName}
                      </div>
                      <div className='text-xs text-[#A4A4A4] mt-0.5'>
                        {formatQty(item.qty)} × {formatMoney(item.price)} {t('currency')}
                      </div>
                      {item.modifiers.length > 0 && (
                        <ul className='mt-1 space-y-0.5'>
                          {item.modifiers.map((m) => (
                            <li
                              key={m.id}
                              className='text-xs text-[#6B6B6B] flex justify-between'
                            >
                              <span className='truncate'>
                                + {m.name}
                                {toNumber(m.count) > 1 ? ` ×${m.count}` : ''}
                              </span>
                              {toNumber(m.sum) > 0 && (
                                <span className='shrink-0 ml-2'>
                                  {formatMoney(m.sum)} {t('currency')}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.comment ? (
                        <div className='text-xs text-[#A4A4A4] mt-1 italic'>
                          {item.comment}
                        </div>
                      ) : null}
                    </div>
                    <div className='font-bold text-[#111111] whitespace-nowrap text-sm'>
                      {formatMoney(lineTotal)} {t('currency')}
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
            {posPaid > 0 && (
              <div className='mt-3 pt-3 border-t border-[#E7E7E7] text-xs flex justify-between text-green-700'>
                <span>{t('paid')}</span>
                <span className='font-bold'>{formatMoney(posPaid)} {t('currency')}</span>
              </div>
            )}
          </TicketCard>
        )}

        {/* === Гостевые заказы (отправленные) === */}
        {guestOrders.map((g) => (
          <TicketCard
            key={g.id}
            stripe='brand'
            icon={<ReceiptText size={14} />}
            title={t('guestOrderLabel', { id: g.id })}
            statusLabel={t(statusKey(g.status))}
            statusTone={statusToneFor(g.status)}
            sum={formatMoney(g.totalPrice)}
            numericSum={toNumber(g.totalPrice)}
            currency={t('currency')}
          >
            <ul className='divide-y divide-[#E7E7E7]'>
              {g.orderProducts.map((it) => {
                const photo = it.product.productPhotoSmall || it.product.productPhoto;
                const lineSum = toNumber(it.price) * it.count;
                return (
                  <li
                    key={`${g.id}-${it.id}`}
                    className='py-2.5 first:pt-0 last:pb-0 flex gap-3'
                  >
                    <div className='relative w-12 h-12 rounded-lg overflow-hidden bg-[#F1F2F3] shrink-0'>
                      {photo ? (
                        <Image
                          src={photo}
                          alt={it.product.productName}
                          fill
                          sizes='48px'
                          className='object-cover'
                        />
                      ) : null}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-[#111111] text-sm truncate'>
                        {it.product.productName}
                      </div>
                      <div className='text-xs text-[#A4A4A4] mt-0.5'>
                        {it.count} × {formatMoney(it.price)} {t('currency')}
                      </div>
                    </div>
                    <div className='font-bold text-[#111111] whitespace-nowrap text-sm self-center'>
                      {formatMoney(lineSum)} {t('currency')}
                    </div>
                  </li>
                );
              })}
            </ul>
          </TicketCard>
        ))}

        {/* === Черновик (draft) === */}
        {hasDraft && (
          <TicketCard
            stripe='dashed'
            icon={<Plus size={14} />}
            title={t('draftLabel')}
            statusLabel={t('status.draft')}
            statusTone='draft'
            sum={formatMoney(draftFinal)}
            numericSum={Number(draftFinal) || 0}
            currency={t('currency')}
          >
            <ul className='divide-y divide-[#E7E7E7]'>
              {draftItems.map((item) => {
                const isInvolved =
                  applied?.discount.involvedItemKeys.includes(item.key) ?? false;
                let promoBadge: string | undefined;
                if (isInvolved && applied) {
                  const benefit = applied.promotion.benefit;
                  if (benefit.discountPercent != null) {
                    promoBadge = t('promo.itemBadge', {
                      percent: benefit.discountPercent,
                    });
                  } else if (benefit.type === 'bonus_products') {
                    const bonusQty =
                      applied.discount.bonusItems?.find(
                        (b) => b.productId === item.id,
                      )?.quantity ?? 1;
                    promoBadge = t('promo.bonusBadge', { count: bonusQty });
                  } else {
                    promoBadge = t('promo.itemBadgeGeneric');
                  }
                }
                return (
                  <BasketItem
                    key={item.key}
                    item={item}
                    promoBadge={promoBadge}
                    onIncrement={() => handleIncrement(item.key)}
                    onDecrement={() => handleDecrement(item.key)}
                    onRemove={() => handleRemove(item.key)}
                  />
                );
              })}
            </ul>

            <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-2.5 px-3 cursor-text'>
              <span className='text-[#A4A4A4] text-xs mb-0.5 font-medium'>
                {t('draftCommentLabel')}
              </span>
              <input
                type='text'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                placeholder={t('draftCommentPlaceholder')}
              />
            </label>

            {(discount > 0 || promoDiscount > 0) && (
              <div className='mt-2 text-xs flex justify-between text-[#6B6B6B]'>
                <span>{t('draftSubtotal')}</span>
                <span className='line-through text-[#A4A4A4]'>
                  {formatMoney(draftTotal)} {t('currency')}
                </span>
              </div>
            )}
          </TicketCard>
        )}

        {/* === Add more button === */}
        <Link
          href={`/${venueSlug}`}
          className='self-center mt-1 inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-white text-[#111111] font-bold text-sm border border-[#E7E7E7] active:scale-95 transition-transform'
        >
          <Plus size={16} /> {t('addItems')}
        </Link>

      </div>

      {/* === Sticky bottom action === */}
      <div className='fixed bottom-16 left-0 right-0 z-40 max-w-175 mx-auto px-3 pb-2'>
        <div className='bg-white rounded-2xl shadow-2xl border border-[#E7E7E7] p-3 flex flex-col gap-2'>
          {hasDraft && (
            <button
              onClick={() => setCheckoutOpen(true)}
              className='w-full bg-brand text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-md flex flex-row items-center justify-center gap-2 leading-tight'
            >
              <span>{t('submitDraft', { amount: Math.round(draftFinal) })}</span>
              {earnedDraftBonus > 0 && (
                <span className='text-[11px] font-semibold opacity-90 px-2 py-0.5 rounded-full bg-white/20'>
                  +{earnedDraftBonus} {t('bonusShort')}
                </span>
              )}
            </button>
          )}
          {canPayPos && (
            <button
              onClick={() => setPayOpen(true)}
              className={`w-full font-bold h-12 rounded-xl active:scale-95 transition-transform flex flex-row items-center justify-center gap-2 leading-tight ${
                hasDraft
                  ? 'bg-white text-[#111111] border border-[#E7E7E7]'
                  : 'bg-brand text-white shadow-md'
              }`}
            >
              <span>{t('payment.pay', { amount: Math.round(posRemaining) })}</span>
              {earnedPosBonus > 0 && (
                <span className={`text-[11px] font-semibold opacity-90 px-2 py-0.5 rounded-full ${hasDraft ? 'bg-black/5 text-[#111111]' : 'bg-white/20'}`}>
                  +{earnedPosBonus} {t('bonusShort')}
                </span>
              )}
            </button>
          )}
          {!hasDraft && !canPayPos && (
            <div className='py-2 text-center text-xs text-[#A4A4A4]'>
              {t('summary.allSettled')}
            </div>
          )}
        </div>
      </div>

      <DrawerCheckout
        sheetOpen={isCheckoutOpen}
        closeSheet={() => setCheckoutOpen(false)}
        orderType={orderType}
        finalTotal={draftFinal}
        deliveryCost={deliveryPrice}
        bonusToApply={bonusToApply}
        showBonusInput
        availableBonuses={availableBonuses}
        maxDeductible={maxDeductible}
      />

      {posOrder && canPayPos && (
        <PosPaymentModal
          open={isPayOpen}
          onClose={() => setPayOpen(false)}
          orderId={posOrder.id}
          remaining={posRemaining}
          venueSlug={venueSlug}
        />
      )}
    </>
  );
}

/* ====== Small presentational helpers ====== */

function CardEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-white rounded-2xl shadow-sm p-6 text-center text-[#6B6B6B]'>
      {children}
    </div>
  );
}

function TableHeaderCard({
  tableLabel,
  isConnected,
  ticketCount,
  tableLabelText,
  liveOn,
  liveOff,
  ticketsLabel,
}: {
  tableLabel: string;
  isConnected: boolean;
  ticketCount: number;
  tableLabelText: string;
  liveOn: string;
  liveOff: string;
  ticketsLabel: string;
}) {
  return (
    <div className='bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between'>
      <div>
        <div className='text-xs text-[#A4A4A4]'>{tableLabelText}</div>
        <div className='text-lg font-bold text-[#111111]'>
          №{tableLabel || '—'}
        </div>
      </div>
      <div className='flex flex-col items-end'>
        <span className='text-xs text-[#6B6B6B]'>{ticketsLabel}</span>
        <span
          className={`text-[10px] mt-1 ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {isConnected ? liveOn : liveOff}
          {ticketCount > 0 ? '' : ''}
        </span>
      </div>
    </div>
  );
}

interface TicketCardProps {
  stripe: 'brand' | 'neutral' | 'dashed';
  icon: React.ReactNode;
  title: string;
  statusLabel: string;
  statusTone?: 'draft' | 'progress' | 'done' | 'pending';
  sum: string;
  numericSum: number;
  currency: string;
  children: React.ReactNode;
}

function TicketCard({
  stripe,
  icon,
  title,
  statusLabel,
  statusTone,
  sum,
  numericSum,
  currency,
  children,
}: TicketCardProps) {
  const tt = useTranslations('TableOrder');
  const venue = useVenueStore((s) => s.data);
  const accrualPercent = venue?.isBonusSystemEnabled ? (venue?.bonusAccrualPercent ?? 0) : 0;
  const earnedBonus = accrualPercent > 0 ? Math.floor((numericSum * accrualPercent) / 100) : 0;
  const stripeCls =
    stripe === 'brand'
      ? 'bg-brand'
      : stripe === 'neutral'
        ? 'bg-[#9CA3AF]'
        : 'bg-transparent border-y border-dashed border-brand/40';

  const wrapperBorder = stripe === 'dashed' ? 'border-2 border-dashed border-brand/30' : '';

  const toneCls =
    statusTone === 'progress'
      ? 'bg-amber-100 text-amber-700'
      : statusTone === 'done'
        ? 'bg-green-100 text-green-700'
        : statusTone === 'pending'
          ? 'bg-blue-100 text-blue-700'
          : statusTone === 'draft'
            ? 'bg-brand/10 text-brand'
            : 'bg-gray-100 text-gray-700';

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${wrapperBorder}`}>
      <div className={`h-1 ${stripeCls}`} />
      <div className='px-4 pt-3 pb-2 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='text-[#6B6B6B] shrink-0'>{icon}</span>
          <span className='text-sm font-bold text-[#111111] truncate'>{title}</span>
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-md ${toneCls}`}>
          {statusLabel}
        </span>
      </div>
      <div className='px-4 pb-3'>{children}</div>
      <div className='px-4 py-2.5 bg-[#FAFAFA] border-t border-[#E7E7E7] flex justify-between items-center text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-[#6B6B6B]'>{tt('total')}</span>
          {earnedBonus > 0 && (
            <span className='text-[11px] font-semibold text-brand bg-brand/10 rounded-md px-1.5 py-0.5'>
              {tt('earnBonus', { amount: earnedBonus })}
            </span>
          )}
        </div>
        <span className='font-bold text-[#111111]'>
          {sum} {currency}
        </span>
      </div>
    </div>
  );
}

function statusKey(status: number): string {
  switch (status) {
    case OrderStatus.Created:
      return 'status.created';
    case OrderStatus.Preparing:
      return 'status.preparing';
    case OrderStatus.Ready:
      return 'status.ready';
    case OrderStatus.PendingPayment:
      return 'status.pendingPayment';
    case OrderStatus.InDelivery:
      return 'status.inDelivery';
    case OrderStatus.Completed:
      return 'status.completed';
    case OrderStatus.Cancelled:
      return 'status.cancelled';
    default:
      return 'status.open';
  }
}

function statusToneFor(
  status: number,
): 'progress' | 'done' | 'pending' | undefined {
  switch (status) {
    case OrderStatus.Created:
    case OrderStatus.Preparing:
    case OrderStatus.InDelivery:
      return 'progress';
    case OrderStatus.Ready:
    case OrderStatus.Completed:
      return 'done';
    case OrderStatus.PendingPayment:
      return 'pending';
    default:
      return undefined;
  }
}
