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
      style={{
        paddingBottom:
          'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
      }}
      className='relative z-10 flex items-stretch gap-2 px-3 pt-2'
    >
      <div
        className='flex items-center gap-4 px-5 h-14 rounded-full text-[#21201F] bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-md'
        aria-label='Количество'
      >
        <button
          type='button'
          onClick={() => onQntyChange(Math.max(1, qnty - 1))}
          disabled={qnty <= 1}
          className='active:scale-90 transition-transform disabled:opacity-30'
          aria-label='Уменьшить количество'
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <span className='font-bold text-base w-5 text-center select-none'>
          {qnty}
        </span>
        <button
          type='button'
          onClick={() => onQntyChange(qnty + 1)}
          className='active:scale-90 transition-transform'
          aria-label='Увеличить количество'
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      <button
        type='button'
        onClick={onAdd}
        disabled={disabled}
        className='flex-1 min-w-0 bg-[#F58D2A] text-white h-14 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100'
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className='font-bold text-lg'>
          {Math.round(totalPrice)} <u className='font-normal'>c</u>
        </span>
      </button>
    </div>
  );
}
