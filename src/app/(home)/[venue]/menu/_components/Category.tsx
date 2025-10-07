'use client';

import { categoryItems } from './Category.helpers';
import { useRouter, useSearchParams } from 'next/navigation';

import { PAGES } from '@/config/pages.config';

const Category = () => {
  const router = useRouter();
  const searchParams = useSearchParams().get('category');

  const handleClick = (slug: string) => {
    router.replace(PAGES.MENU(slug));

    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <nav className='flex gap-4 p-4 pb-3.5 mb-3.5 overflow-x-auto rounded-4xl sticky top-12 z-20 bg-white'>
      {categoryItems.map((item) => (
        <button
          key={item.slug}
          onClick={() => handleClick(item.slug)}
          className={`text-nowrap text-xl ${
            searchParams === item.slug
              ? 'text-[#21201F] border-b-2 border-[#000]'
              : 'text-[#A2A2A2]'
          }`}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );
};

export default Category;
