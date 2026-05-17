'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

import { useCheckout } from '@/store/checkout';
import { useBasketStore } from '@/store/basket';
import { useBonusStore } from '@/store/bonus';
import { useCreateOrderV2 } from '@/lib/api/queries';
import DevErrorModal from '@/components/ui/DevErrorModal';
import Toast from '@/components/ui/Toast';
import OtpModal from '@/components/ui/OtpModal';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import { getCountryById } from '@/lib/helpers/countryCodes';
import { normalizePhoneForApi } from '@/lib/helpers/phone';
import { buildOrderRedirectUrl } from '@/lib/config';
import { parseApiError } from '@/lib/apiErrors';

import { useClientStore } from '@/store/client';
import { savePendingPayment } from '@/lib/payment-link-store';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';
import DeliveryInputs from '../DeliveryInputs';
import CheckoutForm from '../CheckoutForm';
import PaymentMethodRow from './PaymentMethodRow';
import PaymentModal from './PaymentModal';
import CheckoutFooter from './CheckoutFooter';

import tableIcon from '@/assets/Cart/table.svg';
import { useVenueStore } from '@/store/venue';
import type { Coords } from '@/lib/osm-maps';
import type { OrderCreateBody } from '@/lib/order';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
  orderType: 'takeout' | 'delivery' | 'dinein';
  finalTotal: number;
  deliveryCost: number;
  bonusToApply: number;
  showBonusInput?: boolean;
  availableBonuses?: number;
  maxDeductible?: number;
}

const DrawerCheckout: FC<IProps> = ({
  sheetOpen,
  closeSheet,
  orderType,
  finalTotal,
  bonusToApply,
  showBonusInput = false,
  availableBonuses = 0,
  maxDeductible = 0,
}) => {
  const params = useParams();
  const router = useRouter();
  const venueSlug = params.venue as string;
  const t = useTranslations('Cart.drawer');
  const tt = useTranslations('Cart.timePicker');
  const tTable = useTranslations('Cart.table');
  const tErr = useTranslations('Cart.errors');
  const [sheetAnim, setSheetAnim] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const { dragY, onTouchStart: handleDragStart, onTouchMove: handleDragMove, onTouchEnd: handleDragEnd, onTouchCancel: handleDragCancel, backdropOpacity, sheetStyle } =
    useSwipeToDismiss(closeSheet);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // --- STORE DATA ---
  const items = useBasketStore((state) => state.items);
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const isBonusUsed = useBonusStore((state) => state.isBonusUsed);
  const bonusAmount = useBonusStore((state) => state.bonusAmount);
  const setBonusUsed = useBonusStore((state) => state.setBonusUsed);
  const setBonusAmount = useBonusStore((state) => state.setBonusAmount);
  const resetBonus = useBonusStore((state) => state.resetBonus);

  const queryClient = useQueryClient();

  // --- API ---
  const createOrderMutation = useCreateOrderV2();
  const saveClient = useClientStore((s) => s.saveClient);

  const {
    phone: storedPhone,
    setPhone: setStoredPhone,
    countryId: storedCountryId,
    setCountryId: setStoredCountryId,
    address: storedAddress,
    setAddress: setStoredAddress,
    deliveryLat: storedLat,
    deliveryLng: storedLng,
    setDeliveryCoords,
    needUtensils,
    comment,
    setComment,
    deliveryComment,
    setDeliveryComment,
    pickupComment,
    setPickupComment,
    resetOrderOptions,
  } = useCheckout();

  // --- FORM STATE ---
  const [showDeliveryComment, setShowDeliveryComment] = useState(false);
  const [showPickupComment, setShowPickupComment] = useState(false);
  const [phone, setPhone] = useState(storedPhone || '');
  const [countryId, setCountryId] = useState(storedCountryId || 'KG');
  const country = getCountryById(countryId);
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

  const [paymentMethod, setPaymentMethod] = useState<'elqr' | 'cash'>('elqr');

  // 🔥 Стейт для времени выдачи, который мы передадим в CheckoutForm
  const [pickupTime, setPickupTime] = useState(tt('asap'));

  // --- UI STATE ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isLoading = createOrderMutation.isPending;
  const [apiError, setApiError] = useState(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState(false);
  const [pendingOrderBody, setPendingOrderBody] = useState<OrderCreateBody | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

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

      if (cleanVal.length > country.length) {
        cleanVal = cleanVal.slice(0, country.length);
      }

      setPhone(cleanVal);
      setStoredPhone(cleanVal);
      if (cleanVal) setPhoneError(false);
    },
    [setStoredPhone, country.length],
  );

  const handleCountryChange = useCallback(
    (id: string) => {
      setCountryId(id);
      setStoredCountryId(id);
      const newLen = getCountryById(id).length;
      setPhone((prev) => {
        const trimmed = prev.slice(0, newLen);
        setStoredPhone(trimmed);
        return trimmed;
      });
    },
    [setStoredCountryId, setStoredPhone],
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

    if (!phone) {
      setPhoneError(true);
      setToastMessage(t('phoneAlertEmpty'));
      return;
    }
    if (phone.length !== country.length) {
      setPhoneError(true);
      setToastMessage(t('phoneAlertLength'));
      return;
    }
    setPhoneError(false);
    if (orderType === 'delivery' && !address) {
      setToastMessage(t('addressAlert'));
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
      if (orderType === 'takeout' && pickupComment.trim()) {
        parts.push(t('pickupCommentPrefix', { text: pickupComment.trim() }));
      }
      const finalComment = parts.join('\n');

      const fullPhone = normalizePhoneForApi(phone, country.dial);
      const savedHash = isBonusUsed
        ? (localStorage.getItem(`bonus_hash_${venueSlug}_${fullPhone}`) ?? undefined)
        : undefined;

      const orderData: OrderCreateBody = {
        phone: fullPhone,
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
        ...(isBonusUsed && bonusToApply > 0 ? { bonus: bonusToApply } : {}),
        ...(savedHash ? { hash: savedHash } : {}),
        ...(() => {
          const redirectUrl = buildOrderRedirectUrl(venueSlug);
          return redirectUrl ? { redirectUrl } : {};
        })(),
      };

      const response = await createOrderMutation.mutateAsync({
        body: orderData,
        venueSlug,
      });

      if (response.status === 'waiting_for_code') {
        setPendingOrderBody(orderData);
        return;
      }

      if (response.phoneVerificationHash) {
        localStorage.setItem(
          `bonus_hash_${venueSlug}_${phone}`,
          response.phoneVerificationHash,
        );
      }

      clearBasket();
      resetOrderOptions();
      resetBonus();
      queryClient.invalidateQueries({ queryKey: ['bonus'] });

      saveClient({ phone, countryId });

      if (response.paymentUrl) {
        savePendingPayment({
          orderId: response.id,
          paymentUrl: response.paymentUrl,
        });
        window.location.href = response.paymentUrl;
      } else {
        closeSheet();
        router.push(`/${venueSlug}/order-status/${response.id}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Payment Error:', error);
      const msg = parseApiError(error, {
        t: (key) => tErr(key),
        fallback: tErr('generic'),
      });
      setToastMessage(msg);
      // DevErrorModal оставляем только для разработки.
      if (process.env.NODE_ENV !== 'production') setApiError(error);
    }
  };

  const handleOtpConfirm = async (code: string) => {
    if (!pendingOrderBody) return;
    setOtpError(null);
    try {
      const response = await createOrderMutation.mutateAsync({
        body: { ...pendingOrderBody, code },
        venueSlug,
      });
      setPendingOrderBody(null);
      if (response.phoneVerificationHash) {
        localStorage.setItem(
          `bonus_hash_${venueSlug}_${pendingOrderBody.phone}`,
          response.phoneVerificationHash,
        );
      }
      clearBasket();
      resetOrderOptions();
      resetBonus();
      queryClient.invalidateQueries({ queryKey: ['bonus'] });

      saveClient({ phone, countryId });

      if (response.paymentUrl) {
        savePendingPayment({
          orderId: response.id,
          paymentUrl: response.paymentUrl,
        });
        window.location.href = response.paymentUrl;
      } else {
        closeSheet();
        router.push(`/${venueSlug}/order-status/${response.id}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setOtpError(error?.message ?? 'Неверный код. Попробуйте ещё раз.');
    }
  };

  const handleBonusToggle = () => {
    if (isBonusUsed) {
      setBonusUsed(false);
      setBonusAmount(0);
    } else {
      setBonusUsed(true);
      setBonusAmount(maxDeductible);
    }
  };

  const effectiveBonus = isBonusUsed
    ? Math.min(Math.max(0, bonusAmount), maxDeductible)
    : 0;

  const isPhoneComplete = phone.length === country.length;

  const bonusBlock =
    showBonusInput && isPhoneComplete && availableBonuses > 0 ? (
      <div className='bg-[#F5F5F5] rounded-xl mt-3 py-3 px-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-sm font-bold text-[#111] leading-tight'>
              {t('bonusLabel')}
            </span>
            <span className='text-[10px] text-gray-500'>
              {t('bonusAvailableShort', { amount: availableBonuses })}
            </span>
          </div>
          <button
            type='button'
            onClick={handleBonusToggle}
            disabled={maxDeductible <= 0}
            aria-label={t('bonusLabel')}
            className={`relative w-10 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 ${
              isBonusUsed ? 'bg-brand' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                isBonusUsed ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isBonusUsed && maxDeductible > 0 && (
          <div className='mt-3 border-t border-dashed border-gray-200 pt-2'>
            <input
              type='range'
              min={0}
              max={maxDeductible}
              step={1}
              value={effectiveBonus}
              onChange={(e) => setBonusAmount(Number(e.target.value))}
              className='w-full accent-brand cursor-pointer'
            />
            <div className='mt-1 flex justify-between text-xs text-brand font-medium'>
              <span>{t('bonusDiscount')}</span>
              <span>− {effectiveBonus} c.</span>
            </div>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div
      className={`fixed inset-0 z-100 ${
        sheetOpen || sheetAnim ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black backdrop-blur-[2px] transition-opacity duration-300 ${
          sheetAnim ? 'pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={sheetAnim ? { opacity: backdropOpacity(0.6) } : undefined}
        onClick={closeSheet}
      />

      {/* Mobile: bottom sheet */}
      <div className='lg:hidden absolute inset-x-0 bottom-0 pointer-events-none'>
        <div
          className={`
            w-full bg-[#F5F5F5] overflow-hidden rounded-t-4xl shadow-2xl
            pointer-events-auto
            ${sheetAnim ? '' : 'translate-y-full transition-transform duration-300 ease-cubic'}
          `}
          style={{
            height: '95dvh',
            ...(sheetAnim ? sheetStyle(dragY !== 0) : {}),
          }}
        >
          <div className='h-full flex flex-col'>
            <div
              className='w-full flex justify-center pt-3 pb-2 shrink-0 touch-none cursor-grab active:cursor-grabbing'
              onClick={closeSheet}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onTouchCancel={handleDragCancel}
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
                  </div>
                )}

                {orderType === 'delivery' && (
                  showDeliveryComment || deliveryComment ? (
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('deliveryCommentLabel')}
                      </span>
                      <input
                        type='text'
                        autoFocus
                        value={deliveryComment}
                        onChange={(e) => setDeliveryComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('deliveryCommentPlaceholder')}
                      />
                    </label>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setShowDeliveryComment(true)}
                      className='mt-3 w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-3 px-4 text-sm font-medium text-[#A4A4A4]'
                    >
                      <MessageSquare size={16} />
                      {t('deliveryCommentLabel')}
                    </button>
                  )
                )}

                {orderType === 'takeout' && (
                  showPickupComment || pickupComment ? (
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('pickupCommentLabel')}
                      </span>
                      <input
                        type='text'
                        autoFocus
                        value={pickupComment}
                        onChange={(e) => setPickupComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('pickupCommentPlaceholder')}
                      />
                    </label>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setShowPickupComment(true)}
                      className='mt-3 w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-3 px-4 text-sm font-medium text-[#A4A4A4]'
                    >
                      <MessageSquare size={16} />
                      {t('pickupCommentLabel')}
                    </button>
                  )
                )}

                <label className={`flex flex-col rounded-xl mt-4 py-2 px-4 cursor-text transition-colors ${phoneError ? 'bg-red-50 ring-1 ring-red-400' : 'bg-[#F5F5F5] hover:bg-gray-200'}`}>
                  <span className={`text-xs mb-0.5 font-medium ${phoneError ? 'text-red-400' : 'text-[#A4A4A4]'}`}>
                    {t('phoneLabel')}
                  </span>
                  <div className='flex items-center gap-2'>
                    <CountryCodeSelect value={countryId} onChange={handleCountryChange} />
                    <input
                      type='tel'
                      inputMode='numeric'
                      placeholder={country.placeholder}
                      maxLength={country.length}
                      minLength={country.length}
                      value={phone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        if (e.target.value.replace(/\D/g, '').length >= country.length) {
                          e.target.blur();
                        }
                      }}
                      className='bg-transparent outline-none font-semibold text-[#111111] placeholder-gray-400 text-base flex-1 min-w-0'
                    />
                  </div>
                </label>

                {bonusBlock}

              </div>

              <div className='mt-3'>
                <PaymentMethodRow
                  method={paymentMethod}
                  onClick={() => setShowPaymentModal(true)}
                />
              </div>
            </div>

            <div
              className='absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10 pb-8 transition-transform duration-150'
              style={{ transform: `translateY(-${keyboardOffset}px)` }}
            >
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
                  </div>
                )}

                {orderType === 'delivery' && (
                  showDeliveryComment || deliveryComment ? (
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('deliveryCommentLabel')}
                      </span>
                      <input
                        type='text'
                        autoFocus
                        value={deliveryComment}
                        onChange={(e) => setDeliveryComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('deliveryCommentPlaceholder')}
                      />
                    </label>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setShowDeliveryComment(true)}
                      className='mt-3 w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-3 px-4 text-sm font-medium text-[#A4A4A4]'
                    >
                      <MessageSquare size={16} />
                      {t('deliveryCommentLabel')}
                    </button>
                  )
                )}

                {orderType === 'takeout' && (
                  showPickupComment || pickupComment ? (
                    <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4'>
                      <span className='text-[#A4A4A4] text-xs mb-1'>
                        {t('pickupCommentLabel')}
                      </span>
                      <input
                        type='text'
                        autoFocus
                        value={pickupComment}
                        onChange={(e) => setPickupComment(e.target.value)}
                        className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                        placeholder={t('pickupCommentPlaceholder')}
                      />
                    </label>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setShowPickupComment(true)}
                      className='mt-3 w-full flex items-center gap-2 bg-[#F5F5F5] rounded-xl py-3 px-4 text-sm font-medium text-[#A4A4A4]'
                    >
                      <MessageSquare size={16} />
                      {t('pickupCommentLabel')}
                    </button>
                  )
                )}

                <label className={`flex flex-col rounded-xl mt-4 py-2 px-4 cursor-text transition-colors ${phoneError ? 'bg-red-50 ring-1 ring-red-400' : 'bg-[#F5F5F5] hover:bg-gray-200'}`}>
                  <span className={`text-xs mb-0.5 font-medium ${phoneError ? 'text-red-400' : 'text-[#A4A4A4]'}`}>
                    {t('phoneLabel')}
                  </span>
                  <div className='flex items-center gap-2'>
                    <CountryCodeSelect value={countryId} onChange={handleCountryChange} />
                    <input
                      type='tel'
                      inputMode='numeric'
                      placeholder={country.placeholder}
                      maxLength={country.length}
                      minLength={country.length}
                      value={phone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        if (e.target.value.replace(/\D/g, '').length >= country.length) {
                          e.target.blur();
                        }
                      }}
                      className='bg-transparent outline-none font-semibold text-[#111111] placeholder-gray-400 text-base flex-1 min-w-0'
                    />
                  </div>
                </label>

                {bonusBlock}

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

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <OtpModal
        open={pendingOrderBody !== null}
        phone={phone}
        isLoading={createOrderMutation.isPending}
        error={otpError}
        onConfirm={handleOtpConfirm}
        onClose={() => { setPendingOrderBody(null); setOtpError(null); }}
      />
    </div>
  );
};

export default DrawerCheckout;
