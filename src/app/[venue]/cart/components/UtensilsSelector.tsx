'use client';

import { useTranslations } from 'next-intl';
import { useCheckout } from '@/store/checkout';

interface Props {
  className?: string;
}

export default function UtensilsSelector({ className = '' }: Props) {
  const t = useTranslations('Cart.utensils');
  const { needUtensils, setNeedUtensils } = useCheckout();

  return (
    <div
      className={`bg-[#FAFAFA] rounded-xl py-3 px-4 flex items-center justify-between ${className}`}
    >
      <div className='flex flex-col'>
        <span className='text-sm font-semibold text-[#111111]'>
          {t('title')}
        </span>
        <span className='text-[#A4A4A4] text-xs mt-0.5'>
          {t('subtitle')}
        </span>
      </div>
      <button
        type='button'
        onClick={() => setNeedUtensils(!needUtensils)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          needUtensils ? 'bg-brand' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            needUtensils ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
