'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useUIStore } from '@/store/ui';

// Ленивый импорт — код подтягивается только когда пользователь открывает поиск.
const SearchResults = dynamic(() => import('@/app/components/SearchResults'), {
  loading: () => (
    <div className='h-40 animate-pulse bg-gray-100 rounded-xl mx-2 my-4' />
  ),
});

interface Props {
  children: ReactNode;
}

/**
 * Общая обёртка для страниц, на которых поднимается глобальный поиск
 * (Header.showSearch=true). Когда `isSearchOpen` — показываем SearchResults
 * вместо основного контента.
 */
export default function SearchOverlay({ children }: Props) {
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);

  if (isSearchOpen) {
    return <SearchResults />;
  }

  return <>{children}</>;
}
