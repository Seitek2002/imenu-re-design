'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Wifi } from 'lucide-react';

import { useVenueStore } from '@/store/venue';
import WifiModal from '@/components/modals/WifiModal';
import LanguageDropdown from '@/app/[venue]/components/LanguageDropdown';

const MainHeader = () => {
  const [isWifiOpen, setWifiOpen] = useState(false);
  const t = useTranslations('Wifi');
  const tHeader = useTranslations('Header');

  const venue = useVenueStore((state) => state.data);
  const tableNumber = useVenueStore((state) => state.tableNumber);

  const currentSpot = venue?.spots?.[0];
  const hasWifiInfo = !!(currentSpot?.wifiText || currentSpot?.wifiUrl);

  if (!venue) return null;

  return (
    <>
      <div className='px-4 pt-3 pb-1'>
        <span className='text-[10.5px] font-medium leading-none text-[#FF6B00] tracking-tight'>
          {tHeader('testMode')}
        </span>
      </div>

      <header
        className='header-main relative z-30 mx-1 mt-1 flex items-center justify-between gap-3 rounded-[22px] bg-white px-3.5 py-3 shadow-[0_1px_0_rgba(40,28,16,0.04),_0_8px_24px_-16px_rgba(40,28,16,0.10)]'
      >
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          {venue.logo && (
            <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#0E0E0F]'>
              <Image
                src={venue.logo}
                alt={venue.companyName}
                fill
                className='object-contain'
                priority
              />
            </div>
          )}

          <div className='flex min-w-0 flex-col leading-tight'>
            <h1 className='truncate text-[15px] font-extrabold tracking-wide text-[#111111]'>
              {venue.companyName}
            </h1>
            <span className='font-cruinn mt-0.5 text-[10px] font-bold leading-none text-[#111111]'>
              Powered by iMenu.kg
            </span>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {tableNumber && (
            <div className='inline-flex h-9 items-center rounded-[14px] bg-[#FAFAFA] px-2.5 text-[12px] font-bold whitespace-nowrap text-[#111111]'>
              Стол №{tableNumber}
            </div>
          )}

          {hasWifiInfo && (
            <button
              onClick={() => setWifiOpen(true)}
              aria-label={t('aria')}
              className='inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-[#ECE6DE] bg-white text-[#111111] transition-all hover:bg-gray-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
            >
              <Wifi size={18} strokeWidth={2.25} />
            </button>
          )}

          <LanguageDropdown />
        </div>
      </header>

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
