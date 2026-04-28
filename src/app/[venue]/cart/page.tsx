'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Header from '@/app/components/Header';
import OrderSummary from './components/OrderSummary';
import { useCartLogic } from '@/hooks/useCartLogic';
import BasketItem from './components/BasketItem';

import { useBonusStore } from '@/store/bonus';
import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import {
  useClientBonus,
  usePromotionsV2,
  useVenueProducts,
} from '@/lib/api/queries';
import { pickAppliedPromotion } from '@/lib/promotions';
import TableBadge from './components/TableBadge';
import UtensilsSelector from './components/UtensilsSelector';
import EmptyBasket from './components/EmptyBasket';

// Ленивая загрузка
const DrawerCheckout = dynamic(
  () => import('./components/Drawer/DrawerCheckout'),
  { ssr: false },
);

export default function BasketPage() {
  const t = useTranslations('Cart');
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
  } = useCartLogic();

  // Локальный UI стейт шторки
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  // --- 🔥 ЛОГИКА БОНУСОВ (Копия из OrderSummary для синхронизации) ---
  const { isBonusUsed, bonusAmount } = useBonusStore();
  const { phone, comment, setComment } = useCheckout();
  const venue = useVenueStore((state) => state.data);
  const spotId = useVenueStore((state) => state.spotId);
  const { data: bonusData } = useClientBonus({
    phone,
    venueSlug: venue?.slug ?? '',
  });

  const availableBonuses = bonusData?.bonus ?? 0;
  const maxDeductible = Math.floor(Math.min(availableBonuses, subtotal * 0.5));
  const discount = isBonusUsed
    ? Math.min(Math.max(0, bonusAmount), maxDeductible)
    : 0;

  // --- Авто-промо (та же логика, что в OrderSummary) ---
  const { data: promotions } = usePromotionsV2(venue?.slug, spotId);
  const { data: productsCatalog } = useVenueProducts(venue?.slug, spotId);
  const applied = pickAppliedPromotion(promotions, items, productsCatalog);
  const promoDiscount = applied?.discount.amount ?? 0;

  // Итоговая цена для Футера и Дровера
  const finalDisplayTotal = Math.max(0, cartTotal - discount - promoDiscount);
  // ------------------------------------------------------------------
  const tableNumber = useVenueStore((state) => state.tableNumber);

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-screen pb-32'>
      <Header title={t('title')} />

      <section className='bg-white pt-4 mt-1.5 px-2 rounded-4xl pb-5 lg:max-w-md lg:mx-auto shadow-sm min-h-[60vh]'>
        {/* Toggle */}
        {tableNumber ? (
          <TableBadge tableNumber={tableNumber} />
        ) : (
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
                const isInvolved =
                  applied?.discount.involvedItemKeys.includes(item.key) ??
                  false;
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

            {orderType === 'delivery' && (
              <UtensilsSelector className='mt-3' />
            )}

            <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4 cursor-text'>
              <span className='text-[#A4A4A4] text-xs mb-1 font-medium'>
                {t('drawer.commentLabel')}
              </span>
              <input
                type='text'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                placeholder={t('drawer.commentPlaceholder')}
              />
            </label>

            <OrderSummary
              deliveryCost={deliveryPrice}
              subtotal={subtotal}
              deliveryType={orderType}
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
                <span className='text-xl font-bold'>
                  {Math.round(finalDisplayTotal)} c.
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
                className='flex-1 bg-brand text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-lg'
              >
                {t('placeOrder')}
              </button>
            </div>
          </div>

          <DrawerCheckout
            sheetOpen={isCheckoutOpen}
            closeSheet={() => setCheckoutOpen(false)}
            orderType={orderType}
            finalTotal={finalDisplayTotal} // 🔥 Передаем правильную сумму
            deliveryCost={deliveryPrice}
          />
        </>
      )}
    </main>
  );
}
