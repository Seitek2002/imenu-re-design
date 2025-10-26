'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

import { useParams } from 'next/navigation';
import { useBasket } from '@/store/basket';
import { useCreateOrderV2 } from '@/lib/api/queries';
import { useVenueQuery } from '@/store/venue';
import type { OrderCreate } from '@/lib/api/types';
import Header from './_components/Header';

export default function BasketView() {
  // Basket store
  const { getItemsArray, increment, decrement, remove, getSubtotal } =
    useBasket();
  const items = getItemsArray();
  const subtotal = getSubtotal();

  // UI state (local only, no requests)
  const [orderType, setOrderType] = useState<'takeout' | 'dinein' | 'delivery'>(
    'dinein'
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

  // Venue/table context and order mutation
  const { venue, tableId } = useVenueQuery();
  const createOrder = useCreateOrderV2();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  function extractBackendErrorMessage(err: unknown): string {
    const defaultMsg = 'Ошибка при создании заказа';
    try {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as any).message)
          : '';
      const idx = msg.indexOf('- ');
      const raw = idx >= 0 ? msg.slice(idx + 2).trim() : msg.trim();
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.error === 'string') return parsed.error;
        } catch {
          // not JSON
        }
        const m = raw.match(/\{"error"\s*:\s*"([^"]+)"\}/);
        if (m) return m[1];
      }
      return msg || defaultMsg;
    } catch {
      return defaultMsg;
    }
  }

  // venueSlug: prefer localStorage 'venueRoot', fallback to persisted 'venue' store, then route params
  const params = useParams();
  const [venueSlug, setVenueSlug] = useState<string>('');
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fromParams =
      typeof (params as any)?.venue === 'string'
        ? (params as any).venue
        : Array.isArray((params as any)?.venue)
        ? (params as any).venue[0]
        : '';

    const resolveVenueSlug = (): string => {
      try {
        const rawRoot = localStorage.getItem('venueRoot');
        if (rawRoot) {
          let v: string | undefined;
          const trimmed = rawRoot.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            const parsed = JSON.parse(rawRoot);
            v =
              parsed?.slug ??
              parsed?.venueSlug ??
              parsed?.venue_slug ??
              parsed?.venue?.slug ??
              '';
          } else {
            // treat as plain string, possibly like "/ustukan" or "ustukan"
            v = trimmed.split('/').filter(Boolean).pop() ?? trimmed;
          }
          if (typeof v === 'string' && v) return v;
        }
      } catch {}
      try {
        // persisted Zustand store name 'venue' from src/store/venue.ts
        const rawVenue = localStorage.getItem('venue');
        if (rawVenue) {
          const parsed = JSON.parse(rawVenue);
          const st = parsed?.state ?? parsed;
          const v =
            st?.venue?.slug ??
            st?.slug ??
            st?.venueSlug ??
            st?.venue_slug ??
            '';
          if (typeof v === 'string' && v) return v;
        }
      } catch {}
      const fromStore =
        typeof (venue as any)?.slug === 'string' ? (venue as any).slug : '';
      return fromParams || fromStore || '';
    };

    setVenueSlug(resolveVenueSlug());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Map UI order type to API serviceMode
  const serviceMode: 1 | 2 | 3 =
    orderType === 'dinein' ? 1 : orderType === 'delivery' ? 3 : 2;

  // Basic validation for submit enabling
  const isPhoneValid = phone.trim().length >= 5;
  const isAddressValid =
    orderType === 'delivery' ? address.trim().length > 0 : true;
  const canSubmit =
    hydrated &&
    !!venueSlug &&
    items.length > 0 &&
    isPhoneValid &&
    isAddressValid &&
    (orderType !== 'dinein' || !!tableId);

  async function handleSubmit() {
    try {
      setErrorMsg(null);

      if (!venueSlug) {
        setErrorMsg('Не найден venue_slug');
        return;
      }

      // Pre-submit validation per mode:
      // - Always require phone
      // - Additionally require address in "delivery" mode
      const phoneVal = phone.trim();
      if (phoneVal.length < 5) {
        setModal({ open: true, message: 'Укажите номер телефона' });
        return;
      }
      if (orderType === 'delivery' && !address.trim()) {
        setModal({ open: true, message: 'Укажите адрес доставки' });
        return;
      }
      if (orderType === 'dinein' && !tableId) {
        setModal({ open: true, message: 'Не указан номер стола' });
        return;
      }

      // Build items payload
      const orderProducts = items.map((it) => ({
        product: it.productId,
        count: it.quantity,
        modificator: it.modifierId ?? null,
      }));

      // Resolve table and spot
      let tableIdNum: number | null = null;
      if (orderType === 'dinein' && tableId != null) {
        const n =
          typeof tableId === 'string' ? Number.parseInt(tableId, 10) : tableId;
        tableIdNum = Number.isFinite(n as number) ? (n as number) : null;
      }

      const defaultSpotId = (venue as any)?.defaultDeliverySpot ?? null;
      const firstSpotId =
        Array.isArray((venue as any)?.spots) && (venue as any).spots.length > 0
          ? (venue as any).spots[0].id
          : null;
      const spotId = defaultSpotId ?? firstSpotId ?? null;

      const payload: OrderCreate = {
        phone: phone.trim(),
        comment: comment ? comment.trim() : null,
        serviceMode,
        address: orderType === 'delivery' ? address.trim() : null,
        spot: spotId,
        table: tableIdNum,
        orderProducts,
        code: promoCode ? promoCode.trim() : null,
        isTgBot: false,
        useBonus: false,
      };

      const res = await createOrder.mutateAsync({ body: payload, venueSlug });
      console.log('order:create:success', res);
    } catch (e: any) {
      console.error('order:create:error', e);
      const msg = extractBackendErrorMessage(e);
      setErrorMsg(msg);
      setModal({ open: true, message: msg });
    }
  }

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
      <Header />

      <section className='font-inter bg-white pt-4 mt-1.5 px-2 rounded-4xl pb-24 lg:max-w-[1140px] lg:mx-auto'>
        {/* Тип заказа */}
        <div className='bg-[#FAFAFA] rounded-full'>
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
                      className='w-8 h-8 flex items-center justify-center'
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
                      className='w-8 h-8 flex items-center justify-center'
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
        <div className='bg-[#FAFAFA] p-3 rounded-[12px] mt-3'>
          <div className='flex justify-between items-center mb-3'>
            <h4 className='text-base font-semibold'>Ваши данные к заказу</h4>
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{
                display: !isPhoneValid ? 'inline' : 'none',
              }}
            >
              <g clipPath='url(#clip0_55_24324)'>
                <path
                  d='M10.0001 13.3334V10M10.0001 6.66669H10.0084M18.3334 10C18.3334 14.6024 14.6025 18.3334 10.0001 18.3334C5.39771 18.3334 1.66675 14.6024 1.66675 10C1.66675 5.39765 5.39771 1.66669 10.0001 1.66669C14.6025 1.66669 18.3334 5.39765 18.3334 10Z'
                  stroke='#F53527'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </g>
              <defs>
                <clipPath id='clip0_55_24324'>
                  <rect width='20' height='20' fill='white' />
                </clipPath>
              </defs>
            </svg>
          </div>
          <label htmlFor='phone' className='block space-y-1 mb-3'>
            <input
              id='phone'
              type='text'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+996'
              className='w-full h-11 rounded-xl p-4 outline-none border border-[transparent] bg-[#F5F5F5]'
              style={{
                borderColor: isPhoneValid ? '' : 'red',
              }}
            />
          </label>

          {/* Адрес только для "Доставка" */}
          {orderType === 'delivery' && (
            <label htmlFor='address' className='block space-y-1 mb-3'>
              <input
                id='address'
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='Укажите адрес'
                className='w-full h-11 rounded-xl p-4 outline-none focus:border-[#FF7A00] bg-[#F5F5F5]'
                style={{
                  border:
                    orderType === 'delivery' && !isAddressValid
                      ? '1px solid red'
                      : undefined,
                }}
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
              <input
                id='comment'
                type='text'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Комментарий к заказу'
                className='w-full h-11 rounded-xl p-4 outline-none focus:border-[#FF7A00] bg-[#F5F5F5]'
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
          className='w-full h-12 rounded-[12px] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
          style={{ backgroundColor: '#FF7A00' }}
          onClick={handleSubmit}
          disabled={!canSubmit || createOrder.isPending}
          aria-busy={createOrder.isPending}
        >
          {createOrder.isPending ? 'Отправка...' : 'Далее'}
        </button>
      </footer>

      {modal.open && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-xl'>
            <div className='text-base text-[#111111]'>{modal.message}</div>
            <div className='mt-4 flex justify-end'>
              <button
                type='button'
                onClick={() => setModal({ open: false, message: '' })}
                className='h-10 px-4 rounded-[10px] text-white font-semibold'
                style={{ backgroundColor: '#FF7A00' }}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
