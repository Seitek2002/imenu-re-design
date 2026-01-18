'use client';

import { useState } from 'react';
import Image from 'next/image';

// Сторы и API
import { useCheckout } from '@/store/checkout';
import { useBonusStore } from '@/store/bonus';
import { useClientBonus } from '@/lib/api/queries';

// Ассеты
import arrow from '@/assets/Cart/details-arrow.svg';
import coinIcon from '@/assets/Widgets/widget-2.png'; // Возьмем монетку из виджетов
import { useVenueStore } from '@/store/venue';

interface Props {
  subtotal: number;
  deliveryType: 'takeout' | 'delivery';
  deliveryCost: number; // Добавил пропсом, чтобы было явно
}

export default function OrderSummary({
  subtotal,
  deliveryType,
  deliveryCost,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Данные для бонусов
  const venue = useVenueStore((state) => state.data);
  const { phone } = useCheckout();
  const { data: bonusData } = useClientBonus({ phone, venueSlug: venue?.slug ?? '' });

  // 2. Управление переключателем
  const { isBonusUsed, toggleBonus } = useBonusStore();

  // 3. Расчеты
  const availableBonuses = bonusData?.bonus ?? 0;

  // Правило: списываем не больше 50% от суммы товаров (без доставки)
  const maxDeductible = Math.min(availableBonuses, subtotal * 0.5);

  // Реальная скидка (если переключатель включен)
  const discount = isBonusUsed ? maxDeductible : 0;

  // Итоговая сумма
  const finalTotal =
    subtotal + (deliveryType === 'delivery' ? deliveryCost : 0) - discount;

  return (
    <div className='bg-[#FAFAFA] p-3 rounded-xl mt-3'>
      {/* Заголовок */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-[#80868B]'
      >
        <span className='text-base font-medium'>Детали заказа</span>
        <span
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <Image src={arrow} alt='toggle' />
        </span>
      </button>

      {/* Выпадающий контент */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='flex flex-col gap-2 pb-1'>
            {/* Товары */}
            <div className='flex justify-between text-[#80868B]'>
              <span>Сумма товаров</span>
              <span>{subtotal} c.</span>
            </div>

            {/* Доставка */}
            {deliveryType === 'delivery' && (
              <div className='flex justify-between text-[#80868B]'>
                <span>Доставка</span>
                <span>{deliveryCost} c.</span>
              </div>
            )}

            {/* 🔥 БЛОК БОНУСОВ (Показываем только если есть баллы) */}
            {availableBonuses > 0 && (
              <div className='mt-2 bg-white rounded-lg p-3 border border-brand/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {/* Монетка */}
                    <Image
                      src={coinIcon}
                      alt='bonus'
                      width={20}
                      height={20}
                      className='object-contain'
                    />
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold text-[#111] leading-tight'>
                        Списать баллы
                      </span>
                      <span className='text-[10px] text-gray-500'>
                        Доступно: {availableBonuses}
                      </span>
                    </div>
                  </div>

                  {/* Переключатель (Toggle) */}
                  <button
                    type='button'
                    onClick={toggleBonus}
                    className={`
                      relative w-10 h-6 rounded-full transition-colors duration-300
                      ${isBonusUsed ? 'bg-brand' : 'bg-gray-200'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300
                        ${isBonusUsed ? 'translate-x-4' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {/* Если включено — показываем сколько спишется */}
                {isBonusUsed && (
                  <div className='mt-2 text-xs text-brand font-medium border-t border-dashed border-gray-200 pt-2 flex justify-between'>
                    <span>Скидка:</span>
                    <span>- {Math.round(discount)} c.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ИТОГО */}
          <div className='border-t border-[#E7E7E7] mt-3 pt-2 flex justify-between font-bold text-[#21201F] text-lg'>
            <span>Итого</span>
            <span>{Math.max(0, finalTotal)} c.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
