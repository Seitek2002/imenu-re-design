'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import elqrIcon from '@/assets/Cart/Drawer/elqr.svg';
import cashIcon from '@/assets/Cart/Drawer/cash.svg';
import selectArrow from '@/assets/Cart/Drawer/select-arrow.svg';

interface Props {
  method: 'elqr' | 'cash';
  onClick: () => void;
}

export default function PaymentMethodRow({ method, onClick }: Props) {
  const t = useTranslations('Cart.payment');
  return (
    <div
      className='rounded-3xl bg-white p-4 flex items-center justify-between mt-3 shadow-sm active:scale-[0.99] transition-transform cursor-pointer'
      onClick={onClick}
    >
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center'>
          <Image src={method === 'cash' ? cashIcon : elqrIcon} alt='payment' />
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-[#111111]'>
            {method === 'cash' ? t('cash') : t('elqr')}
          </span>
          <span className='text-xs text-[#939393]'>{t('rowLabel')}</span>
        </div>
      </div>
      <Image src={selectArrow} alt='arrow' className='opacity-40' />
    </div>
  );
}
