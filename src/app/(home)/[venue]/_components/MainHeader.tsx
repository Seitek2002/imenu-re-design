'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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

  // Wi‑Fi QR modal state and helpers
  const [wifiOpen, setWifiOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  // Example credentials (replace with real ones or fetch from API/store when available)
  const ssid = 'Oriental';
  const pass = '123456789';
  const auth = 'WPA'; // 'WPA', 'WEP' or '' for open network

  // WIFI QR content and URL (Google Charts)
  const wifiString = `WIFI:T:${auth};S:${ssid};P:${pass};;`;
  const qrUrl =
    'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' +
    encodeURIComponent(wifiString) +
    '&choe=UTF-8';

  async function handleCopyWifi() {
    try {
      await navigator.clipboard.writeText(wifiString);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    } finally {
      setTimeout(() => setCopyState('idle'), 1500);
    }
  }

  return (
    <header className='header-main sticky top-0 z-10 flex justify-between items-center px-4 py-4 rounded-b-4xl bg-white'>
      <div className='header-left flex items-center'>
        <Image width={40} src={venueLogo} alt='venue logo' />
        <div className='flex flex-col'>
          <Image width={90} src={venueName} alt='venue name' />
          <span className='font-cruinn-tw font-bold text-[10px]'>
            Powered by iMenu.kg
          </span>
          {tableNum ? (
            <span className='font-cruinn-tw font-bold text-[10px]'>
              Стол № {tableNum}
            </span>
          ) : null}
        </div>
      </div>
      <div className='header-btns flex gap-[4px]'>
        <div className='header-icon'>
          <button
            type='button'
            aria-label='Wi‑Fi QR'
            onClick={() => setWifiOpen(true)}
            className='cursor-pointer'
          >
            <Image src={wifiIcon} alt='wifi icon' />
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
          <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-xl'>
            <div className='text-base font-semibold mb-3'>Wi‑Fi QR</div>

            <div className='flex justify-center'>
              <Image
                src={qrUrl}
                alt='Wi‑Fi QR'
                className='w-[240px] h-[240px]'
              />
            </div>

            <div className='mt-3 break-all text-xs text-[#6B6B6B]'>
              {wifiString}
            </div>

            <div className='mt-4 flex items-center justify-between gap-2'>
              <button
                type='button'
                onClick={handleCopyWifi}
                className='h-10 px-4 rounded-[10px] text-white font-semibold'
                style={{ backgroundColor: '#FF7A00' }}
              >
                {copyState === 'copied'
                  ? 'Скопировано'
                  : copyState === 'error'
                  ? 'Ошибка копирования'
                  : 'Копировать'}
              </button>
              <a
                href={qrUrl}
                download={`wifi-${ssid}.png`}
                target='_blank'
                rel='noreferrer'
                className='h-10 px-4 rounded-[10px] text-white font-semibold flex items-center justify-center'
                style={{ backgroundColor: '#111111' }}
              >
                Скачать
              </a>
              <button
                type='button'
                onClick={() => setWifiOpen(false)}
                className='h-10 px-4 rounded-[10px] text-white font-semibold'
                style={{ backgroundColor: '#FF7A00' }}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainHeader;
