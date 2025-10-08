'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { PAGES } from '@/config/pages.config';
import { useCart } from '@/store/cart';

const Category = () => {
  const router = useRouter();
  const searchParams = useSearchParams().get('category');
  const { categories } = useCart();

  const handleClick = (slug: string) => {
    router.replace(PAGES.MENU(slug));

    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <nav className='flex gap-4 p-4 pb-3.5 mb-3.5 overflow-x-auto rounded-4xl sticky top-12 z-20 bg-white'>
      {categories?.map((item, i) => (
        <button
          key={i}
          onClick={() => handleClick(item.categoryName)}
          className={`text-nowrap text-xl ${
            searchParams === item.categoryName
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
