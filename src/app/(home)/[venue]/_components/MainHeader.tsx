'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useParams } from 'next/navigation';
import { useVenue, useVenueTableV2 } from '@/lib/api/queries';
import { useVenueQuery } from '@/store/venue';

import LanguageDropdown from './LanguageDropdown';

import venueLogo from '@/assets/Header/venue-logo.png';
import venueName from '@/assets/Header/venue-name.png';
import wifiIcon from '@/assets/Header/wifi-icon.svg';
// import searchIcon from '@/assets/Header/search.svg';

const MainHeader = () => {
  const params = useParams<{ venue?: string }>();
  const { data: venue } = useVenue(params.venue!);
  const { setVenue, setTableInfo, tableNum } = useVenueQuery();

  // читаем tableId из sessionStorage только в браузере
  const [tableId, setTableId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const id = sessionStorage.getItem('spotId');
      setTableId(id);
      setTableInfo({ tableId: id });
    } catch {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const slug = params?.venue ? `/${params.venue}` : '';

    if (slug) {
      localStorage.setItem('venueRoot', slug);
    } else {
      const existing = localStorage.getItem('venueRoot');
      if (!existing) {
        try {
          const path = window.location.pathname;
          const m = path.match(/^\/([^/]+)/);
          if (m) localStorage.setItem('venueRoot', `/${m[1]}`);
        } catch {
          // no-op
        }
      }
    }
  }, [params?.venue]);

  useEffect(() => {
    if (venue) setVenue(venue);
  }, [venue]);

  // если есть tableId, подтягиваем данные "заведение + стол" и сохраняем номер стола
  const { data: venueTable } = useVenueTableV2(
    { slug: params.venue!, tableId: tableId || '' },
    { enabled: Boolean(tableId) }
  );

  useEffect(() => {
    if (venueTable) {
      const num = venueTable.table?.tableNum ?? venueTable.tableNum ?? null;
      setTableInfo({ tableNum: num });
    }
  }, [venueTable, setTableInfo]);

  // Wi‑Fi modal state and constants
  const [wifiOpen, setWifiOpen] = useState(false);
  const ssid = 'USTUKAN';
  const pass = 'U20252025';
  const auth = 'WPA';
  const wifiString = `WIFI:T:${auth};S:${ssid};P:${pass};;`;
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!wifiOpen) return;
    QRCode.toDataURL(wifiString, { margin: 1, width: 240 })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [wifiOpen, wifiString]);

  return (
    <header className='header-main sticky top-0 z-10 flex justify-between items-center px-4 py-4 rounded-b-4xl bg-white'>
      <div className='header-left flex items-center'>
        <Image width={40} src={venueLogo} alt='venue logo' />
        <div className='flex flex-col'>
          <Image width={90} src={venueName} alt='venue name' />
          <span className='font-cruinn-tw font-bold text-[10px]'>
            Powered by iMenu.kg
          </span>
        </div>
      </div>
      <div className='header-btns flex gap-[4px]'>
        <div className='header-icon'>
          <button
            type='button'
            aria-label='Показать данные Wi‑Fi'
            onClick={() => setWifiOpen(true)}
            className='cursor-pointer'
          >
            <Image src={wifiIcon} alt='Wi‑Fi' />
          </button>
        </div>
        {/* <div className='header-icon'>
          <Image src={searchIcon} alt='search icon' />
        </div> */}
        <LanguageDropdown />
      </div>

      {wifiOpen && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-xl relative'>
            <button
              type='button'
              aria-label='Закрыть'
              onClick={() => setWifiOpen(false)}
              className='absolute top-2 right-2 text-[#111111]'
            >
              ✕
            </button>
            <div className='text-base font-semibold mb-2'>Wi‑Fi</div>
            {qrUrl ? (
              <div className='flex justify-center mb-3'>
                <img src={qrUrl} alt='Wi‑Fi QR' className='w-[240px] h-[240px]' />
              </div>
            ) : null}
            <div className='text-sm'>
              <span className='text-[#6B6B6B]'>Название сети: </span>
              <span className='font-medium break-all'>{ssid}</span>
            </div>
            <div className='text-sm mt-2'>
              <span className='text-[#6B6B6B]'>Пароль: </span>
              <span className='font-medium break-all'>{pass}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainHeader;
