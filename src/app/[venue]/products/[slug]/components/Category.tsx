'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Category as CategoryType } from '@/types/api';

interface Props {
  categories: CategoryType[];
  counts?: number[];
  activeSlug: string;
  onSelect: (index: number) => void;
}

const Category: FC<Props> = ({ categories, counts, activeSlug, onSelect }) => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);

  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Fade-эджи: показываем градиенты только когда есть скрытый контент
  // в соответствующую сторону.
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSlug]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft: sl, scrollWidth, clientWidth } = el;
      setEdges({
        left: sl > 4,
        right: sl + clientWidth < scrollWidth - 4,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [categories.length]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;

    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }

    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Если категорий мало и они влезают без скролла — растягиваем по ширине,
  // чтобы не жались сиротливо к левому краю.
  const fitsWithoutScroll = !edges.left && !edges.right && categories.length <= 4;

  return (
    <div className='relative'>
      <nav
        ref={scrollContainerRef}
        className={`
          flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar select-none
          ${fitsWithoutScroll ? 'justify-around' : ''}
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
      >
        {categories.map((item, i) => {
          const isActive = item.slug === activeSlug;
          const count = counts?.[i];
          const isVirtual = item.id < 0;
          const thumb = item.categoryPhotoSmall || item.categoryPhoto || '';

          return (
            <button
              key={item.id}
              ref={isActive ? activeBtnRef : null}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                onSelect(i);
              }}
              className={`
                shrink-0 inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5
                rounded-full whitespace-nowrap text-base transition-colors duration-200
                ${
                  isActive
                    ? 'bg-[#21201F] text-white font-semibold'
                    : 'bg-gray-100 text-[#5C5C5C] font-medium hover:bg-gray-200'
                }
              `}
            >
              <span
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full overflow-hidden text-base
                  ${isActive ? 'bg-white/15' : 'bg-white'}
                `}
              >
                {isVirtual ? (
                  <span aria-hidden>🔥</span>
                ) : thumb ? (
                  <Image
                    src={thumb}
                    alt=''
                    width={28}
                    height={28}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span
                    aria-hidden
                    className={isActive ? 'text-white/80' : 'text-[#9A9A9A]'}
                  >
                    {item.categoryName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span>{item.categoryName}</span>
              {count != null && count > 0 && (
                <span
                  className={`
                    text-sm font-normal
                    ${isActive ? 'text-white/70' : 'text-[#9A9A9A]'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Fade-эджи: подсказывают, что в соответствующую сторону есть скрытые табы. */}
      <div
        className={`
          pointer-events-none absolute left-0 top-0 bottom-2 w-6
          bg-gradient-to-r from-white to-transparent
          transition-opacity duration-200
          ${edges.left ? 'opacity-100' : 'opacity-0'}
        `}
      />
      <div
        className={`
          pointer-events-none absolute right-0 top-0 bottom-2 w-6
          bg-gradient-to-l from-white to-transparent
          transition-opacity duration-200
          ${edges.right ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  );
};

export default Category;
