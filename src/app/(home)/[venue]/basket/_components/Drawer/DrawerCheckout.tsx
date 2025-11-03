'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { useBasketTotals } from '@/lib/hooks/use-basket-totals';
import Form from './Form';

import elqr from '@/assets/Basket/Drawer/elqr.svg';
import Image from 'next/image';
import { useCheckout } from '@/store/checkout';
import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';
import tableIcon from '@/assets/Basket/table.svg';
import { useTranslation } from 'react-i18next';
import { useCreateOrderV2 } from '@/lib/api/queries';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
}

const DrawerCheckout: FC<IProps> = ({ sheetOpen, closeSheet }) => {
  const [sheetAnim, setSheetAnim] = useState(false);

  // Simple swipe-to-close down gesture (no resizing)
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const SWIPE_CLOSE_THRESHOLD = 60;

  const { total } = useBasketTotals();
  const { t } = useTranslation();
  const createOrder = useCreateOrderV2();
  const isSubmitting = createOrder.isPending;
  const phone = useCheckout((s) => s.phone);
  const setPhone = useCheckout((s) => s.setPhone);
  const bumpShake = useCheckout((s) => s.bumpShake);
  const shakeKey = useCheckout((s) => s.shakeKey);
  const [shaking, setShaking] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // trigger per-input shake for 500ms whenever bumpShake is called
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 500);
    return () => clearTimeout(t);
  }, [shakeKey]);

  useEffect(() => {
    if (sheetOpen) {
      const id = requestAnimationFrame(() => setSheetAnim(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSheetAnim(false);
      setDragging(false);
    }
  }, [sheetOpen]);

  // onPointerMove removed: swipe-to-close is handled on pointerup using start Y only

  const handleStart = (y: number) => {
    setDragging(true);
    startYRef.current = y;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // @ts-ignore
    if (typeof e.isPrimary !== 'undefined' && e.isPrimary === false) return;
    handleStart(e.clientY);
  };
  const handleEnd = (y: number) => {
    setDragging(false);
    const deltaDown = y - startYRef.current;
    if (deltaDown > SWIPE_CLOSE_THRESHOLD) {
      closeSheet();
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    handleEnd(e.clientY);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    const y = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
    handleStart(y);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const y =
      e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0;
    handleEnd(y);
  };
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientY);
  const onMouseUp = (e: React.MouseEvent) => handleEnd(e.clientY);

  const orderType = useCheckout((s) => s.orderType);
  const selectedSpotId = useCheckout((s) => s.selectedSpotId);
  const address = useCheckout((s) => s.address);
  const setAddress = useCheckout((s) => s.setAddress);
  const pickupMode = useCheckout((s) => s.pickupMode);
  const pickupTime = useCheckout((s) => s.pickupTime);
  const deliveryEntrance = useCheckout((s) => s.setDeliveryEntrance);
  const deliveryEntranceVal = useCheckout((s) => s.deliveryEntrance);
  const deliveryFloor = useCheckout((s) => s.deliveryFloor);
  const setDeliveryFloor = useCheckout((s) => s.setDeliveryFloor);
  const deliveryApartment = useCheckout((s) => s.deliveryApartment);
  const setDeliveryApartment = useCheckout((s) => s.setDeliveryApartment);
  const { venue, tableId, tableNum } = useVenueQuery();
  const displayTable = tableNum ?? tableId;
  const { getItemsArray, clear } = useBasket();
  const itemsArr = getItemsArray();

  // Input validity flags for red borders and shake classes
  const isPhoneInvalid = (phone ?? '').trim().length < 5;
  const needAddress = orderType === 'delivery';
  const isStreetInvalid = needAddress && !(address ?? '').trim();
  const isFloorInvalid = false; // этаж необязателен

  const serviceMode: 1 | 2 | 3 =
    orderType === 'dinein' ? 1 : orderType === 'delivery' ? 3 : 2;

  function resolveVenueSlug(): string {
    const slug = (venue as any)?.slug;
    if (typeof slug === 'string' && slug) return slug;
    try {
      const rawRoot = localStorage.getItem('venueRoot');
      if (rawRoot) {
        const trimmed = rawRoot.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(rawRoot);
          const s =
            parsed?.slug ??
            parsed?.venueSlug ??
            parsed?.venue_slug ??
            parsed?.venue?.slug ??
            '';
          if (s) return s;
        } else {
          const s = trimmed.split('/').filter(Boolean).pop() ?? '';
          if (s) return s;
        }
      }
    } catch {}
    return '';
  }

  async function handlePay() {
    try {
      const isPhoneValid = (phone ?? '').trim().length >= 5;
      const requireAddress = orderType === 'delivery';
      const isAddressValid =
        !requireAddress || (address ?? '').trim().length > 0;

      if (!isPhoneValid || !isAddressValid) {
        try {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([80, 80, 120]);
          }
        } catch {}
        bumpShake();
        return;
      }
      const orderProducts = itemsArr.map((it: any) => ({
        product: it.productId,
        count: it.quantity,
        modificator: it.modifierId ?? null,
      }));
      if (!orderProducts.length) {
        bumpShake();
        console.error('order:create:validation', 'orderProducts is empty');
        return;
      }

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
      const spotId = selectedSpotId ?? defaultSpotId ?? firstSpotId ?? null;

      const entranceStr =
        deliveryEntranceVal && deliveryEntranceVal.trim()
          ? deliveryEntranceVal.trim()
          : t('notSpecified');
      const floorStr =
        deliveryFloor && String(deliveryFloor).trim()
          ? String(deliveryFloor).trim()
          : t('notSpecified');
      const apartmentStr =
        deliveryApartment && String(deliveryApartment).trim()
          ? String(deliveryApartment).trim()
          : t('notSpecified');
      const timeStr =
        pickupMode === 'asap' || !pickupTime ? t('asap') : pickupTime!;
      const addressString = `Адрес: ${
        (address ?? '').trim() || t('notSpecified')
      } | Подъезд: ${entranceStr} | Этаж: ${floorStr} | Квартира: ${apartmentStr} | Время: ${timeStr}`;

      const venueSlug = resolveVenueSlug();

      const body = {
        phone: phone.trim(),
        serviceMode,
        address: orderType === 'delivery' ? addressString : null,
        comment: comment ? comment.trim() : null,
        spot: spotId,
        table: tableIdNum,
        orderProducts,
        isTgBot: false,
        useBonus: false,
      };

      // Debug: log exact payload we send (must include orderProducts array)
      console.log('order:payload', body);

      // Send request to server and log response (OrderCreate readOnly fields expected)
      const resp = await createOrder.mutateAsync({ body, venueSlug });
      console.log('order:create:success', resp);
      try {
        const url = (resp as any)?.paymentUrl;
        if (typeof window !== 'undefined' && url && typeof url === 'string') {
          try {
            // Очистка корзины перед переходом на оплату
            clear();
          } catch {}
          window.location.assign(url);
        }
      } catch {}
    } catch (e: any) {
      console.error('order:create:error', e?.message || e);
      try {
        const msg = typeof e?.message === 'string' ? e.message : '';
        const idx = msg.indexOf('- ');
        const raw = idx >= 0 ? msg.slice(idx + 2).trim() : msg.trim();
        if (raw) console.error('order:create:error:raw', raw);
      } catch {}
    }
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      className={`fixed inset-0 z-50 ${
        sheetOpen || sheetAnim ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          sheetAnim ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(50);
          closeSheet();
        }}
      />
      {/* Sheet */}
      <div
        className='absolute inset-x-0 bottom-0'
        aria-label='Checkout bottom sheet'
      >
        <div
          className={`w-full bg-[#F5F5F5] rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out ${
            sheetAnim
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          } ${dragging ? 'cursor-grabbing' : ''}`}
          data-total={total}
          style={{ height: '70vh', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {/* Drag handle removed: swipe-to-close works on the entire block */}
          <div className='h-auto overflow-y-auto flex flex-col justify-between'>
            <div>
              <div className='rounded-2xl bg-white p-5'>
                {orderType === 'dinein' ? (
                  <div className='bg-[#F5F5F5] flex items-center gap-2 rounded-lg py-3 px-4 mb-2'>
                    <Image
                      src={tableIcon}
                      alt='table icon'
                      width={16}
                      height={16}
                    />
                    <span className='text-[#111111] font-semibold'>
                      {t('tableLabel', { num: displayTable ?? '-' })}
                    </span>
                  </div>
                ) : (
                  <Form />
                )}
                {orderType === 'delivery' && (
                  <div className='mt-2'>
                    <label
                      htmlFor='deliveryStreet'
                      className={`bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4 ${
                        shaking && isStreetInvalid ? 'shake-animate' : ''
                      }`}
                      style={{
                        border: isStreetInvalid ? '1px solid red' : undefined,
                      }}
                    >
                      <span className='text-[#A4A4A4] text-[16px]'>
                        {t('street')}
                      </span>
                      <input
                        id='deliveryStreet'
                        type='text'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='bg-transparent'
                        placeholder={t('enterStreet')}
                      />
                    </label>
                    <div className='grid grid-cols-3 gap-2 mt-2'>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>
                          {t('entrance')}
                        </span>
                        <input
                          type='text'
                          onChange={(e) => deliveryEntrance(e.target.value)}
                          className='bg-transparent'
                        />
                      </label>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>
                          {t('floor')}
                        </span>
                        <input
                          type='text'
                          value={deliveryFloor}
                          onChange={(e) => setDeliveryFloor(e.target.value)}
                          className='bg-transparent'
                        />
                      </label>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>
                          {t('apartment')}
                        </span>
                        <input
                          type='text'
                          value={deliveryApartment}
                          onChange={(e) => setDeliveryApartment(e.target.value)}
                          className='bg-transparent'
                        />
                      </label>
                    </div>
                  </div>
                )}
                <label
                  htmlFor='phoneNumber'
                  className={`bg-[#F5F5F5] flex flex-col rounded-lg mt-2 py-2 px-4 ${
                    shaking && isPhoneInvalid ? 'shake-animate' : ''
                  }`}
                  style={{
                    border: isPhoneInvalid ? '1px solid red' : undefined,
                  }}
                >
                  <span className='text-[#A4A4A4] text-[16px]'>
                    {t('phoneNumber')}
                  </span>
                  <input
                    id='phoneNumber'
                    type='text'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='bg-transparent'
                  />
                </label>
                <button
                  type='button'
                  className='text-[#FF8128] text-[16px] font-medium mt-2'
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    setShowComment((v) => !v);
                  }}
                >
                  {showComment ? t('hideComment') : t('addComment')}
                </button>
                {showComment && (
                  <label
                    htmlFor='orderComment'
                    className='bg-[#F5F5F5] flex flex-col rounded-lg mt-2 py-2 px-4'
                  >
                    <span className='text-[#A4A4A4] text-[16px]'>
                      {t('comment')}
                    </span>
                    <input
                      id='orderComment'
                      type='text'
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className='bg-transparent'
                      placeholder={t('orderCommentPlaceholder')}
                    />
                  </label>
                )}
              </div>
              <div className='rounded-2xl bg-white p-5 flex items-center justify-between mt-1'>
                <div className='flex items-center'>
                  <Image src={elqr} alt='elqr' />
                  <span className='text-[14px] font-medium'>ELQR</span>
                </div>
                <span className='text-[14px] font-medium'>{t('elqrInfo')}</span>
              </div>
            </div>
            <div>
              <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'>
                <div className='total-price'>
                  <div className='font-semibold text-xl'>
                    {Math.round(total * 100) / 100} с
                  </div>
                  <div className='text-[#939393] text-xs'>{t('total')}</div>
                </div>
                <button
                  className={`bg-[#FF8127] py-4 text-white rounded-3xl flex-1 font-medium disabled:opacity-70 disabled:cursor-not-allowed`}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    handlePay();
                  }}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className='inline-flex items-center gap-2'>
                      {t('loading')}
                      <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent' />
                    </span>
                  ) : (
                    t('pay')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawerCheckout;
