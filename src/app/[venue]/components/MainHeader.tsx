'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useVenueStore } from '@/store/venue'; // 1. Подключаем стор
import WifiModal from '@/components/modals/WifiModal'; // 2. Подключаем модалку
import LanguageDropdown from '@/app/[venue]/components/LanguageDropdown';
import wifiIcon from '@/assets/Header/wifi-icon.svg';

const MainHeader = () => {
  const [isWifiOpen, setWifiOpen] = useState(false);
  const t = useTranslations('Wifi');
  const tHeader = useTranslations('Header');

  // 3. Получаем данные заведения
  const venue = useVenueStore((state) => state.data);
  const tableNumber = useVenueStore((state) => state.tableNumber);

  // 4. Проверяем наличие Wi-Fi (пока берем первую точку)
  const currentSpot = venue?.spots?.[0];
  const hasWifiInfo = !!(currentSpot?.wifiText || currentSpot?.wifiUrl);

  // Фолбэк на случай, если данные еще не загрузились (скелетон или просто скрываем)
  if (!venue) return null;

  return (
    <>
      <header className='header-main sticky top-0 z-30 flex flex-col gap-1.5 px-4 pt-2 pb-4 rounded-b-4xl bg-white shadow-sm'>
        <span className='text-[10px] font-medium leading-none text-[#FF6B00] whitespace-nowrap'>
          {tHeader('testMode')}
        </span>
        <div className='flex justify-between items-center gap-3'>
        <div className='header-left flex items-center min-w-0 flex-1'>
          {/* ДИНАМИЧЕСКИЙ ЛОГОТИП */}
          {venue.logo && (
            <div className='relative w-10 h-10 shrink-0'>
              <Image
                src={venue.logo}
                alt={venue.companyName}
                fill
                className='object-contain' // или object-cover, зависит от формы лого
                priority
              />
            </div>
          )}

          <div className='flex flex-col ml-2 overflow-hidden'>
            {/* ВМЕСТО КАРТИНКИ "logoName" ТЕПЕРЬ ТЕКСТ.
               API возвращает название текстом, а не картинкой.
            */}
            <h1 className='text-[#111111] font-bold text-lg leading-tight truncate'>
              {venue.companyName}
            </h1>

            <span className='font-cruinn font-bold text-[10px] leading-none text-[#111111] mt-0.5'>
              Powered by iMenu.kg
            </span>
          </div>
        </div>

        <div className='flex gap-2 shrink-0'>
          {tableNumber && (
            <div className='flex items-center h-10 px-2.5 rounded-[14px] bg-[#FAFAFA] text-[12px] font-bold text-[#111111] whitespace-nowrap'>
              Стол №{tableNumber}
            </div>
          )}

          {/* ПОКАЗЫВАЕМ КНОПКУ ТОЛЬКО ЕСЛИ ЕСТЬ WI-FI */}
          {hasWifiInfo && (
            <div className='group relative'>
              <button
                onClick={() => setWifiOpen(true)}
                className='p-2.5 rounded-[14px] bg-[#FAFAFA] cursor-pointer active:scale-95 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all'
                aria-label={t('aria')}
              >
                <Image src={wifiIcon} alt='wifi' width={20} height={20} />
              </button>
              <span className='hidden lg:block absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-black/85 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50'>
                {t('aria')}
              </span>
            </div>
          )}

          <LanguageDropdown />
        </div>
        </div>
      </header>

      {/* МОДАЛКА ПОДКЛЮЧЕНА СЮДА */}
      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setWifiOpen(false)}
        text={currentSpot?.wifiText}
        url={currentSpot?.wifiUrl}
      />
    </>
  );
};

export default MainHeader;
