'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import HomeLink from './HomeLink';
import SkeletonHomeLink from './SkeletonHomeLink';

import { useMainButtonsV2 } from '@/lib/api/queries';
import type { MainButtonsResponse } from '@/lib/api/types';

const HomeLinks: FC = () => {
  // Resolve venueSlug from route or localStorage after mount to avoid hydration mismatch
  const params = useParams<{ venue?: string }>();
  const [venueSlug, setVenueSlug] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fromParams = params?.venue;
    if (fromParams) {
      setVenueSlug(fromParams);
      return;
    }
    try {
      const stored = typeof window !== 'undefined'
        ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
        : '';
      setVenueSlug(stored || undefined);
    } catch {
      setVenueSlug(undefined);
    }
  }, [params?.venue]);

  const { data, isLoading } = useMainButtonsV2(venueSlug || '', {
    enabled: !!venueSlug,
  });

  // rows: two arrays as per API. Keep layout: first row 2 cols, second row 3 cols
  const rows: MainButtonsResponse = useMemo(() => {
    if (data && Array.isArray(data) && data.length === 2) return data;
    return [[], []];
  }, [data]);

  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4'>
      {[0, 1].map((rowIdx) => {
        const row = rows[rowIdx] || [];
        const colsClass = rowIdx === 0 ? 'grid-cols-2' : 'grid-cols-3';
        const textSize = rowIdx === 0 ? 'text-xl' : 'text-base';

        return (
          <div
            key={rowIdx}
            className={`home-links-content grid ${colsClass} gap-3 ${
              rowIdx > 0 ? 'mt-3' : ''
            } ${textSize}`}
          >
            {isLoading
              ? Array.from({ length: rowIdx === 0 ? 2 : 3 }).map((_, idx) => (
                  <SkeletonHomeLink key={idx} />
                ))
              : row.map((btn) => (
                  <HomeLink
                    key={btn.id}
                    img={btn.photo ?? '/placeholder-dish.svg'}
                    label={btn.name ?? ''}
                  />
                ))}
          </div>
        );
      })}
    </div>
  );
};

export default HomeLinks;
