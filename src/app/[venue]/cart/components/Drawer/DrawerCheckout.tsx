'use client';

// 🔥 1. Импортируем useCallback
import { FC, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { useCheckout } from '@/store/checkout';
import { useBasketStore } from '@/store/basket';
import { useBonusStore } from '@/store/bonus';
import { useCreateOrderV2 } from '@/lib/api/queries';
import DevErrorModal from '@/components/ui/DevErrorModal';

import DeliveryInputs from '../DeliveryInputs';
import CheckoutForm from '../CheckoutForm';
import PaymentMethodRow from './PaymentMethodRow';
import PaymentModal from './PaymentModal';
import CheckoutFooter from './CheckoutFooter';

import tableIcon from '@/assets/Cart/table.svg';
import { useVenueStore } from '@/store/venue';
import type { Coords } from '@/lib/osm-maps';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
  orderType: 'takeout' | 'delivery' | 'dinein';
  finalTotal: number;
  deliveryCost: number;
}

const DrawerCheckout: FC<IProps> = ({
  sheetOpen,
  closeSheet,
  orderType,
  finalTotal,
}) => {
  const params = useParams();
  const router = useRouter();
  const venueSlug = params.venue as string;
  const t = useTranslations('Cart.drawer');
  const tt = useTranslations('Cart.timePicker');
  const tTable = useTranslations('Cart.table');
  const [sheetAnim, setSheetAnim] = useState(false);

  // --- STORE DATA ---
  const items = useBasketStore((state) => state.items);
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const isBonusUsed = useBonusStore((state) => state.isBonusUsed);
  const bonusAmount = useBonusStore((state) => state.bonusAmount);
  const resetBonus = useBonusStore((state) => state.resetBonus);

  // --- API ---
  const createOrderMutation = useCreateOrderV2();

  const {
    phone: storedPhone,
    setPhone: setStoredPhone,
    address: storedAddress,
    setAddress: setStoredAddress,
    deliveryLat: storedLat,
    deliveryLng: storedLng,
    setDeliveryCoords,
    needUtensils,
    comment,
    resetOrderOptions,
  } = useCheckout();

  // --- FORM STATE ---
  const [phone, setPhone] = useState(storedPhone || '');
  const [address, setAddress] = useState(storedAddress || '');
  const [coords, setCoords] = useState<Coords | null>(
    storedLat != null && storedLng != null
      ? { lat: storedLat, lng: storedLng }
      : null,
  );

  // Достаем нужные ID для бекенда из стора
  const tableNumber = useVenueStore((state) => state.tableNumber);
  const tableId = useVenueStore((state) => state.tableId);
  const spotId = useVenueStore((state) => state.spotId);
  const venueData = useVenueStore((state) => state.data);

  const [deliveryComment, setDeliveryComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'elqr' | 'cash'>('elqr');

  // 🔥 Стейт для времени выдачи, который мы передадим в CheckoutForm
  const [pickupTime, setPickupTime] = useState(tt('asap'));

  // --- UI STATE ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isLoading = createOrderMutation.isPending;
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (sheetOpen) {
      const id = requestAnimationFrame(() => setSheetAnim(true));
      return () => cancelAnimationFrame(id);
    } else {
      const timer = setTimeout(() => setSheetAnim(false), 0);
      return () => clearTimeout(timer);
    }
  }, [sheetOpen]);

  const handlePhoneChange = useCallback(
    (val: string) => {
      let cleanVal = val.replace(/\D/g, '');

      if (cleanVal.startsWith('0')) {
        cleanVal = cleanVal.substring(1);
      }

      if (cleanVal.length > 9) {
        cleanVal = cleanVal.slice(0, 9);
      }

      setPhone(cleanVal);
      setStoredPhone(cleanVal);
    },
    [setStoredPhone],
  );

  const handleAddressChange = useCallback(
    (val: string) => {
      setAddress(val);
      setStoredAddress(val);
    },
    [setStoredAddress],
  );

  const handleCoordsChange = useCallback(
    (c: Coords | null) => {
      setCoords(c);
      setDeliveryCoords(c?.lat ?? null, c?.lng ?? null);
    },
    [setDeliveryCoords],
  );

  const handlePay = async () => {
    if (createOrderMutation.isPending) return;

    if (!phone && orderType !== 'dinein') {
      alert(t('phoneAlertEmpty'));
      return;
    }
    if (orderType !== 'dinein') {
      if (!phone) {
        alert(t('phoneAlertEmpty'));
        return;
      }
      // Проверка на длину
      if (phone.length !== 9) {
        alert(t('phoneAlertLength'));
        return;
      }
    }
    if (orderType === 'delivery' && !address) {
      alert(t('addressAlert'));
      return;
    }

    setStoredPhone(phone);
    if (orderType === 'delivery') {
      setStoredAddress(address);
    }

    setApiError(null);

    try {
      // 🔥 Формируем итоговый комментарий (склеиваем время, комментарий к еде и к доставке)
      const parts: string[] = [];
      if (orderType !== 'dinein') {
        parts.push(t('preparePrefix', { time: pickupTime }));
      }
      if (comment.trim()) {
        parts.push(t('commentPrefix', { text: comment.trim() }));
      }
      if (orderType === 'delivery' && deliveryComment.trim()) {
        parts.push(t('deliveryCommentPrefix', { text: deliveryComment.trim() }));
      }
      const finalComment = parts.join('\n');

      const orderData = {
        phone,
        serviceMode: (orderType === 'dinein'
          ? 1
          : orderType === 'delivery'
            ? 3
            : 2) as 1 | 2 | 3,
        address: orderType === 'delivery' ? address : null,
        ...(orderType === 'delivery' && coords
          ? {
              deliveryLatitude: coords.lat.toFixed(6),
              deliveryLongitude: coords.lng.toFixed(6),
            }
          : {}),
        comment: finalComment,
        needsCutlery: needUtensils,
        // 🔥 Берем реальные spotId и tableId из стора
        spot: spotId || venueData?.spots?.[0]?.id,
        table: tableId || undefined,
        orderProducts: items.map((i) => {
          const flatGroupMods = i.groupSelections
            ?.flatMap((g) =>
              g.items.map((it) => ({ id: it.id, count: it.count })),
            )
            ?.filter((x) => x.count > 0);
          return {
            product: i.id,
            count: i.quantity,
            modificator: i.flatModId ?? null,
            ...(flatGroupMods && flatGroupMods.length > 0
              ? { groupModifications: flatGroupMods }
              : {}),
          };
        }),
        paymentMethod: (paymentMethod === 'cash' ? 1 : 2) as 1 | 2,
        paymentMethods: paymentMethod,
        useBonus: isBonusUsed,
        ...(isBonusUsed && bonusAmount > 0 ? { bonus: bonusAmount } : {}),
      };

      const response = await createOrderMutation.mutateAsync({
        body: orderData,
        venueSlug,
      });

      clearBasket();
      resetOrderOptions();
      resetBonus();

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        closeSheet();
        router.push(`/${venueSlug}/order-status/${response.id}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Payment Error:', error);
      setApiError(error);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-100 ${
        sheetOpen || sheetAnim ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          sheetAnim ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeSheet}
      />

      {/* Mobile: bottom sheet */}
      <div className='lg:hidden absolute inset-x-0 bottom-0 pointer-events-none'>
        <div
          className={`
            w-full bg-[#F5F5F5] overflow-hidden rounded-t-4xl shadow-2xl
            transform transition-transform duration-300 ease-cubic pointer-events-auto
            ${sheetAnim ? 'translate-y-0' : 'translate-y-full'}
          `}
          style={{ height: '95dvh' }}
        >
          <div className='h-full flex flex-col'>
            <div
              className='w-full flex justify-center pt-3 pb-1 shrink-0'
              onClick={closeSheet}
            >
              <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
            </div>

            <div className='flex-1 overflow-y-auto p-4 pb-40 overscroll-contain'>
              <div className='rounded-3xl bg-white p-5 shadow-sm'>
                {orderType === 'dinein' ? (
                  <div className='bg-[#F5F5F5] flex items-center gap-2 rounded-xl py-3 px-4 mb-4'>
                    <Image src={tableIcon} alt='table' width={16} height={16} />
                    <span className='text-[#111111] font-semibold'>
                      {tTable('drawerTable', { num: tableNumber ?? '' })}
                    </span>
                  </div>
                ) : (
                  // 🔥 Передаем стейт времени в CheckoutForm
                  <CheckoutForm
                    orderType={orderType}
                    pickupTime={pickupTime}
                    setPickupTime={setPickupTime}
                  />
                )}

                {orderType === 'delivery' && (
                  <div className='mt-4 border-t border-gray-100 pt-4'>
                    <DeliveryInputs
                      onAddressChange={handleAddressChange}
                      onCoordsChange={handleCoordsChange}
                      initialCoords={coords}
                    />
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('deliveryCommentLabel')}
                      </span>
                      <input
                        type='text'
                        value={deliveryComment}
                        onChange={(e) => setDeliveryComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('deliveryCommentPlaceholder')}
                      />
                    </label>
                  </div>
                )}

                <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-4 py-2 px-4 cursor-text hover:bg-gray-200 transition-colors'>
                  <span className='text-[#A4A4A4] text-xs mb-0.5 font-medium'>
                    {t('phoneLabel')}
                  </span>
                  <div className='flex items-center'>
                    <div className='font-semibold text-[#111111] placeholder-gray-400 text-base'>
                      +996
                    </div>
                    <input
                      type='tel'
                      inputMode='numeric'
                      placeholder='700123456'
                      maxLength={9}
                      minLength={9}
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className='bg-transparent outline-none font-semibold text-[#111111] placeholder-gray-400 text-base'
                    />
                  </div>
                </label>

              </div>

              <div className='mt-3'>
                <PaymentMethodRow
                  method={paymentMethod}
                  onClick={() => setShowPaymentModal(true)}
                />
              </div>
            </div>

            <div className='absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10 pb-8'>
              <CheckoutFooter
                total={finalTotal}
                isSubmitting={isLoading}
                onPay={handlePay}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: centered modal */}
      <div className='hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none'>
        <div
          className={`
            w-full max-w-lg bg-[#F5F5F5] rounded-3xl shadow-2xl overflow-hidden
            transform transition-all duration-300
            ${sheetAnim ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
          `}
          style={{ maxHeight: '90dvh' }}
        >
          <div className='flex flex-col' style={{ maxHeight: '90dvh' }}>
            {/* Header */}
            <div className='flex items-center justify-between px-6 pt-5 pb-3 shrink-0'>
              <h2 className='text-lg font-bold text-[#111111]'>{t('title')}</h2>
              <button
                onClick={closeSheet}
                className='w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors text-[#6B6B6B]'
              >
                ✕
              </button>
            </div>

            <div className='flex-1 overflow-y-auto px-6 pb-6 overscroll-contain'>
              <div className='rounded-3xl bg-white p-5 shadow-sm'>
                {orderType === 'dinein' ? (
                  <div className='bg-[#F5F5F5] flex items-center gap-2 rounded-xl py-3 px-4 mb-4'>
                    <Image src={tableIcon} alt='table' width={16} height={16} />
                    <span className='text-[#111111] font-semibold'>
                      {tTable('drawerTable', { num: tableNumber ?? '' })}
                    </span>
                  </div>
                ) : (
                  <CheckoutForm
                    orderType={orderType}
                    pickupTime={pickupTime}
                    setPickupTime={setPickupTime}
                  />
                )}

                {orderType === 'delivery' && (
                  <div className='mt-4 border-t border-gray-100 pt-4'>
                    <DeliveryInputs
                      onAddressChange={handleAddressChange}
                      onCoordsChange={handleCoordsChange}
                      initialCoords={coords}
                    />
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('deliveryCommentLabel')}
                      </span>
                      <input
                        type='text'
                        value={deliveryComment}
                        onChange={(e) => setDeliveryComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('deliveryCommentPlaceholder')}
                      />
                    </label>
                  </div>
                )}

                <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-4 py-2 px-4 cursor-text hover:bg-gray-200 transition-colors'>
                  <span className='text-[#A4A4A4] text-xs mb-0.5 font-medium'>
                    {t('phoneLabel')}
                  </span>
                  <div className='flex items-center'>
                    <div className='font-semibold text-[#111111] text-base'>+996</div>
                    <input
                      type='tel'
                      inputMode='numeric'
                      placeholder='700123456'
                      maxLength={9}
                      minLength={9}
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className='bg-transparent outline-none font-semibold text-[#111111] placeholder-gray-400 text-base'
                    />
                  </div>
                </label>

              </div>

              <div className='mt-3'>
                <PaymentMethodRow
                  method={paymentMethod}
                  onClick={() => setShowPaymentModal(true)}
                />
              </div>

              <div className='mt-4'>
                <CheckoutFooter
                  total={finalTotal}
                  isSubmitting={isLoading}
                  onPay={handlePay}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        method={paymentMethod}
        onSelect={setPaymentMethod}
      />

      <DevErrorModal
        isOpen={!!apiError}
        onClose={() => setApiError(null)}
        error={apiError}
      />
    </div>
  );
};

export default DrawerCheckout;
