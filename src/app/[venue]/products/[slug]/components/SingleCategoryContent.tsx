'use client';

import { useEffect } from 'react';
import Goods from './Goods';
import { Product, Category } from '@/types/api';
import { useUIStore } from '@/store/ui';

interface Props {
  category: Category;
  products: Product[];
}

const SingleCategoryContent = ({ category, products }: Props) => {
  const setHeaderTitleOverride = useUIStore((s) => s.setHeaderTitleOverride);

  useEffect(() => {
    setHeaderTitleOverride(category.categoryName);
    return () => setHeaderTitleOverride(null);
  }, [category.categoryName, setHeaderTitleOverride]);

  return (
    <div className='bg-white rounded-t-4xl mt-4 min-h-screen pb-40 border-t border-gray-100'>
      <div className='pt-6'>
        <Goods products={products} />
      </div>
    </div>
  );
};

export default SingleCategoryContent;
