'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import OrderSummary from './components/OrderSummary';
import { useCartLogic } from '@/hooks/useCartLogic';
import BasketItem from './components/BasketItem';

import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import { useCheckoutCalculate } from '@/hooks/useCheckoutCalculate';
import { useMounted } from '@/hooks/useMounted';
import { parseApiError } from '@/lib/apiErrors';
import { MessageSquare } from 'lucide-react';
import UtensilsSelector from './components/UtensilsSelector';
import EmptyBasket from './components/EmptyBasket';

// Ленивая загрузка
const DrawerCheckout = dynamic(
  () => import('./components/Drawer/DrawerCheckout'),
  { ssr: false },
);

export default function BasketPage() {
  const t = useTranslations('Cart');
  const tErr = useTranslations('Cart.errors');
  const {
    items,
    orderType,
    setOrderType,
    handleIncrement,
    handleDecrement,
    handleRemove,
    subtotal,
    total: cartTotal, // Переименуем, так как это "грязная" цена без бонусов
    deliveryPrice,
    isFreeDelivery,
    canDeliver,
    canTakeout,
  } = useCartLogic();

  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const { comment, setComment } = useCheckout();
  const tableNumber = useVenueStore((state) => state.tableNumber);
  const tableId = useVenueStore((state) => state.tableId);
  const venueData = useVenueStore((state) => state.data);
  const params = useParams<{ venue: string }>();
  const venueSlug = params?.venue ?? '';
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && tableId) {
      router.replace(`/${venueSlug}/table-order`);
    }
  }, [mounted, tableId, venueSlug, router]);

  // Серверный расчёт (контракт Kuma 2026-05-12). Источник истины
  // для total/promo/delivery/bonus. Локальный subtotal используем
  // только как fallback, пока пришёл первый ответ.
  const calc = useCheckoutCalculate({ orderType });

  const isBonusEnabled = venueData?.isBonusSystemEnabled ?? false;
  const serverTotal = calc.raw ? calc.totalPrice : subtotal + deliveryPrice;
  const bonusToApply = calc.bonusApplied;
  const promoDiscount = calc.promotionDiscount;
  const discount = bonusToApply;
  const earnedBonus = calc.bonusEarned;
  const serverDeliveryPrice = calc.raw ? calc.deliveryPrice : deliveryPrice;
  const serverIsFreeDelivery =
    orderType === 'delivery' && calc.raw
      ? calc.deliveryPrice === 0
      : isFreeDelivery;
  const availableBonuses = calc.bonusAvailable;
  const orderBaseTotal =
    (calc.raw ? calc.totalPrice + bonusToApply : subtotal + serverDeliveryPrice) - promoDiscount;
  const maxDeductible = Math.floor(Math.min(availableBonuses, orderBaseTotal * 0.5));

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-screen pb-32'>
      <Header title={t('title')} />

      <section className='bg-white pt-4 mt-4 px-2 rounded-4xl pb-5 lg:mx-auto shadow-sm min-h-[60vh]'>
        {/* Toggle (только без стола — со столом пользователь увозится на /table-order).
            Если доставка недоступна (venue или spot), показываем только takeout. */}
        {!tableNumber && canDeliver && canTakeout && (
          <div className='bg-[#FAFAFA] rounded-full mb-3 p-1 grid grid-cols-2 gap-2'>
            <button
              onClick={() => setOrderType('takeout')}
              className={`py-2 rounded-full text-sm transition-all ${
                orderType === 'takeout'
                  ? 'bg-white text-[#111111] font-bold shadow-sm'
                  : 'text-[#6B6B6B]'
              }`}
            >
              {t('takeout')}
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-2 rounded-full text-sm transition-all ${
                orderType === 'delivery'
                  ? 'bg-white text-[#111111] font-bold shadow-sm'
                  : 'text-[#6B6B6B]'
              }`}
            >
              {t('delivery')}
            </button>
          </div>
        )}

        {/* List */}
        {items.length === 0 ? (
          <EmptyBasket />
        ) : (
          <div className='flex flex-col'>
            <ul className='divide-y divide-[#E7E7E7]'>
              {items.map((item) => {
                // Промо-бейдж берём из серверного calc: строка считается
                // участвующей, если backend насчитал по ней promotionDiscountAmount.
                const calcLine = calc.orderProducts.find(
                  (l) => l.product === item.id && !l.isContainer && !l.isServiceItem,
                );
                const lineDiscount = calcLine
                  ? parseFloat(calcLine.promotionDiscountAmount)
                  : 0;
                // Если backend применил скидку только к части единиц
                // (promotionDiscountedCount < count) — показываем явный бейдж
                // "1 из 2 со скидкой", иначе обычный процент/generic.
                const discountedCount = calcLine?.promotionDiscountedCount ?? 0;
                const lineCount = calcLine?.count ?? item.quantity;
                const isPartial =
                  lineDiscount > 0 &&
                  discountedCount > 0 &&
                  discountedCount < lineCount;
                const promoBadge =
                  lineDiscount > 0 && calc.promotion
                    ? isPartial
                      ? t('promo.partialBadge', {
                          discounted: discountedCount,
                          total: lineCount,
                        })
                      : calc.promotion.discountPercent > 0
                        ? t('promo.itemBadge', {
                            percent: calc.promotion.discountPercent,
                          })
                        : t('promo.itemBadgeGeneric')
                    : undefined;

                const originalLineTotal = calcLine
                  ? parseFloat(calcLine.totalPrice)
                  : undefined;
                const discountedLineTotal = calcLine
                  ? parseFloat(calcLine.discountedTotalPrice)
                  : undefined;

                return (
                  <BasketItem
                    key={item.key}
                    item={item}
                    promoBadge={promoBadge}
                    originalLineTotal={originalLineTotal}
                    discountedLineTotal={discountedLineTotal}
                    onIncrement={() => handleIncrement(item.key)}
                    onDecrement={() => handleDecrement(item.key)}
                    onRemove={() => handleRemove(item.key)}
                  />
                );
              })}
            </ul>

            {calc.error != null && (
              <div className='mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600'>
                {parseApiError(calc.error, {
                  t: (k) => tErr(k),
                  fallback: tErr('calculateFailed'),
                })}
              </div>
            )}

            {orderType !== 'dinein' && (
              <UtensilsSelector className='mt-3' />
            )}

            {showComment || comment ? (
              <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4 cursor-text'>
                <span className='text-[#A4A4A4] text-xs mb-1 font-medium'>
                  {t('drawer.commentLabel')}
                </span>
                <input
                  type='text'
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                  placeholder={t('drawer.commentPlaceholder')}
                />
              </label>
            ) : (
              <button
                type='button'
                onClick={() => setShowComment(true)}
                className='mt-3 w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-3 px-4 text-sm font-medium text-[#A4A4A4]'
              >
                <MessageSquare size={16} />
                {t('drawer.commentLabel')}
              </button>
            )}

            <OrderSummary
              deliveryCost={serverDeliveryPrice}
              subtotal={subtotal}
              deliveryType={orderType}
              isFreeDelivery={serverIsFreeDelivery}
              promotion={calc.promotion}
              promotionDiscount={promoDiscount}
              bonusAvailable={availableBonuses}
              bonusApplied={bonusToApply}
              bonusEarned={earnedBonus}
              bonusAccrualPercent={calc.bonusAccrualPercent}
              finalTotal={serverTotal}
              servicePrice={calc.servicePrice}
              containerTotal={calc.containerTotal}
              isCalculating={calc.isLoading}
            />
          </div>
        )}
      </section>

      {/* Sticky Footer & Drawer */}
      {items.length > 0 && (
        <>
          <div className='fixed max-w-175 mx-auto bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40 rounded-t-xl'>
            <div className='max-w-md mx-auto flex items-center gap-4'>
              <div className='flex flex-col'>
                <span className='text-xs text-brand'>{t('totalDue')}</span>
                {/* 🔥 Показываем цену с учетом бонусов */}
                <span
                  className={`text-xl font-bold ${calc.isLoading ? 'opacity-60' : ''}`}
                >
                  {Math.round(serverTotal)} c.
                </span>
                {/* Если есть скидка, показываем старую цену зачеркнутой */}
                {(discount > 0 || promoDiscount > 0) && (
                  <span className='text-xs text-gray-400 line-through'>
                    {cartTotal} c.
                  </span>
                )}
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className='flex-1 bg-brand text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-lg flex flex-col items-center justify-center leading-tight'
              >
                <span>{t('placeOrder')}</span>
                {earnedBonus > 0 && (
                  <span className='text-[10px] font-semibold opacity-90'>+{earnedBonus} {t('bonusShort')}</span>
                )}
              </button>
            </div>
          </div>

          <DrawerCheckout
            sheetOpen={isCheckoutOpen}
            closeSheet={() => setCheckoutOpen(false)}
            orderType={orderType}
            finalTotal={serverTotal}
            deliveryCost={serverDeliveryPrice}
            bonusToApply={bonusToApply}
            showBonusInput={isBonusEnabled}
            availableBonuses={availableBonuses}
            maxDeductible={maxDeductible}
          />
        </>
      )}
    </main>
  );
}
