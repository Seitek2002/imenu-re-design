'use client';

import { memo, useRef } from 'react';
import Image from 'next/image';
import { safeImageSrc } from '@/lib/image';
import { BasketItem as BasketItemType } from '@/store/basket'; // <--- Правильный импорт

import plusIcon from '@/assets/Cart/plus.svg';
import minusIcon from '@/assets/Cart/minus.svg';
import trashRed from '@/assets/Cart/trash-red.svg';

interface Props {
  item: BasketItemType;
  promoBadge?: string;
  /** Цена строки до промо-скидки (с бэка). Если задана и > discountedLineTotal — рисуется зачёркнутой. */
  originalLineTotal?: number;
  /** Цена строки после промо-скидки (с бэка). */
  discountedLineTotal?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function BasketItem({
  item,
  promoBadge,
  originalLineTotal,
  discountedLineTotal,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const revealDelete = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 100, behavior: 'smooth' });
    }
  };

  const closeDelete = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <li className='relative w-full overflow-hidden border-b border-[#E7E7E7] last:border-none'>
      <div
        ref={scrollRef}
        className='flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar'
      >
        <div className='w-full shrink-0 flex items-center justify-between p-3 gap-3 snap-start bg-white'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-[#F1F2F3] shrink-0'>
              <Image
                src={safeImageSrc(item.productPhoto, '/placeholder.svg')}
                alt={item.productName}
                fill
                className='object-cover'
                sizes='64px'
              />
            </div>

            <div className='flex flex-col min-w-0'>
              <div className='flex items-center gap-1.5 min-w-0'>
                <span className='text-sm font-semibold text-[#21201F] truncate'>
                  {item.productName}
                </span>
                {promoBadge && (
                  <span className='shrink-0 text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md bg-brand/15 text-brand'>
                    {promoBadge}
                  </span>
                )}
              </div>
              {item.flatModName && (
                <span className='text-xs text-[#80868B] truncate'>
                  {item.flatModName}
                </span>
              )}
              {item.groupSelections && item.groupSelections.length > 0 && (
                <span className='text-xs text-[#80868B] truncate'>
                  {item.groupSelections
                    .flatMap((g) =>
                      g.items.map((i) =>
                        i.count > 1 ? `${i.name} ×${i.count}` : i.name,
                      ),
                    )
                    .join(', ')}
                </span>
              )}
              {(() => {
                const localTotal = item.lineUnitPrice * item.quantity;
                const finalTotal =
                  discountedLineTotal != null ? Math.round(discountedLineTotal) : localTotal;
                const showStrike =
                  originalLineTotal != null &&
                  discountedLineTotal != null &&
                  originalLineTotal - discountedLineTotal > 0.5;
                return (
                  <span className='mt-1 flex items-baseline gap-1.5'>
                    <span className='text-sm font-medium text-[#21201F]'>{finalTotal} с.</span>
                    {showStrike && (
                      <span className='text-[11px] text-[#A4A4A4] line-through'>
                        {Math.round(originalLineTotal!)} с.
                      </span>
                    )}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className='flex items-center gap-3 bg-[#EFEEEC] rounded-full px-1 py-1 shrink-0'>
            <button
              type='button'
              className='w-8 h-8 flex items-center justify-center rounded-full active:scale-90 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all cursor-pointer'
              onClick={() => {
                if (item.quantity <= 1) {
                  revealDelete();
                } else {
                  onDecrement();
                }
              }}
            >
              <Image src={minusIcon} alt='minus' />
            </button>

            <span className='w-4 text-center font-semibold text-sm'>
              {item.quantity}
            </span>

            <button
              type='button'
              className='w-8 h-8 flex items-center justify-center rounded-full active:scale-90 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all cursor-pointer'
              onClick={() => {
                closeDelete();
                onIncrement();
              }}
            >
              <Image src={plusIcon} alt='plus' />
            </button>
          </div>
        </div>

        {/* КНОПКА УДАЛЕНИЯ */}
        <div className='shrink-0 flex items-center justify-center w-20 snap-end bg-white pr-2'>
          <button
            onClick={onRemove}
            className='bg-[#EA635C] w-15 h-15 rounded-xl flex items-center justify-center active:scale-90 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all shadow-sm cursor-pointer'
          >
            <Image src={trashRed} alt='delete' width={24} height={24} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default memo(BasketItem);
