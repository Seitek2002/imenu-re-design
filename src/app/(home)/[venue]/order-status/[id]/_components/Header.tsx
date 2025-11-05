'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import arrowIcon from '@/assets/Header/arrow.svg';
import qrCodeIcon from '@/assets/OrderStatus/qr-code.svg';
import { useTranslation } from 'react-i18next';
import ModalPortal from '@/components/ui/ModalPortal';

const Header = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [openQR, setOpenQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const u = new URL(window.location.href);
      u.protocol = 'https:';
      u.hostname = 'imenu.kg';
      u.port = '';
      setQrUrl(u.toString());
    } catch {
      setQrUrl('');
    }
  }, []);

  return (
    <>
      <header className='sticky top-0 z-10 bg-white rounded-b-4xl'>
      <div className='flex items-center justify-between px-5 pt-2.5 pb-4'>
        <Image
          src={arrowIcon}
          width={24}
          height={24}
          alt='Назад'
          className='cursor-pointer'
          onClick={() => router.back()}
        />
        <h2 className='text-2xl font-semibold'>{t('myOrder')}</h2>
        <button
          type='button'
          className='text-[#FF7A00] text-sm font-medium'
          onClick={() => setOpenQR(true)}
          aria-label='Показать qr-code'
        >
          <Image src={qrCodeIcon} alt='qrCodeIcon' />
        </button>
      </div>
    </header>

      <ModalPortal open={openQR} onClose={() => setOpenQR(false)} zIndex={100}>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold">{t('myOrder')}</h3>
          {qrUrl ? (
            // Public QR generator; encodes target URL leading to same page on imenu.kg
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`}
              alt="QR to this order status"
              className="w-60 h-60"
            />
          ) : (
            <div className="w-60 h-60 bg-gray-200 animate-pulse rounded-lg" />
          )}
          <code className="break-all text-xs text-gray-500">{qrUrl || '...'}</code>
        </div>
      </ModalPortal>
    </>
  );
};

export default Header;
