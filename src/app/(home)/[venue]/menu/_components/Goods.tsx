import { FC } from 'react';
import GoodItem from './GoodItem';
import SkeletonGoodItem from './SkeletonGoodItem';

import { Category, type Product } from '@/lib/api/types';
import { useProductsV2 } from '@/lib/api/queries';
import { useParams } from 'next/navigation';

type Props = {
  category: Category['categoryName'];
  onOpen?: (product: Product) => void;
};

const Goods: FC<Props> = ({ category, onOpen }) => {
  const params = useParams<{ venue?: string }>();
  const venueSlug =
    params?.venue ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
      : undefined);

  const { data, isLoading } = useProductsV2({ venueSlug }, { enabled: !!venueSlug });

  const items = (data || []).filter(
    (p) => p.category?.categoryName === category
  );

  return (
    <div className='grid grid-cols-2 gap-2'>
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => <SkeletonGoodItem key={i} />)
      ) : items.length > 0 ? (
        items.map((item: Product) => (
          <GoodItem key={item.id} item={item} onOpen={onOpen} />
        ))
      ) : (
        <h1>Пусто</h1>
      )}
    </div>
  );
};

export default Goods;
