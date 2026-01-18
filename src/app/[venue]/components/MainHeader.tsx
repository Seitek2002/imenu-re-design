'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useVenueStore } from '@/store/venue'; // 1. Подключаем стор
import WifiModal from '@/components/modals/WifiModal'; // 2. Подключаем модалку
import LanguageDropdown from '@/app/[venue]/components/LanguageDropdown';
import wifiIcon from '@/assets/Header/wifi-icon.svg';

const MainHeader = () => {
  const [isWifiOpen, setWifiOpen] = useState(false);

  // 3. Получаем данные заведения
  const venue = useVenueStore((state) => state.data);

  // 4. Проверяем наличие Wi-Fi (пока берем первую точку)
  const currentSpot = venue?.spots?.[0];
  const hasWifiInfo = !!(currentSpot?.wifiText || currentSpot?.wifiUrl);

  // Фолбэк на случай, если данные еще не загрузились (скелетон или просто скрываем)
  if (!venue) return null;

  return (
    <>
      <header className='header-main sticky top-0 z-30 flex justify-between items-center px-4 py-4 rounded-b-4xl bg-white shadow-sm'>
        <div className='header-left flex items-center shrink-0 max-w-[65%]'>
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
          {/* ПОКАЗЫВАЕМ КНОПКУ ТОЛЬКО ЕСЛИ ЕСТЬ WI-FI */}
          {hasWifiInfo && (
            <button
              onClick={() => setWifiOpen(true)}
              className='p-2.5 rounded-[14px] bg-[#FAFAFA] cursor-pointer active:scale-95 transition-transform'
              aria-label='Wi-Fi Info'
            >
              <Image src={wifiIcon} alt='wifi' width={20} height={20} />
            </button>
          )}

          <LanguageDropdown />
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
