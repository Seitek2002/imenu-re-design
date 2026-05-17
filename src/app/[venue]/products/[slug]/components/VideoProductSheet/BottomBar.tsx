'use client';

import { Plus, Minus } from 'lucide-react';

interface Props {
  qnty: number;
  onQntyChange: (n: number) => void;
  totalPrice: number;
  onAdd: () => void;
  disabled?: boolean;
}

/**
 * Нижняя плашка: счётчик количества (слева) и кнопка «+ <price> c» (справа).
 * Оранжевая acent-кнопка дублирует основной CTA приложения.
 */
export default function BottomBar({
  qnty,
  onQntyChange,
  totalPrice,
  onAdd,
  disabled = false,
}: Props) {
  return (
    <div
      className='relative z-10 flex items-center justify-between gap-2 px-3 py-2 backdrop-blur-md rounded-full'
    >
      <div
        className='flex items-center gap-4 px-2.5 h-12 rounded-full text-white bg-white/30 backdrop-blur-md'
        aria-label='Количество'
      >
        <button
          type='button'
          onClick={() => onQntyChange(Math.max(1, qnty - 1))}
          disabled={qnty <= 1}
          className='active:scale-90 transition-transform disabled:opacity-30'
          aria-label='Уменьшить количество'
        >
          <Minus size={28} />
        </button>
        <span className='font-medium text-base w-5 text-center select-none'>
          {qnty}
        </span>
        <button
          type='button'
          onClick={() => onQntyChange(qnty + 1)}
          className='active:scale-90 transition-transform'
          aria-label='Увеличить количество'
        >
          <Plus size={28} />
        </button>
      </div>

      <button
        type='button'
        onClick={onAdd}
        disabled={disabled}
        className='bg-[#F58D2A] text-white h-14 px-5.5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100'
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className='font-bold text-lg'>
          {Math.round(totalPrice)} <u className='font-normal'>c</u>
        </span>
      </button>
    </div>
  );
}
