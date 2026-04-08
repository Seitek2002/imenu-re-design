import { FC } from 'react';
import { Product } from '@/types/api';
import placeholder from '@/assets/Foods/placeholder.webp';
import FoodItemImage from './foods/FoodItemImage';
import FoodItemCounter from './foods/FoodItemCounter';
import ProductLink from './foods/ProductLink';

interface Props {
  product: Product;
  index?: number;
}

const FoodItem: FC<Props> = ({ product, index = 0 }) => {
  let price = product.productPrice;
  let isFrom = false;

  if (price === 0 && product.modificators && product.modificators.length > 0) {
    price = Math.min(...product.modificators.map((m) => m.price));
    isFrom = true;
  }

  const imageUrl =
    product.productPhotoSmall || product.productPhoto || placeholder;
  const isPriority = index < 4;

  return (
    <div className='w-full flex flex-col h-full group relative'>
      <ProductLink product={product} className='absolute inset-0 z-0' />

      <div className='relative w-full aspect-square pointer-events-none'>
        <FoodItemImage
          src={imageUrl}
          alt={product.productName}
          isPriority={isPriority}
        />

        <div className='absolute bottom-1.5 right-1.5 left-1.5 z-10 pointer-events-auto'>
          <FoodItemCounter product={product} />
        </div>
      </div>

      <div className='mt-2 flex flex-col flex-1 justify-between pointer-events-none'>
        <h2 className='text-[#21201F] text-lg font-semibold'>
          {isFrom && (
            <span className='text-sm font-normal text-gray-500 mr-1'>от</span>
          )}
          {price} с.
        </h2>
        <h3 className='text-[#181818] text-sm font-medium leading-tight line-clamp-2 group-active:text-brand transition-colors'>
          {product.productName}
        </h3>
        {product.weight > 0 && (
          <span className='text-[#757575] text-xs mt-1'>
            {product.weight} г
          </span>
        )}
      </div>
    </div>
  );
};

export default FoodItem;
