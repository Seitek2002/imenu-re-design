'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellRing, Loader2, CheckCircle } from 'lucide-react';
import { useVenueStore } from '@/store/venue';

export default function MainAction({ venueSlug }: { venueSlug: string }) {
  const pathname = usePathname();

  const tableId = useVenueStore((state) => state.tableId);
  const tableNumber = useVenueStore((state) => state.tableNumber);

  // Состояния интерфейса
  const [showConfirm, setShowConfirm] = useState(false); // Модалка "Вы уверены?"
  const [showSuccess, setShowSuccess] = useState(false); // Модалка "Успешно"
  const [isLoading, setIsLoading] = useState(false); // Спиннер загрузки

  const isMainPage = new RegExp(`^/${venueSlug}(?:/d)?(?:/\\d+)*$`).test(
    pathname
  );

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
        `https://imenu.kg/api/v2/call-waiter/?tableId=${tableId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
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
      <div className='fixed bottom-20 right-4 z-40 pointer-events-none'>
        <button
          onClick={handleInitialClick}
          className={`
            pointer-events-auto bg-brand text-white shadow-xl 
            active:scale-95 transition-all duration-500 ease-in-out 
            flex items-center justify-center overflow-hidden will-change-transform
            h-14 rounded-full
            ${
              isMainPage ? 'w-[calc(100vw-32px)] px-6 gap-3' : 'w-14 px-0 gap-0'
            }
          `}
        >
          <BellRing size={20} className='shrink-0' />
          <span
            className={`
              font-black font-cruinn text-[13px] uppercase tracking-wide whitespace-nowrap 
              transition-all duration-500 ease-in-out
              ${
                isMainPage
                  ? 'opacity-100 max-w-75 ml-0'
                  : 'opacity-0 max-w-0 ml-0'
              }
            `}
          >
            Позвать официанта
          </span>
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

            <h3 className='text-xl font-bold mb-2'>Вызвать официанта?</h3>
            <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
              Вы действительно хотите позвать сотрудника к столу
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
                Отмена
              </button>
              <button
                disabled={isLoading}
                onClick={handleConfirmCall}
                className='flex-1 h-12 rounded-xl bg-brand text-white font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <Loader2 size={18} className='animate-spin' />
                ) : (
                  'Да, позвать'
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

            <h3 className='text-xl font-bold mb-2'>Уведомление отправлено!</h3>
            <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
              Официант получил ваш вызов и скоро подойдет к вам.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className='w-full h-12 rounded-xl bg-brand text-white font-bold text-sm active:scale-95 transition-transform'
            >
              Отлично
            </button>
          </div>
        </div>
      )}
    </>
  );
}
