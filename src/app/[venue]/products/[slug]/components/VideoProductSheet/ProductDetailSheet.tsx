'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ProductDetails } from '@/data/mock-video-products';

interface Props {
  open: boolean;
  details: ProductDetails;
  onClose: () => void;
}

/**
 * Листок «Подробнее» — выезжает снизу поверх видео-витрины.
 * Показывает полное описание продукта: состав, вкус, подачу.
 */
export default function ProductDetailSheet({ open, details, onClose }: Props) {
  // Закрытие по ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Затемнение позади листка */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-20 transition-opacity duration-400 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden='true'
      />

      {/* Листок */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label={details.fullTitle}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
        }}
        className={`
          absolute inset-x-0 bottom-0 z-30
          rounded-t-[28px] overflow-hidden
          bg-black/35 backdrop-blur-3xl
          transition-transform duration-500
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Ручка */}
        <div className='flex justify-center pt-3 pb-1'>
          <div className='w-10 h-1 rounded-full bg-white/30' />
        </div>

        {/* Кнопка закрытия */}
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ring-1 ring-white/20'
          aria-label='Закрыть'
        >
          <X size={18} strokeWidth={2.5} className='text-white' />
        </button>

        {/* Контент */}
        <div className='overflow-y-auto overscroll-contain max-h-[75vh] px-6 pt-2 pb-4'>
          <h2 className='text-white text-2xl font-bold leading-snug mt-2 pr-10'>
            {details.fullTitle}
          </h2>

          <p className='text-white/75 text-[15px] leading-relaxed mt-4'>
            {details.description}
          </p>

          {details.sections.map((s) => (
            <div key={s.heading} className='mt-6'>
              <h3 className='text-white text-lg font-semibold'>{s.heading}</h3>
              <p className='text-white/70 text-[15px] leading-relaxed mt-1'>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
