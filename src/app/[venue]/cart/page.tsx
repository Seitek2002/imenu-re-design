'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/app/components/Header';
import OrderSummary from './components/OrderSummary';
import { useCartLogic } from '@/hooks/useCartLogic';
import BasketItem from './components/BasketItem';

import { useBonusStore } from '@/store/bonus';
import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import { useClientBonus } from '@/lib/api/queries';
import TableBadge from './components/TableBadge';
import UtensilsSelector from './components/UtensilsSelector';

// Ленивая загрузка
const DrawerCheckout = dynamic(
  () => import('./components/Drawer/DrawerCheckout'),
  { ssr: false },
);

export default function BasketPage() {
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
  console.log(orderType);

  // --- 🔥 ЛОГИКА БОНУСОВ (Копия из OrderSummary для синхронизации) ---
  const { isBonusUsed } = useBonusStore();
  const { phone } = useCheckout();
  const venue = useVenueStore((state) => state.data);
  const { data: bonusData } = useClientBonus({
    phone,
    venueSlug: venue?.slug ?? '',
  });

  const availableBonuses = bonusData?.bonus ?? 0;
  const maxDeductible = Math.min(availableBonuses, subtotal * 0.5);
  const discount = isBonusUsed ? maxDeductible : 0;

  // Итоговая цена для Футера и Дровера
  const finalDisplayTotal = Math.max(0, cartTotal - discount);
  // ------------------------------------------------------------------
  const tableNumber = useVenueStore((state) => state.tableNumber);

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-screen pb-32'>
      <Header title='Корзина' />

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
              С собой
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-2 rounded-full text-sm transition-all ${
                orderType === 'delivery'
                  ? 'bg-white text-[#111111] font-bold shadow-sm'
                  : 'text-[#6B6B6B]'
              }`}
            >
              Доставка
            </button>
          </div>
        )}

        {/* List */}
        {items.length === 0 ? (
          <EmptyBasket />
        ) : (
          <div className='flex flex-col'>
            <ul className='divide-y divide-[#E7E7E7]'>
              {items.map((item) => (
                <BasketItem
                  key={item.key}
                  item={item}
                  onIncrement={() => handleIncrement(item.key)}
                  onDecrement={() => handleDecrement(item.key)}
                  onRemove={() => handleRemove(item.key)}
                />
              ))}
            </ul>

            {orderType === 'delivery' && (
              <UtensilsSelector className='mt-3' />
            )}

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
                <span className='text-xs text-brand'>Итого к оплате</span>
                {/* 🔥 Показываем цену с учетом бонусов */}
                <span className='text-xl font-bold'>
                  {Math.round(finalDisplayTotal)} c.
                </span>
                {/* Если есть скидка, можно показать старую цену зачеркнутой */}
                {isBonusUsed && discount > 0 && (
                  <span className='text-xs text-gray-400 line-through'>
                    {cartTotal} c.
                  </span>
                )}
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className='flex-1 bg-brand text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-lg'
              >
                Оформить заказ
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

function EmptyBasket() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='text-6xl mb-4'>🛒</div>
      <h3 className='text-lg font-bold text-[#21201F]'>Корзина пуста</h3>
      <p className='text-gray-400 text-sm mt-1'>
        Добавьте что-нибудь вкусное из меню
      </p>
    </div>
  );
}
