'use client';

import { type Category } from '@/lib/api/types';
import { FC } from 'react';

type Props = {
  categories: Category[];
  activeSlug?: string;
  onSelect?: (slug: string, index: number) => void;
};

const Category: FC<Props> = ({ categories, activeSlug, onSelect }) => {
  const handleClick = (slug: string, index: number) => {
    onSelect?.(slug, index);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <nav className='flex gap-4 p-4 pb-3.5 mb-3.5 overflow-x-auto rounded-4xl sticky top-12 z-20 bg-white'>
      {categories?.map((item, i) => (
        <button
          key={i}
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
};

export default Category;
