import { FC } from 'react';

interface Props {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: FC<Props> = ({ value, size = 52, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className='relative flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      {/* SVG Container */}
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* Серый фоновый круг */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#E5E7EB' // gray-200
          strokeWidth={strokeWidth}
          fill='transparent'
        />
        {/* Цветной круг прогресса */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='var(--brand)' // Берет цвет из глобальных стилей
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          className='transition-all duration-1000 ease-out'
        />
      </svg>

      {/* Текст внутри */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-[11px] font-bold text-brand leading-none'>
          {clamped >= 100 ? '✓' : `${clamped}%`}
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
