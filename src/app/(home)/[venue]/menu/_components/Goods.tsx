import { FC, useMemo } from 'react';
import GoodItem from './GoodItem';
import SkeletonGoodItem from './SkeletonGoodItem';

import { type ApiItem } from './Goods.helpers';
import { Category } from '@/lib/api/types';
import { useProductsV2 } from '@/lib/api/queries';
import { useParams } from 'next/navigation';

type Props = {
  category: Category['categoryName'];
};

const Goods: FC<Props> = ({ category }) => {
  const params = useParams<{ venue?: string }>();
  const venueSlug =
    params?.venue ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
      : undefined);

  const { data, isLoading } = useProductsV2({ venueSlug }, { enabled: !!venueSlug });

  const items: ApiItem[] = useMemo(() => {
    const products = data || [];
    const mapped: ApiItem[] = products.map((p: any) => ({
      id: p.id,
      productName: p.productName,
      productDescription: null,
      productPrice: p.productPrice ?? 0,
      weight: p.weight ?? 0,
      productPhoto: p.productPhoto ?? null,
      productPhotoSmall: p.productPhotoSmall ?? '',
      productPhotoLarge: p.productPhotoLarge ?? '',
      category: {
        id: p.category?.id ?? 0,
        categoryName: p.category?.categoryName ?? '',
      },
      isRecommended: false,
      modificators: [],
    }));
    return mapped.filter((item) => item.category.categoryName === category);
  }, [data, category]);

  return (
    <div className='grid grid-cols-2 gap-2'>
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => <SkeletonGoodItem key={i} />)
      ) : items.length > 0 ? (
        items.map((item: ApiItem) => <GoodItem key={item.id} item={item} />)
      ) : (
        <h1>Пусто</h1>
      )}
    </div>
  );
};

export default Goods;
