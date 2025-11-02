'use client';

import Image from 'next/image';
import { FC, useMemo, useState } from 'react';

import { steps } from '../OrderStatus.helpers';

interface IProps {
  serviceMode?: number;
}

const CurrentStatus: FC<IProps> = ({ serviceMode }) => {
  const [active, setActive] = useState(0);

  const VALID_KEYS = [1, 2, 3] as const;
  type StepsKey = (typeof VALID_KEYS)[number];
  const DEFAULT_KEY: StepsKey = 2;
  const key: StepsKey = (VALID_KEYS as readonly number[]).includes(
    serviceMode ?? -1
  )
    ? (serviceMode as StepsKey)
    : DEFAULT_KEY;
  const modeSteps = steps[key];

  const isLast = active >= modeSteps.length - 1;

  const progress = useMemo(() => {
    if (modeSteps.length <= 1) return 0;
    // 4 steps: 25%, 50%, 75%, 100%
    return ((active + 1) / modeSteps.length) * 100;
  }, [active, modeSteps.length]);

  function handleNext() {
    if (!isLast) setActive((i) => Math.min(i + 1, modeSteps.length - 1));
  }

  return (
    <>
      <div className='px-4 pt-3'>
        {/* Header card with title, subtitle, icons and baseline (horizontal) */}
        <div className='rounded-2xl bg-white p-4 shadow-sm'>
          {/* Title + subtitle like on mock */}
          <div className='mb-4'>
            <h3 className='text-[22px] leading-7 font-semibold'>
              {modeSteps[active]?.title}
            </h3>
            <p className='text-[#9CA3AF] text-[14px] leading-5 mt-1'>
              {modeSteps[active]?.desc}
            </p>
          </div>

          {/* Icons row (grid so dots align exactly under icons) */}
          <div className='flex justify-around items-center mb-3 gap-2'>
            {modeSteps.map((s, i) => {
              const current = i === active;
              const bg = current ? '#FF8127' : '#ECECF1';

              return (
                <div key={s.key} className='flex items-center justify-center'>
                  <div
                    className='flex items-center justify-center rounded-full'
                    style={{ width: 48, height: 48, backgroundColor: bg }}
                  >
                    <Image
                      src={s.icon}
                      alt={s.title}
                      className={current ? 'invert' : ''}
                    />
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
                const activeDot = i <= active;
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

        {/* (vertical stepper removed; using horizontal layout per mock) */}
      </div>
      <button
        type='button'
        onClick={handleNext}
        disabled={isLast}
        className='w-full rounded-3xl bg-[#FF8127] py-4 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {isLast ? 'Статус финальный' : 'Изменить статус'}
      </button>
    </>
  );
};

export default CurrentStatus;
