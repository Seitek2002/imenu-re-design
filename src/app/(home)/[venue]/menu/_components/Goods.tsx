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

  // Filter by category and sort: items without photo go to the bottom
  const items = (data || [])
    .filter((p) => p.category?.categoryName === category)
    .sort((a, b) => {
      const aHas = !!(a.productPhoto && String(a.productPhoto).trim());
      const bHas = !!(b.productPhoto && String(b.productPhoto).trim());
      // Want items WITH photo first => bHas - aHas (true=1, false=0)
      return Number(bHas) - Number(aHas);
    });

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
