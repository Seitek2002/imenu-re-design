'use client';

import { Check } from 'lucide-react';
import styles from './widgets.module.css';

export interface Step {
  key: string;
  label: string;
}
export type StepLadder = Step[];

type Tone = 'brand' | 'green' | 'amber' | 'red';

interface Props {
  ladder: StepLadder;
  currentIndex: number;
  tone: Tone;
}

const TONE_FILL_BG: Record<Tone, string> = {
  brand: 'bg-brand',
  green: 'bg-[#22A05A]',
  amber: 'bg-amber-600',
  red: 'bg-red-600',
};
const TONE_DOT_BORDER: Record<Tone, string> = {
  brand: 'border-brand',
  green: 'border-[#22A05A]',
  amber: 'border-amber-600',
  red: 'border-red-600',
};

export default function StepIndicator({ ladder, currentIndex, tone }: Props) {
  const total = ladder.length;
  const fillPct =
    currentIndex <= 0 ? 0 : Math.min(100, (currentIndex / (total - 1)) * 100);

  return (
    <div className='relative mt-[18px] pt-1.5 pb-[26px]'>
      <div className='absolute left-2 right-2 top-[13px] h-[2px] rounded-[1px] bg-[#ECE6DE]' />
      <div
        className={`absolute left-2 top-[13px] h-[2px] rounded-[1px] transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)] ${TONE_FILL_BG[tone]}`}
        style={{ width: `${fillPct}%` }}
      />
      <div className='relative z-[1] flex items-start justify-between'>
        {ladder.map((s, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const filled = isDone || isCurrent;
          return (
            <div
              key={s.key}
              className='relative flex min-w-0 flex-1 flex-col items-center gap-1'
            >
              <div
                className={`
                  grid h-[18px] w-[18px] place-items-center rounded-full border-2 bg-white
                  transition-all duration-300
                  shadow-[0_0_0_4px_white]
                  ${filled ? TONE_FILL_BG[tone] : 'bg-white'}
                  ${filled ? TONE_DOT_BORDER[tone] : 'border-[#ECE6DE]'}
                  ${isCurrent ? 'scale-[1.18]' : ''}
                  ${isCurrent ? styles.stepRingPulse : ''}
                `}
              >
                <Check
                  size={9}
                  strokeWidth={3}
                  className={`text-white ${filled ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>
              <span
                className={`
                  absolute top-6 whitespace-nowrap text-[10px] leading-[1.1] font-semibold tracking-tight
                  ${
                    isCurrent
                      ? 'font-bold text-[#0E0E0F]'
                      : isDone
                        ? 'text-[#4B4742]'
                        : 'text-[#8E8780]'
                  }
                `}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
