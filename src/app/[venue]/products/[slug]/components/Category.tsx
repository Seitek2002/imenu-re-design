'use client';

import { FC, useEffect, useRef } from 'react';
import { Category as CategoryType } from '@/types/api';

interface Props {
  categories: CategoryType[];
  activeSlug: string;
  onSelect: (index: number) => void;
}

const Category: FC<Props> = ({ categories, activeSlug, onSelect }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Нативный метод браузера - самый быстрый
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center', // Центрирует кнопку автоматически
      });
    }
  }, [activeSlug]);

  return (
    <nav
      ref={scrollContainerRef}
      className='flex gap-4 px-5 pb-2 overflow-x-auto no-scrollbar scroll-smooth'
    >
      {categories.map((item, i) => {
        const isActive = item.slug === activeSlug;
        return (
          <button
            key={item.id}
            ref={isActive ? activeBtnRef : null}
            onClick={() => onSelect(i)}
            className={`
              whitespace-nowrap text-lg pb-2 transition-all duration-300
              ${
                isActive
                  ? 'text-[#21201F] font-bold border-b-2 border-[#21201F]'
                  : 'text-[#757575] font-medium border-b-2 border-transparent hover:text-gray-600'
              }
            `}
          >
            {item.categoryName}
          </button>
        );
      })}
    </nav>
  );
};

export default Category;
