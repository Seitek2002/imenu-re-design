'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Category as CategoryType } from '@/types/api';

interface Props {
  categories: CategoryType[];
  activeSlug: string;
  onSelect: (index: number) => void;
}

const Category: FC<Props> = ({ categories, activeSlug, onSelect }) => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // --- Стейты для свайпа мышью ---
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    // Нативный метод браузера - самый быстрый
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSlug]);

  // --- Логика перетаскивания (Drag-to-Scroll) ---
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false); // Сбрасываем флаг при новом нажатии
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault(); // Предотвращаем выделение текста при тяге

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Умножаем на 2 для скорости свайпа

    // Если мышка сдвинулась больше чем на 5 пикселей, считаем это свайпом, а не кликом
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }

    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <nav
      ref={scrollContainerRef}
      // 🔥 Убрали scroll-smooth для устранения лагов при ручном свайпе.
      // Добавили select-none и курсоры grab/grabbing для визуальной обратной связи.
      className={`
        flex gap-4 px-5 pb-2 overflow-x-auto no-scrollbar select-none
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUpOrLeave}
      onMouseLeave={onMouseUpOrLeave}
    >
      {categories.map((item, i) => {
        const isActive = item.slug === activeSlug;
        return (
          <button
            key={item.id}
            ref={isActive ? activeBtnRef : null}
            onClick={(e) => {
              // 🔥 Блокируем клик, если пользователь только что перетаскивал панель,
              // чтобы категория случайно не переключилась
              if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              onSelect(i);
            }}
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
