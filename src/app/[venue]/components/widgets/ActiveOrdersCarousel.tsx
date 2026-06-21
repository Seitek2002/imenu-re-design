'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { OrderV2 } from '@/lib/order';
import ActiveOrderCard from './ActiveOrderCard';

interface Props {
  orders: OrderV2[];
  venueSlug: string;
}

/**
 * Snap-карусель активных заказов (Figma 471:765 — карточки идут «лентой»,
 * не стопкой). Одна карточка ~88% ширины + peek соседней справа; на sm+
 * добавляются стрелки навигации, под каруселью — dots-индикатор. Активный
 * слайд определяется по IntersectionObserver внутри scroll-контейнера.
 * Стиль точек/стрелок согласован с дизайн-системой виджетов (#323232/#7F7F7F).
 */
export default function ActiveOrdersCarousel({ orders, venueSlug }: Props) {
  const t = useTranslations('Widgets');
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
        const idx = Number((best.target as HTMLElement).dataset.idx ?? '0');
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
          className='no-scrollbar snap-x snap-mandatory overflow-x-auto'
        >
          <div className='flex gap-2.5 py-1'>
            {orders.map((o, idx) => (
              <div
                key={o.id}
                ref={(node) => {
                  itemRefs.current[idx] = node;
                }}
                data-idx={idx}
                className='w-[88%] shrink-0 snap-center'
              >
                <ActiveOrderCard order={o} venueSlug={venueSlug} />
              </div>
            ))}
          </div>
        </div>

        {/* Стрелки — только sm+, на тач-устройствах привычнее свайп.
            top-1/2 центрирован относительно карточек. */}
        <button
          type='button'
          onClick={() => scrollToIdx(activeIdx - 1)}
          disabled={!canPrev}
          aria-label={t('prevOrder')}
          className='absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ECECEC] bg-white/95 text-[#323232] shadow-[0px_4px_12px_rgba(115,115,115,0.16)] backdrop-blur transition-[opacity,background-color] hover:bg-[#FAFAFA] active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:flex'
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <button
          type='button'
          onClick={() => scrollToIdx(activeIdx + 1)}
          disabled={!canNext}
          aria-label={t('nextOrder')}
          className='absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ECECEC] bg-white/95 text-[#323232] shadow-[0px_4px_12px_rgba(115,115,115,0.16)] backdrop-blur transition-[opacity,background-color] hover:bg-[#FAFAFA] active:scale-95 disabled:pointer-events-none disabled:opacity-0 sm:flex'
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* Dots-индикатор: позиция + клик для прыжка. */}
      <div className='mt-2.5 flex items-center justify-center gap-1.5'>
        {orders.map((o, idx) => {
          const active = idx === activeIdx;
          return (
            <button
              key={o.id}
              type='button'
              onClick={() => scrollToIdx(idx)}
              aria-label={t('gotoOrder', { n: idx + 1 })}
              aria-current={active}
              className={`h-1.5 rounded-full transition-all ${
                active
                  ? 'w-5 bg-[#323232]'
                  : 'w-1.5 bg-[#D9D9D9] hover:bg-[#C4C4C4]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
