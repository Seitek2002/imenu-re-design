import { FC, ReactNode } from 'react';

interface Props {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  color?: string; // CSS color for progress ring; defaults to brand
  children?: ReactNode; // overrides default % text inside the ring
}

const CircularProgress: FC<Props> = ({
  value,
  size = 52,
  strokeWidth = 4,
  color = 'var(--brand)',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className='relative flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#E5E7EB'
          strokeWidth={strokeWidth}
          fill='transparent'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          className='transition-all duration-1000 ease-out'
        />
      </svg>

      <div className='absolute inset-0 flex items-center justify-center'>
        {children ?? (
          <span
            className='text-[11px] font-bold leading-none'
            style={{ color }}
          >
            {clamped >= 100 ? '✓' : `${clamped}%`}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
