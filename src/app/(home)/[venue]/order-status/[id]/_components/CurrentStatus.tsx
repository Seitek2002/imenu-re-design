'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import clockIcon from '@/assets/OrderStatus/clock.svg';
import chefIcon from '@/assets/OrderStatus/chef-hat.svg';
import checkIcon from '@/assets/OrderStatus/check.svg';
import geoIcon from '@/assets/OrderStatus/geo.svg';

type Step = {
  key: number;
  title: string;
  desc: string;
  icon: any;
};

const steps: Step[] = [
  {
    key: 0,
    title: 'Спасибо, ваш заказ оформлен!',
    desc: 'Мы приняли ваш заказ и передали на кухню',
    icon: clockIcon,
  },
  {
    key: 1,
    title: 'Готовим заказ',
    desc: 'Наши повара уже занимаются вашим блюдом',
    icon: chefIcon,
  },
  {
    key: 2,
    title: 'Заказ готов',
    desc: 'Можно забирать на стойке',
    icon: checkIcon,
  },
  {
    key: 3,
    title: 'Заказ выполнен',
    desc: 'Приятного аппетита!',
    icon: geoIcon,
  },
];

const CurrentStatus = () => {
  const [active, setActive] = useState(0);

  const isLast = active >= steps.length - 1;

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;
    // 4 steps: 25%, 50%, 75%, 100%
    return ((active + 1) / steps.length) * 100;
  }, [active]);

  function handleNext() {
    if (!isLast) setActive((i) => Math.min(i + 1, steps.length - 1));
  }

  return (
    <>
      <div className='px-4 pt-3'>
        {/* Header card with title, subtitle, icons and baseline (horizontal) */}
        <div className='rounded-2xl bg-white p-4 shadow-sm'>
          {/* Title + subtitle like on mock */}
          <div className='mb-4'>
            <h3 className='text-[22px] leading-7 font-semibold'>
              {steps[active]?.title}
            </h3>
            <p className='text-[#9CA3AF] text-[14px] leading-5 mt-1'>
              {steps[active]?.desc}
            </p>
          </div>

          {/* Icons row (grid so dots align exactly under icons) */}
          <div className='flex justify-around items-center mb-3 gap-2'>
            {steps.map((s, i) => {
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
              {steps.map((_, i) => {
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
