import { FC, useEffect, useState, useRef } from 'react';
import { useBasketTotals } from '@/lib/hooks/use-basket-totals';
import Form from './Form';

import elqr from '@/assets/Basket/Drawer/elqr.svg';
import Image from 'next/image';
import { useCheckout } from '@/store/checkout';
import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';
import tableIcon from '@/assets/Basket/table.svg';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
}

const DrawerCheckout: FC<IProps> = ({ sheetOpen, closeSheet }) => {
  const [sheetAnim, setSheetAnim] = useState(false);

  // Resizable bottom sheet state (in vh)
  const [heightPct, setHeightPct] = useState(70);
  const minPct = 30;
  const maxPct = 92;

  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(70);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const { total } = useBasketTotals();
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
      setHeightPct(70); // reset to default when hiding
    }
  }, [sheetOpen]);

  // Pointer handlers for drag-to-resize
  const onPointerMove = (e: PointerEvent) => {
    // prevent page scroll on mobile while dragging
    if (e.cancelable) e.preventDefault();
    const deltaY = startYRef.current - e.clientY; // up is positive
    const deltaPct = (deltaY / window.innerHeight) * 100;
    const next = clamp(startHeightRef.current + deltaPct, 12, maxPct);
    setHeightPct(next);
  };

  const onPointerUp = (_e: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMove as any);
    window.removeEventListener('pointerup', onPointerUp as any);
    setDragging(false);
    if (heightPct <= minPct) {
      // close if dragged far down
      closeSheet();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Primary pointer only; block native scroll
    // @ts-ignore
    if (typeof e.isPrimary !== 'undefined' && e.isPrimary === false) return;
    e.preventDefault();
    setDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = heightPct;
    // Use window listeners to avoid losing events outside handle
    window.addEventListener('pointermove', onPointerMove as any, {
      passive: false,
    });
    window.addEventListener('pointerup', onPointerUp as any, { passive: true });
  };

  const orderType = useCheckout((s) => s.orderType);
  const selectedSpotId = useCheckout((s) => s.selectedSpotId);
  const address = useCheckout((s) => s.address);
  const setAddress = useCheckout((s) => s.setAddress);
  const pickupMode = useCheckout((s) => s.pickupMode);
  const pickupTime = useCheckout((s) => s.pickupTime);
  const deliveryEntrance = useCheckout((s) => s.deliveryEntrance);
  const setDeliveryEntrance = useCheckout((s) => s.setDeliveryEntrance);
  const deliveryFloor = useCheckout((s) => s.deliveryFloor);
  const setDeliveryFloor = useCheckout((s) => s.setDeliveryFloor);
  const deliveryApartment = useCheckout((s) => s.deliveryApartment);
  const setDeliveryApartment = useCheckout((s) => s.setDeliveryApartment);
  const { venue, tableId, tableNum } = useVenueQuery();
  const displayTable = tableNum ?? tableId;
  const { getItemsArray } = useBasket();
  const itemsArr = getItemsArray();

  // Input validity flags for red borders and shake classes
  const isPhoneInvalid = (phone ?? '').trim().length < 5;
  const needAddress = orderType === 'delivery';
  const isStreetInvalid = needAddress && !(address ?? '').trim();
  const isFloorInvalid = false;

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


  function handlePay() {
    try {
      // Validate required fields before logging/submit:
      // Required: phone; when delivery: street(address) and floor
      const isPhoneValid = (phone ?? '').trim().length >= 5;
      const requireAddress = orderType === 'delivery';
      const isAddressValid = !requireAddress || (address ?? '').trim().length > 0;
      const isFloorValid = true;

      if (!isPhoneValid || !isAddressValid || !isFloorValid) {
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

      const venueSlug = resolveVenueSlug();

      const body = {
        phone: phone.trim(),
        serviceMode,
        address: orderType === 'delivery' ? address.trim() : null,
        comment: comment ? comment.trim() : null,
        spot: spotId,
        table: tableIdNum,
        orderProducts,
        isTgBot: false,
        useBonus: false,
      };

      const effectivePickupTime = pickupMode === 'asap' ? 'Быстрее всего' : pickupTime;
      console.log('order:payload', {
        venueSlug,
        body,
        clientMeta: {
          pickupMode,
          pickupTime: effectivePickupTime, // ASAP shows "Быстрее всего"
          delivery: orderType === 'delivery'
            ? {
                street: address || null,
                entrance: deliveryEntrance || null,
                floor: deliveryFloor || null,
                apartment: deliveryApartment || null,
              }
            : null,
          total,
        },
      });
    } catch (e) {
      // noop
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
        onClick={closeSheet}
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
          style={{ height: `${heightPct}vh` }}
        >
          <div
            className={`fixed -top-8 right-0 left-0 mx-auto h-8 w-full flex items-center justify-center ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            } select-none`}
            onPointerDown={onPointerDown}
            style={{ touchAction: 'none' }}
          >
            <div className='h-1 w-16 rounded-full bg-[#fff]' />
          </div>
          <div className='h-[calc(100%)] overflow-y-auto flex flex-col justify-between'>
            <div>
              <div className='rounded-2xl bg-white p-5'>
                {orderType === 'dinein' ? (
                  <div className='bg-[#F5F5F5] flex items-center gap-2 rounded-lg py-3 px-4 mb-2'>
                    <Image src={tableIcon} alt='table icon' width={16} height={16} />
                    <span className='text-[#111111] font-semibold'>Стол №{displayTable ?? '-'}</span>
                  </div>
                ) : (
                  <Form />
                )}
                {orderType === 'delivery' && (
                  <div className='mt-2'>
                    <label
                      htmlFor='deliveryStreet'
                      className={`bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4 ${shaking && isStreetInvalid ? 'shake-animate' : ''}`}
                      style={{ border: isStreetInvalid ? '1px solid red' : undefined }}
                    >
                      <span className='text-[#A4A4A4] text-[16px]'>Улица</span>
                      <input
                        id='deliveryStreet'
                        type='text'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='bg-transparent'
                        placeholder='Укажите улицу'
                      />
                    </label>
                    <div className='grid grid-cols-3 gap-2 mt-2'>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>Подъезд</span>
                        <input
                          type='text'
                          value={deliveryEntrance}
                          onChange={(e) => setDeliveryEntrance(e.target.value)}
                          className='bg-transparent'
                        />
                      </label>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>Этаж</span>
                        <input
                          type='text'
                          value={deliveryFloor}
                          onChange={(e) => setDeliveryFloor(e.target.value)}
                          className='bg-transparent'
                        />
                      </label>
                      <label className='bg-[#F5F5F5] flex flex-col rounded-lg py-2 px-4'>
                        <span className='text-[#A4A4A4] text-[16px]'>Квартира</span>
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
                  className={`bg-[#F5F5F5] flex flex-col rounded-lg mt-2 py-2 px-4 ${shaking && isPhoneInvalid ? 'shake-animate' : ''}`}
                  style={{ border: isPhoneInvalid ? '1px solid red' : undefined }}
                >
                  <span className='text-[#A4A4A4] text-[16px]'>
                    Номер телефона
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
                  onClick={() => setShowComment((v) => !v)}
                >
                  {showComment ? 'Скрыть комментарий' : '+добавить комментарий к заказу'}
                </button>
                {showComment && (
                  <label
                    htmlFor='orderComment'
                    className='bg-[#F5F5F5] flex flex-col rounded-lg mt-2 py-2 px-4'
                  >
                    <span className='text-[#A4A4A4] text-[16px]'>Комментарий</span>
                    <input
                      id='orderComment'
                      type='text'
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className='bg-transparent'
                      placeholder='Комментарий к заказу'
                    />
                  </label>
                )}
              </div>
              <div className='rounded-2xl bg-white p-5 flex items-center justify-between mt-1'>
                <div className='flex items-center'>
                  <Image src={elqr} alt='elqr' />
                  <span className='text-[14px] font-medium'>ELQR</span>
                </div>
                <span className='text-[14px] font-medium'>
                  Оплата доступна любым банком КР
                </span>
              </div>
            </div>
            <div>
              <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'>
                <div className='total-price'>
                  <div className='font-semibold text-xl'>
                    {Math.round(total * 100) / 100} с
                  </div>
                  <div className='text-[#939393] text-xs'>Итого</div>
                </div>
                  <button
                    className='bg-[#FF8127] py-4 text-white rounded-3xl flex-1 font-medium'
                    onClick={handlePay}
                  >
                  Оплатить
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
