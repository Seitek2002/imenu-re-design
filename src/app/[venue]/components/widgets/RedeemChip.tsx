'use client';

import { useTranslations } from 'next-intl';

interface Props {
  maxDeductiblePercent: number;
}

export default function RedeemChip({ maxDeductiblePercent }: Props) {
  const t = useTranslations('Widgets');
  return (
    <div className='relative overflow-hidden rounded-[18px] bg-white p-3.5 shadow-[0_1px_0_rgba(40,28,16,0.04),_0_8px_20px_-16px_rgba(40,28,16,0.10)]'>
      <div className='flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#8E8780]'>
        <span
          aria-hidden
          className='h-2 w-2 rounded-full shadow-inner'
          style={{ background: 'linear-gradient(140deg, #E8C99B, #8E6A3D)' }}
        />
        {t('chip.redeem')}
      </div>
      <div className='font-cruinn mt-2 text-[28px] font-black leading-none tracking-tight tabular-nums'>
        <span className='text-brand'>
          {t('chip.redeemValue', { n: maxDeductiblePercent })}
        </span>
      </div>
      <div className='mt-1.5 text-[11.5px] leading-tight font-medium text-[#8E8780]'>
        {t('chip.redeemSub')}
      </div>
    </div>
  );
}
