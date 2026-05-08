'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useOrderSummary } from '@/hooks/useOrderSummary';
import { useVenueStore } from '@/store/venue';

import arrow from '@/assets/Cart/details-arrow.svg';
import coinIcon from '@/assets/Widgets/widget-2.png';

interface Props {
  subtotal: number;
  deliveryType: 'takeout' | 'delivery' | 'dinein';
  deliveryCost: number;
}

export default function OrderSummary({ subtotal, deliveryType, deliveryCost }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Cart.summary');

  const {
    availableBonuses,
    maxDeductible,
    effectiveAmount,
    isBonusUsed,
    setBonusAmount,
    handleBonusToggle,
    applied,
    promoDiscount,
    finalDisplayTotal,
  } = useOrderSummary({ subtotal, deliveryType, deliveryCost });

  const venue = useVenueStore((s) => s.data);
  const accrualPercent = venue?.isBonusSystemEnabled ? (venue?.bonusAccrualPercent ?? 0) : 0;
  const earnedBonus = accrualPercent > 0 ? Math.floor((finalDisplayTotal * accrualPercent) / 100) : 0;

  return (
    <div className='bg-[#FAFAFA] p-3 rounded-xl mt-3'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-[#80868B]'
      >
        <span className='text-base font-medium'>{t('details')}</span>
        <span
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <Image src={arrow} alt='toggle' />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='flex flex-col gap-2 pb-1'>
            <div className='flex justify-between text-[#80868B]'>
              <span>{t('subtotal')}</span>
              <span>{subtotal} c.</span>
            </div>

            {deliveryType === 'delivery' && (
              <div className='flex justify-between text-[#80868B]'>
                <span>{t('delivery')}</span>
                <span>{deliveryCost} c.</span>
              </div>
            )}

            {applied && promoDiscount > 0 && (
              <div className='flex justify-between text-brand'>
                <span className='truncate pr-2'>{applied.promotion.name}</span>
                <span className='whitespace-nowrap'>- {promoDiscount} c.</span>
              </div>
            )}

            {availableBonuses > 0 && (
              <div className='mt-2 bg-white rounded-lg p-3 border border-brand/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src={coinIcon}
                      alt='bonus'
                      width={20}
                      height={20}
                      className='object-contain'
                    />
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold text-[#111] leading-tight'>
                        {t('spendBonus')}
                      </span>
                      <span className='text-[10px] text-gray-500'>
                        {t('available', { amount: availableBonuses })}
                      </span>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={handleBonusToggle}
                    aria-label={t('spendBonus')}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${
                      isBonusUsed ? 'bg-brand' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                        isBonusUsed ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isBonusUsed && maxDeductible > 0 && (
                  <div className='mt-3 border-t border-dashed border-gray-200 pt-2'>
                    <input
                      type='range'
                      min={0}
                      max={maxDeductible}
                      step={1}
                      value={effectiveAmount}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className='w-full accent-brand cursor-pointer'
                    />
                    <div className='mt-1 flex justify-between text-xs text-brand font-medium'>
                      <span>{t('discount')}</span>
                      <span>- {effectiveAmount} c.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border-t border-[#E7E7E7] mt-3 pt-2 flex justify-between font-bold text-[#21201F] text-lg'>
            <span>{t('total')}</span>
            <span>{Math.round(finalDisplayTotal)} c.</span>
          </div>

        </div>
      </div>

      {earnedBonus > 0 && (
        <div className='mt-3 flex items-center justify-between bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-xl px-4 py-3'>
          <div className='flex items-center gap-3'>
            <Image src={coinIcon} alt='bonus' width={28} height={28} className='object-contain' />
            <div className='flex flex-col'>
              <span className='text-sm font-bold text-[#111] leading-tight'>{t('earnBonus')}</span>
              <span className='text-[11px] text-gray-500'>{accrualPercent}%</span>
            </div>
          </div>
          <span className='text-lg font-extrabold text-brand'>+{earnedBonus}</span>
        </div>
      )}
    </div>
  );
}
