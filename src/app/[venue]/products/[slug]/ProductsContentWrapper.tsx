'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic'; // 1. Импортируем dynamic
import { useUIStore } from '@/store/ui';

// 2. Делаем ленивый импорт. Код этого компонента не попадет в основной JS бандл,
// пока isSearchOpen не станет true.
const SearchResults = dynamic(() => import('@/app/components/SearchResults'), {
  loading: () => (
    <div className='h-40 animate-pulse bg-gray-100 rounded-xl mx-2 my-4' />
  ),
});

interface Props {
  children: ReactNode;
}

export default function ProductsContentWrapper({ children }: Props) {
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);

  if (isSearchOpen) {
    return <SearchResults />;
  }

  return <>{children}</>;
}
