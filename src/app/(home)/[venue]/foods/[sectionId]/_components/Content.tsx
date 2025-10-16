'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCategoriesV2 } from '@/lib/api/queries';
import { useCart } from '@/store/cart';

import ContentItem from './ContentItem';
import SkeletonCategoryCard from './SkeletonCategoryCard';

import { chunkByPattern, defaultGridPattern } from './Content.helpers';

const Content = () => {
  const params = useParams<{ venue?: string; sectionId?: string }>();
  const venueSlug =
    params?.venue ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
      : undefined);

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

  return (
    <div className='bg-white rounded-4xl p-4 pb-36 flex flex-col gap-2 mt-1.5'>
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
