'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import arrowIcon from '@/assets/Header/arrow.svg';
import qrCodeIcon from '@/assets/OrderStatus/qr-code.svg';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
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
          onClick={() => {}}
          aria-label='Показать qr-code'
        >
          <Image src={qrCodeIcon} alt='qrCodeIcon' />
        </button>
      </div>
    </header>
  );
};

export default Header;
