'use client';

// 🔥 1. Импортируем useCallback
import { FC, useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  const venueSlug = params.venue as string;
  const [sheetAnim, setSheetAnim] = useState(false);

  // --- STORE DATA ---
  const items = useBasketStore((state) => state.items);
  const isBonusUsed = useBonusStore((state) => state.isBonusUsed);

  // --- API ---
  const createOrderMutation = useCreateOrderV2();

  const {
    phone: storedPhone,
    setPhone: setStoredPhone,
    address: storedAddress,
    setAddress: setStoredAddress,
    needUtensils,
  } = useCheckout();

  // --- FORM STATE ---
  const [phone, setPhone] = useState(storedPhone || '');
  const [address, setAddress] = useState(storedAddress || '');

  // Достаем нужные ID для бекенда из стора
  const tableNumber = useVenueStore((state) => state.tableNumber);
  const tableId = useVenueStore((state) => state.tableId);
  const spotId = useVenueStore((state) => state.spotId);
  const venueData = useVenueStore((state) => state.data);

  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [drawerUtensils, setDrawerUtensils] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'elqr' | 'cash'>('elqr');

  // 🔥 Стейт для времени выдачи, который мы передадим в CheckoutForm
  const [pickupTime, setPickupTime] = useState('Быстрее всего');

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

  const handlePay = async () => {
    if (!phone && orderType !== 'dinein') {
      alert('Пожалуйста, укажите номер телефона');
      return;
    }
    if (orderType !== 'dinein') {
      if (!phone) {
        alert('Пожалуйста, укажите номер телефона');
        return;
      }
      // Проверка на длину
      if (phone.length !== 9) {
        alert('Номер телефона должен состоять из 9 цифр');
        return;
      }
    }
    if (orderType === 'delivery' && !address) {
      alert('Введите адрес доставки');
      return;
    }

    setStoredPhone(phone);
    if (orderType === 'delivery') {
      setStoredAddress(address);
    }

    setApiError(null);

    try {
      // 🔥 Формируем итоговый комментарий (склеиваем время и сам комментарий)
      let finalComment = comment;
      if (orderType !== 'dinein') {
        const timeText = `[Время выдачи: ${pickupTime}]`;
        finalComment = comment ? `${timeText}\n${comment}` : timeText;
      }

      const orderData = {
        phone,
        serviceMode: (orderType === 'dinein'
          ? 1
          : orderType === 'delivery'
            ? 3
            : 2) as 1 | 2 | 3,
        address: orderType === 'delivery' ? address : null,
        comment: finalComment,
        // 🔥 Берем реальные spotId и tableId из стора
        spot: spotId || venueData?.spots?.[0]?.id,
        table: tableId || undefined,
        orderProducts: items.map((i) => ({
          product: i.id,
          count: i.quantity,
          modificator: i.modifierId,
        })),
        paymentMethods: paymentMethod,
        useBonus: isBonusUsed,
      };

      const response = await createOrderMutation.mutateAsync({
        body: orderData,
        venueSlug,
      });

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        closeSheet();
        alert(`Заказ #${response.id} успешно создан!`);
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

      <div className='absolute inset-x-0 bottom-0 pointer-events-none'>
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
                      Столик №{tableNumber}
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
                    <DeliveryInputs onAddressChange={handleAddressChange} />
                  </div>
                )}

                <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-4 py-2 px-4 cursor-text hover:bg-gray-200 transition-colors'>
                  <span className='text-[#A4A4A4] text-xs mb-0.5 font-medium'>
                    Номер телефона
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

                {!needUtensils && (
                  <div className='bg-[#F5F5F5] flex items-center justify-between rounded-xl mt-4 py-3 px-4'>
                    <div className='flex flex-col'>
                      <span className='text-[#111111] font-semibold text-sm'>
                        Нужны приборы?
                      </span>
                      <span className='text-[#A4A4A4] text-xs mt-0.5'>
                        По умолчанию — без приборов 🌿
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => setDrawerUtensils((v) => !v)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        drawerUtensils ? 'bg-brand' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          drawerUtensils ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <button
                  type='button'
                  className='text-brand text-sm font-bold mt-4 px-1 flex items-center gap-1 active:opacity-70'
                  onClick={() => setShowComment(!showComment)}
                >
                  {showComment
                    ? '− Убрать комментарий'
                    : '+ Добавить комментарий'}
                </button>

                {showComment && (
                  <label className='bg-[#F5F5F5] flex flex-col rounded-xl mt-3 py-3 px-4 animate-fadeIn'>
                    <span className='text-[#A4A4A4] text-xs mb-1'>
                      Комментарий к заказу
                    </span>
                    <input
                      type='text'
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className='bg-transparent outline-none text-[#111111] text-sm font-medium'
                      placeholder='Например: без лука, острая...'
                    />
                  </label>
                )}
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
