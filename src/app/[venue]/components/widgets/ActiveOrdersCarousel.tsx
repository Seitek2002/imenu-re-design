'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { OrderV2 } from '@/lib/order';
import ActiveOrderCard from './ActiveOrderCard';

interface Props {
  orders: OrderV2[];
  venueSlug: string;
}

/**
 * Snap-карусель активных заказов. Дизайн одинаковый на мобайл/планшет/ПК:
 * одна карточка ~88% ширины + peek соседней справа. На sm+ добавляются
 * стрелки навигации, под каруселью — dots-индикатор. Активный слайд
 * определяется по IntersectionObserver внутри scroll-контейнера.
 */
export default function ActiveOrdersCarousel({ orders, venueSlug }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollToIdx = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(orders.length - 1, idx));
      const el = itemRefs.current[clamped];
      if (!el || !scrollRef.current) return;
      // scrollLeft вручную — scrollIntoView дёргает страницу вертикально.
      scrollRef.current.scrollTo({
        left: el.offsetLeft - scrollRef.current.offsetLeft,
        behavior: 'smooth',
      });
    },
    [orders.length],
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const items = itemRefs.current.filter(
      (n): n is HTMLDivElement => n !== null,
    );
    if (items.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Из всех «видимых» берём с максимальным intersectionRatio — это
        // даёт стабильный active даже когда соседи попадают в peek.
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best || best.intersectionRatio < 0.5) return;
        const idx = Number(
          (best.target as HTMLElement).dataset.idx ?? '0',
        );
        setActiveIdx(idx);
      },
      { root, threshold: [0.5, 0.75, 0.95] },
    );

    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, [orders.length]);

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < orders.length - 1;

  return (
    <div>
      {/* Зона карточек — own positioning context. Гибрид: первая/последняя
          карточка прижимается к своему краю (peek только с одной стороны),
          средние центрируются с peek с обеих. snap-center даёт центровку,
          а отсутствие edge-margin позволяет крайним «упасть» к границе. */}
      <div className='relative'>
        <div
          ref={scrollRef}
          className='overflow-x-auto snap-x snap-mandatory no-scrollbar'
        >
          <div className='flex gap-2.5 py-1'>
            {orders.map((o, idx) => (
              <div
                key={o.id}
                ref={(node) => {
                  itemRefs.current[idx] = node;
                }}
                data-idx={idx}
                className='snap-center shrink-0 w-[84%]'
              >
                <ActiveOrderCard order={o} venueSlug={venueSlug} />
              </div>
            ))}
          </div>
        </div>

        {/* Fade-маска убрана — в centered-peek соседи сами видны полупиком,
            и градиент закрывал бы тот контент, который должен подсказывать
            «есть ещё». Сигнал «есть ещё» теперь = peek + dots + стрелки. */}

        {/* Стрелки — только sm+, на тач-устройствах привычнее свайп.
            top-1/2 теперь центрирован относительно карточек, не общего блока. */}
        <button
          type='button'
          onClick={() => scrollToIdx(activeIdx - 1)}
          disabled={!canPrev}
          aria-label='Предыдущий заказ'
          className='hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] border border-[#E5E5E5] text-[#323232] disabled:opacity-0 disabled:pointer-events-none transition-opacity active:scale-95'
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
        <button
          type='button'
          onClick={() => scrollToIdx(activeIdx + 1)}
          disabled={!canNext}
          aria-label='Следующий заказ'
          className='hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] border border-[#E5E5E5] text-[#323232] disabled:opacity-0 disabled:pointer-events-none transition-opacity active:scale-95'
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      </div>

      {/* Dots-индикатор: позиция + клик для прыжка. Inactive — тёмно-серый,
          чтобы не сливался с бежевым фоном (#F8F6F7). */}
      <div className='mt-2 flex items-center justify-center gap-1.5'>
        {orders.map((o, idx) => {
          const active = idx === activeIdx;
          return (
            <button
              key={o.id}
              type='button'
              onClick={() => scrollToIdx(idx)}
              aria-label={`Перейти к заказу ${idx + 1}`}
              aria-current={active}
              className={`h-1.5 rounded-full transition-all ${
                active
                  ? 'w-5 bg-[#323232]'
                  : 'w-1.5 bg-[#7F7F7F]/50 hover:bg-[#7F7F7F]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
