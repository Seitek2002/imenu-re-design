'use client';

import { useEffect, useMemo } from 'react';
import Goods from './Goods';
import { Product, Category } from '@/types/api';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { useCheckout } from '@/store/checkout';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  category: Category;
  products: Product[];
}

const SingleCategoryContent = ({ category, products }: Props) => {
  const setHeaderTitleOverride = useUIStore((s) => s.setHeaderTitleOverride);

  const mounted = useMounted();
  const tableNumber = useVenueStore((s) => s.tableNumber);
  const userSelectedType = useCheckout((s) => s.userSelectedType);
  const isDelivery = mounted && !tableNumber && userSelectedType === 'delivery';

  const visibleProducts = useMemo(
    () =>
      isDelivery
        ? products.filter((p) => p.available_for_delivery !== false)
        : products,
    [products, isDelivery],
  );

  useEffect(() => {
    setHeaderTitleOverride(category.categoryName);
    return () => setHeaderTitleOverride(null);
  }, [category.categoryName, setHeaderTitleOverride]);

  return (
    <div className='bg-white rounded-t-4xl mt-4 min-h-screen pb-40 border-t border-gray-100'>
      <div className='pt-6'>
        <Goods products={visibleProducts} />
      </div>
    </div>
  );
};

export default SingleCategoryContent;
