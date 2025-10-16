'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategoriesV2 } from '@/lib/api/queries';
import { useCart } from '@/store/cart';

import ContentItem from './ContentItem';
import SkeletonCategoryCard from './SkeletonCategoryCard';

import { chunkByPattern, defaultGridPattern } from './Content.helpers';
import { PAGES } from '@/config/pages.config';

const Content = () => {
  const params = useParams<{ venue?: string; sectionId?: string }>();
  const venueSlug =
    params?.venue ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
      : undefined);

  const router = useRouter();

  const { data } = useCategoriesV2({ venueSlug }, { enabled: !!venueSlug });
  const { setCategories } = useCart();
  const rows = chunkByPattern(
    data?.filter((item) => item.sections?.includes(+params.sectionId!)) || [],
    defaultGridPattern
  );
  const skeletonRows = chunkByPattern(
    new Array(10).fill(null),
    defaultGridPattern
  );

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  // Auto-navigate when only one category exists for this section
  useEffect(() => {
    if (!venueSlug || !data || !params?.sectionId) return;
    const filtered = data.filter((item) => item.sections?.includes(+params.sectionId!));
    if (filtered.length === 1) {
      const slug = filtered[0].categoryName;
      router.replace('/' + venueSlug + '/' + PAGES.MENU(slug), { scroll: false });
    }
  }, [data, venueSlug, params?.sectionId, router]);

  return (
    <div className='bg-white rounded-b-4xl p-4 pb-36 flex flex-col gap-2'>
      {(data && rows.length ? rows : skeletonRows).map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid ${
            row.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          } gap-2`}
        >
          {data && rows.length
            ? row.map((item, i) => (
                <ContentItem
                  key={i}
                  name={item.categoryName}
                  img={item.categoryPhotoSmall}
                  slug={item.categoryName}
                  venueSlug={venueSlug || ''}
                />
              ))
            : row.map((_, i) => <SkeletonCategoryCard key={i} />)}
        </div>
      ))}
    </div>
  );
};

export default Content;
