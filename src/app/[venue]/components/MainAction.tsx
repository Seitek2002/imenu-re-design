'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BellRing, Loader2, CheckCircle } from 'lucide-react';
import { useVenueStore } from '@/store/venue';
import { useUiFloatingStore } from '@/store/ui-floating';
import { useBasketStore } from '@/store/basket';
import { API_V2_URL } from '@/lib/config';

interface Props {
  venueSlug: string;
}

export default function MainAction({ venueSlug }: Props) {
  const pathname = usePathname();
  const t = useTranslations('MainAction');
  const tc = useTranslations('Common');

  const tableId = useVenueStore((state) => state.tableId);
  const tableNumber = useVenueStore((state) => state.tableNumber);
  const billBannerOpen = useUiFloatingStore((s) => s.billBannerOpen);
  const cartCount = useBasketStore((s) => s.getItemCount());

  // Состояния интерфейса
  const [showConfirm, setShowConfirm] = useState(false); // Модалка "Вы уверены?"
  const [showSuccess, setShowSuccess] = useState(false); // Модалка "Успешно"
  const [isLoading, setIsLoading] = useState(false); // Спиннер загрузки
  const [showHint, setShowHint] = useState(false);

  const isMainPage = new RegExp(`^/${venueSlug}(?:/d)?(?:/\\d+)*$`).test(
    pathname,
  );

  // На страницах с фиксированной CTA-плашкой (корзина, активный заказ стола)
  // дефолтное `bottom: 5rem` сажает колокольчик прямо на CTA — поднимаем выше.
  const isCartPage = pathname.endsWith('/cart');
  const isTableOrderPage = pathname.includes('/table-order');
  const cartButtonVisible = cartCount > 0 && !isCartPage && !isTableOrderPage;

  const hasBottomCta =
    pathname.includes('/cart') ||
    isTableOrderPage ||
    billBannerOpen ||
    cartButtonVisible;

  useEffect(() => {
    if (!tableId || !isMainPage) {
      setShowHint(false);
      return;
    }

    const storageKey = `imenu-waiter-hint:${venueSlug}`;
    if (sessionStorage.getItem(storageKey)) return;

    setShowHint(true);
    sessionStorage.setItem(storageKey, '1');

    const timer = window.setTimeout(() => setShowHint(false), 4000);
    return () => window.clearTimeout(timer);
  }, [tableId, isMainPage, venueSlug]);

  // Если стола нет — скрываем кнопку полностью (как и договаривались)
  if (!tableId) return null;

  // 1. Хендлер нажатия на колокольчик
  const handleInitialClick = () => {
    // Легкая вибрация для тактильного отклика (Taptic Engine style)
    if (navigator.vibrate) navigator.vibrate(50);
    setShowConfirm(true);
  };

  // 2. Хендлер подтверждения вызова
  const handleConfirmCall = async () => {
    setIsLoading(true);

    try {
      // API вызов согласно твоему скриншоту (GET запрос)
      const res = await fetch(
        `${API_V2_URL}/call-waiter/?tableId=${tableId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.ok) {
        // Успех!
        setShowConfirm(false);
        setShowSuccess(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Двойная вибрация успеха
      } else {
        // Можно добавить обработку ошибок (например, тост), но пока просто лог
        console.error('Ошибка вызова официанта');
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className='main-action-floating fixed px-4 left-0 right-0 z-40 pointer-events-none max-w-175 mx-auto w-full flex items-center justify-end gap-2'
        style={
          billBannerOpen
            ? { bottom: '15rem' }
            : hasBottomCta
              ? { bottom: '11rem' }
              : undefined
        }
      >
        {isMainPage && showHint && (
          <div className='pointer-events-none rounded-full bg-white px-3 py-2 text-xs font-bold text-[#111111] shadow-lg animate-fade-in'>
            {t('callBtn')}
          </div>
        )}

        <button
          onClick={handleInitialClick}
          className={`
            pointer-events-auto bg-brand text-white shadow-xl 
            active:scale-95 transition-all duration-500 ease-in-out 
            flex items-center justify-center overflow-hidden will-change-transform
            h-14 rounded-full
            w-14 px-0 gap-0
          `}
          aria-label={t('callBtn')}
        >
          <BellRing size={20} className='shrink-0' />
        </button>
      </div>

      {showConfirm && (
        <div className='fixed inset-0 z-100 flex items-center justify-center px-4 animate-in fade-in duration-200'>
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            onClick={() => !isLoading && setShowConfirm(false)}
          />

          {/* Карточка */}
          <div className='relative w-full max-w-xs bg-white rounded-[30px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center'>
            <div className='w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4'>
              <BellRing size={32} />
            </div>

            <h3 className='text-xl font-bold mb-2'>{t('confirmTitle')}</h3>
            <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
              {t('confirmDescPrefix')}
              <span className='font-bold text-gray-900'>
                {' '}
                №{tableNumber || '...'}
              </span>
              ?
            </p>

            <div className='flex gap-3'>
              <button
                disabled={isLoading}
                onClick={() => setShowConfirm(false)}
                className='flex-1 h-12 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm active:scale-95 transition-transform'
              >
                {tc('cancel')}
              </button>
              <button
                disabled={isLoading}
                onClick={handleConfirmCall}
                className='flex-1 h-12 rounded-xl bg-brand text-white font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <Loader2 size={18} className='animate-spin' />
                ) : (
                  t('yesCall')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className='fixed inset-0 z-100 flex items-center justify-center px-4 animate-in fade-in duration-200'>
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            onClick={() => setShowSuccess(false)}
          />

          <div className='relative w-full max-w-xs bg-white rounded-[30px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center'>
            <div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle size={32} />
            </div>

            <h3 className='text-xl font-bold mb-2'>{t('successTitle')}</h3>
            <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
              {t('successDesc')}
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className='w-full h-12 rounded-xl bg-brand text-white font-bold text-sm active:scale-95 transition-transform'
            >
              {tc('ok')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
