'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import arrowIcon from '@/assets/Header/arrow.svg';
import { useBasket } from '@/store/basket';

export default function BasketView() {
  const router = useRouter();

  // Basket store
  const { getItemsArray, increment, decrement, remove, getSubtotal } =
    useBasket();
  const items = getItemsArray();
  const subtotal = getSubtotal();

  // UI state (local only, no requests)
  const [orderType, setOrderType] = useState<'takeout' | 'dinein' | 'delivery'>(
    'takeout'
  );
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Hydration guard to avoid SSR/CSR mismatch with persisted store
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Inputs (no validation logic per request)
  const [phone, setPhone] = useState('+996');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Smooth expand/collapse for "Итого (детали)" block
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [detailsHeight, setDetailsHeight] = useState(0);
  useEffect(() => {
    if (detailsOpen) {
      const h = detailsRef.current?.scrollHeight ?? 0;
      setDetailsHeight(h);
    } else {
      setDetailsHeight(0);
    }
  }, [
    detailsOpen,
    phone,
    address,
    comment,
    promoCode,
    orderType,
    subtotal,
    items.length,
  ]);

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-[100svh] pb-20'>
      {/* Local header */}
      <header className='sticky top-0 z-20 bg-white rounded-b-4xl'>
        <div className='flex items-center justify-between px-5 pt-2.5 pb-4'>
          <Image
            src={arrowIcon}
            width={24}
            height={24}
            alt='Назад'
            className='cursor-pointer'
            onClick={() => router.back()}
          />
          <h2 className='text-2xl font-semibold'>Корзина</h2>
          {/* Placeholder for "очистить корзину" (только UI) */}
          <button
            type='button'
            className='text-[#FF7A00] text-sm font-medium'
            onClick={() => {
              // UI-only: нет действий
            }}
          >
            Очистить
          </button>
        </div>
      </header>

      <section className='font-inter bg-white pt-4 mt-1.5 rounded-4xl pb-24 lg:max-w-[1140px] lg:mx-auto'>
        {/* Тип заказа */}
        <div className='bg-[#FAFAFA] rounded-[12px]'>
          <div className='grid grid-cols-2 gap-2 p-1'>
            {[
              { key: 'dinein', label: 'На месте' },
              { key: 'delivery', label: 'Доставка' },
            ].map((o) => {
              const isActive = orderType === (o.key as typeof orderType);
              return (
                <button
                  key={o.key}
                  onClick={() => setOrderType(o.key as typeof orderType)}
                  className={`py-2 rounded-full text-sm transition-colors ${
                    isActive
                      ? 'text-[#111111] bg-[#EFEEEC] font-semibold'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Список товаров из корзины */}
        <div className='bg-white p-3 rounded-[12px] mt-3'>
          {/* <h4 className='text-base font-semibold mb-3'>Товары</h4> */}

          {!hydrated ? (
            // Render the same placeholder that SSR rendered to avoid mismatch
            <div className='text-sm text-[#80868B]'>Корзина пуста</div>
          ) : items.length === 0 ? (
            <div className='text-sm text-[#80868B]'>Корзина пуста</div>
          ) : (
            <ul className='space-y-3'>
              {items.map((it) => (
                <li
                  key={it.key}
                  className='flex items-center justify-between gap-3'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='relative w-16 h-16 rounded-[12px] overflow-hidden bg-[#F1F2F3] flex-shrink-0'>
                      {it.image ? (
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          className='object-cover'
                          sizes='64px'
                        />
                      ) : (
                        <Image
                          src='/placeholder-dish.svg'
                          alt='placeholder'
                          fill
                          className='object-cover'
                          sizes='64px'
                        />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-sm font-semibold text-[#21201F] truncate'>
                        {it.name}
                      </div>
                      {it.modifierName && (
                        <div className='text-xs text-[#80868B] truncate'>
                          {it.modifierName}
                        </div>
                      )}
                      <div className='text-sm text-[#21201F] mt-1'>
                        {Math.round(it.unitPrice * it.quantity * 100) / 100} c
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 bg-[#EFEEEC] rounded-full'>
                    <button
                      type='button'
                      aria-label='minus'
                      className='w-8 h-8 rounded-full bg-[#F1F2F3] flex items-center justify-center'
                      onClick={() =>
                        decrement(it.productId, it.modifierId ?? null, 1)
                      }
                    >
                      −
                    </button>
                    <span className='w-6 text-center font-semibold'>
                      {it.quantity}
                    </span>
                    <button
                      type='button'
                      aria-label='plus'
                      className='w-8 h-8 rounded-full bg-[#F1F2F3] flex items-center justify-center'
                      onClick={() =>
                        increment(it.productId, it.modifierId ?? null, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Итого с деталями (раскрытие по нажатию) */}
        <div className='bg-[#FAFAFA] p-3 rounded-[12px] mt-3'>
          <button
            type='button'
            onClick={() => setDetailsOpen((v) => !v)}
            className='w-full flex items-center justify-between text-[#80868B]'
          >
            <span className='text-sm'>Детали заказа</span>
            <span
              className={`inline-block transition-transform duration-300 ${
                detailsOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              ▲
            </span>
          </button>

          <div
            ref={detailsRef}
            style={{ height: `${detailsHeight}px` }}
            className='overflow-hidden transition-[height] duration-300 ease-in-out divide-y mt-2 rounded-[8px] border-[#F3F3F3]'
          >
            <div className='flex items-center justify-between px-3 py-2 text-[#80868B]'>
              <span>Сумма товаров</span>
              <span>{hydrated ? Math.round(subtotal * 100) / 100 : 0} c</span>
            </div>
            <div className='flex items-center justify-between px-3 py-2 text-[#80868B]'>
              <span>Сервисный сбор</span>
              <span>0%</span>
            </div>
            {orderType === 'delivery' && (
              <div className='flex items-center justify-between px-3 py-2 text-[#80868B]'>
                <span>Доставка</span>
                <span>0 c</span>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between px-1 pt-3'>
            <span className='text-sm text-[#80868B]'>Итого</span>
            <span className='text-base font-semibold'>
              {hydrated ? Math.round(subtotal * 100) / 100 : 0} c
            </span>
          </div>
        </div>

        {/* Контакты */}
        <div className='bg-white p-3 rounded-[12px] mt-3'>
          <label htmlFor='phone' className='block space-y-1 mb-3'>
            <span className='text-[14px]'>Номер телефона</span>
            <input
              id='phone'
              type='text'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+996'
              className='w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white'
            />
          </label>

          {/* Адрес только для "Доставка" */}
          {orderType === 'delivery' && (
            <label htmlFor='address' className='block space-y-1 mb-3'>
              <span className='text-[14px]'>Адрес доставки</span>
              <input
                id='address'
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='Укажите адрес'
                className='w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white'
              />
            </label>
          )}

          {/* Комментарий: скрыт по умолчанию, показывается по нажатию */}
          {!showCommentInput ? (
            <button
              type='button'
              className='text-[12px] text-[#FF7A00]'
              onClick={() => setShowCommentInput(true)}
            >
              + добавить комментарий
            </button>
          ) : (
            <label htmlFor='comment' className='block space-y-1'>
              <span className='text-[14px]'>Комментарий</span>
              <input
                id='comment'
                type='text'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Комментарий к заказу'
                className='w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white'
              />
            </label>
          )}
        </div>

        {/* Промокод: скрыт по умолчанию, показывается по нажатию */}
        <div className='bg-white p-3 rounded-[12px] mt-3'>
          {!showPromoInput ? (
            <button
              type='button'
              className='text-[12px] text-[#FF7A00]'
              onClick={() => setShowPromoInput(true)}
            >
              + указать промокод
            </button>
          ) : (
            <label htmlFor='promo' className='block space-y-1'>
              <span className='text-[14px]'>Промокод</span>
              <input
                id='promo'
                type='text'
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder='Введите промокод'
                className='w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white'
              />
            </label>
          )}
        </div>
      </section>

      {/* Нижняя кнопка (UI only) */}
      <footer className='bg-white border-t border-[#E5E7EB] px-4 py-3 mt-4'>
        <button
          type='button'
          className='w-full h-12 rounded-[12px] text-white font-semibold'
          style={{ backgroundColor: '#FF7A00' }}
          onClick={() => {
            // UI-only
          }}
        >
          Далее
        </button>
      </footer>
    </main>
  );
}
