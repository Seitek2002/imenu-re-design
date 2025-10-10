'use client';

import { type Category } from '@/lib/api/types';
import { FC, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

type Props = {
  categories: Category[];
  activeSlug?: string;
  onSelect?: (slug: string, index: number) => void;
  headerHidden?: boolean;
};

export type CategoryHandle = { scrollToSlug: (slug?: string) => void };

const Category = forwardRef<CategoryHandle, Props>(({ categories, activeSlug, onSelect, headerHidden }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const scrollToSlug = (slug?: string) => {
    const key = slug ?? activeSlug;
    if (!key) return;
    const el = itemRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useImperativeHandle(ref, () => ({ scrollToSlug }));

  useEffect(() => {
    scrollToSlug();
  }, [activeSlug]);
  const handleClick = (slug: string, index: number) => {
    onSelect?.(slug, index);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <nav
      ref={containerRef}
      className={`flex transition-all duration-300 gap-4 p-4 pb-3.5 mb-3.5 overflow-x-auto rounded-4xl sticky ${headerHidden ? 'top-0' : 'top-12'} z-20 bg-white`}
    >
      {categories?.map((item, i) => (
        <button
          key={i}
          ref={(el) => {
            itemRefs.current[item.categoryName] = el;
          }}
          onClick={() => handleClick(item.categoryName, i)}
          className={`text-nowrap text-xl ${
            activeSlug === item.categoryName
              ? 'text-[#21201F] border-b-2 border-[#000]'
              : 'text-[#A2A2A2]'
          }`}
        >
          {item.categoryName}
        </button>
      ))}
    </nav>
  );
});

export default Category;
