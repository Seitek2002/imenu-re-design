'use client';

import { FC, memo } from 'react';
import VirtualFoodItem from './VirtualFoodItem';
import { Product } from '@/types/api';

interface Props {
  products: Product[];
}

const Goods: FC<Props> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 px-2.5'>
      {products.map((product, index) => (
        <VirtualFoodItem
          key={product.id}
          product={product}
          index={index}
        />
      ))}
    </div>
  );
};

export default memo(Goods);
