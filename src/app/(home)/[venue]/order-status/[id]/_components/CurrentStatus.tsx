'use client';

import Image from 'next/image';
import { FC } from 'react';

import { steps } from '../OrderStatus.helpers';

interface IProps {
  serviceMode?: number;
  status?: number;
}

const CurrentStatus: FC<IProps> = ({ serviceMode, status }) => {
  if (serviceMode == null) return null;
  if (status == null) return null;
  if (status == null) return null;

  // Безопасные вычисления для прогресс-бара и доступа к шагам
  const modeSteps = steps[serviceMode as 1 | 2 | 3] ?? steps[2];
  const total = modeSteps.length;
  const clamped = Math.max(0, Math.min(status, total - 1));
  const isCancelled = status === 7;
  const activeIndex = isCancelled ? 0 : clamped;
  const progress = total <= 1 ? 0 : ((activeIndex + 1) / total) * 100;

  return (
    <>
      <div className='px-4 pt-3'>
        <div className='rounded-2xl bg-white p-4 shadow-sm'>
          {/* Title + subtitle like on mock */}
          <div className='mb-4'>
            <h3 className='text-[22px] leading-7 font-semibold'>
              {modeSteps[activeIndex]?.title}
            </h3>
            <p className='text-[#9CA3AF] text-[14px] leading-5 mt-1'>
              {modeSteps[activeIndex]?.desc}
            </p>
          </div>

          {/* Icons row (grid so dots align exactly under icons) */}
          <div className='flex justify-around items-center mb-3 gap-2'>
            {modeSteps.map((s, i) => {
              const current = i === activeIndex;
              const bg = current ? '#FF8127' : '#ECECF1';

              return (
                <div key={s.key} className='flex items-center justify-center'>
                  <div
                    className='flex items-center justify-center rounded-full'
                    style={{ width: 48, height: 48, backgroundColor: bg }}
                  >
                    {isCancelled && i === 0 ? (
                      <svg width='24' height='24' viewBox='0 0 24 24'>
                        <path
                          d='M6 6l12 12M18 6l-12 12'
                          stroke={current ? '#fff' : '#111'}
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                      </svg>
                    ) : (
                      <Image
                        src={s.icon}
                        alt={s.title}
                        className={current ? '' : 'invert'}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Baseline + dots (aligned under icons) */}
          <div className='relative h-3 mt-1'>
            {/* base line */}
            <div className='absolute left-0 right-0 top-[3px] h-[2px] bg-[#ECECF1] rounded-full' />
            {/* progress line */}
            <div
              className='absolute left-0 top-[3px] h-[2px] rounded-full'
              style={{ width: `${progress}%`, background: '#FF8127' }}
            />
            {/* dots aligned under each grid column */}
            <div className='absolute inset-0 flex justify-around'>
              {modeSteps.map((_, i) => {
                const activeDot = i <= activeIndex;
                return (
                  <span
                    key={`dot-${i}`}
                    className='h-2 w-2 rounded-full justify-self-center'
                    style={{
                      backgroundColor: activeDot ? '#FF8127' : '#ECECF1',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrentStatus;
