'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import arrowIcon from '@/assets/Header/arrow.svg';

export default function Basket() {
  const router = useRouter();

  // UI state (local only, no requests)
  const [orderType, setOrderType] = useState<'takeout' | 'dinein' | 'delivery'>('takeout');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
  }, [detailsOpen, phone, address, comment, promoCode, orderType]);

  return (
    <main className="px-2.5 bg-[#F8F6F7] min-h-[100svh]">
      {/* Local header */}
      <header className="sticky top-0 z-20 bg-white rounded-b-4xl">
        <div className="flex items-center justify-between px-5 pt-2.5 pb-4">
          <Image
            src={arrowIcon}
            width={24}
            height={24}
            alt="Назад"
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h2 className="text-2xl font-semibold">Корзина</h2>
          {/* Placeholder for "очистить корзину" (только UI) */}
          <button
            type="button"
            className="text-[#FF7A00] text-sm font-medium"
            onClick={() => {
              // UI-only: нет действий
            }}
          >
            Очистить
          </button>
        </div>
      </header>

      <section className="font-inter pt-4 pb-24 lg:max-w-[1140px] lg:mx-auto">
        {/* Тип заказа */}
        <div className="bg-white p-3 rounded-[12px]">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'takeout', label: 'Самовывоз' },
              { key: 'dinein', label: 'На месте' },
              { key: 'delivery', label: 'Доставка' },
            ].map((o) => {
              const isActive = orderType === (o.key as typeof orderType);
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setOrderType(o.key as typeof orderType)}
                  className={`h-10 rounded-xl border text-sm transition-colors ${
                    isActive
                      ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FFF4EB]'
                      : 'border-[#E1E2E5] text-[#21201F]'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white p-3 rounded-[12px] mt-3">
          <div className="mb-3">
            <h4 className="text-base font-semibold">Контакты</h4>
          </div>

          <label htmlFor="phone" className="block space-y-1 mb-3">
            <span className="text-[14px]">Номер телефона</span>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+996"
              className="w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white"
            />
          </label>

          {/* Адрес только для "Доставка" */}
          {orderType === 'delivery' && (
            <label htmlFor="address" className="block space-y-1 mb-3">
              <span className="text-[14px]">Адрес доставки</span>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Укажите адрес"
                className="w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white"
              />
            </label>
          )}

          {/* Комментарий: скрыт по умолчанию, показывается по нажатию */}
          {!showCommentInput ? (
            <button
              type="button"
              className="text-[12px] text-[#FF7A00]"
              onClick={() => setShowCommentInput(true)}
            >
              + добавить комментарий
            </button>
          ) : (
            <label htmlFor="comment" className="block space-y-1">
              <span className="text-[14px]">Комментарий</span>
              <input
                id="comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий к заказу"
                className="w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white"
              />
            </label>
          )}
        </div>

        {/* Итого с деталями (раскрытие по нажатию) */}
        <div className="bg-white p-3 rounded-[12px] mt-3">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="w-full flex items-center justify-between text-[#80868B]"
          >
            <span className="text-sm">Детали заказа</span>
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
            className={`overflow-hidden transition-[height] duration-300 ease-in-out divide-y mt-2 rounded-[8px] border border-[#F3F3F3]`}
          >
            <div className="flex items-center justify-between px-3 py-2 text-[#80868B]">
              <span>Сумма товаров</span>
              <span>0 c</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-[#80868B]">
              <span>Сервисный сбор</span>
              <span>0%</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex items-center justify-between px-3 py-2 text-[#80868B]">
                <span>Доставка</span>
                <span>0 c</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1 pt-3">
            <span className="text-sm text-[#80868B]">Итого</span>
            <span className="text-base font-semibold">0 c</span>
          </div>
        </div>

        {/* Промокод: скрыт по умолчанию, показывается по нажатию */}
        <div className="bg-white p-3 rounded-[12px] mt-3">
          {!showPromoInput ? (
            <button
              type="button"
              className="text-[12px] text-[#FF7A00]"
              onClick={() => setShowPromoInput(true)}
            >
              + указать промокод
            </button>
          ) : (
            <label htmlFor="promo" className="block space-y-1">
              <span className="text-[14px]">Промокод</span>
              <input
                id="promo"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Введите промокод"
                className="w-full h-11 rounded-xl border border-[#E1E2E5] px-3 outline-none focus:border-[#FF7A00] bg-white"
              />
            </label>
          )}
        </div>

        {/* Рекомендации/доп. блоки опущены: только верстка зависимости от кликов */}

        {/* Нижняя кнопка (UI only) */}
        <footer className="fixed left-0 right-0 bottom-0 bg-white border-t border-[#E5E7EB] px-4 py-3">
          <button
            type="button"
            className="w-full h-12 rounded-[12px] text-white font-semibold"
            style={{ backgroundColor: '#FF7A00' }}
            onClick={() => {
              // UI-only
            }}
          >
            Далее
          </button>
        </footer>
      </section>
    </main>
  );
}
