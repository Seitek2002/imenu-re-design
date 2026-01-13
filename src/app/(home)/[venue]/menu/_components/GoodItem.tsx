'use client';
import { FC, memo, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/api/types';
import { useBasket } from '@/store/basket';
import ImenuSquareSkeleton from '@/components/ui/ImenuSquareSkeleton';

import plus from '@/assets/Goods/plus.svg';
import minus from '@/assets/Goods/minus.svg';

type Props = { item: Product; onOpen?: (product: Product) => void };

const FoodItem: FC<Props> = ({ item, onOpen }) => {
  const { add, decrement, getQuantity } = useBasket();
  const [imgLoaded, setImgLoaded] = useState(false);

  const name = item.productName;
  const price = item.productPrice ? `${item.productPrice} сом` : '';
  const weight = item.weight ? `${item.weight}` : '';
  const img = item.productPhotoSmall || '/placeholder-dish.svg';
  const qnty = getQuantity(item.id, null);

  return (
    <div className='w-full'>
      <div
        className='relative w-full aspect-square rounded-2xl overflow-hidden'
        onClick={() => onOpen?.(item)}
      >
        {!imgLoaded && (
          <ImenuSquareSkeleton className='absolute inset-0 w-full h-full' />
        )}
        <Image
          src={img}
          alt={item.productName}
          className='object-cover'
          fill
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'
          onLoad={() => setImgLoaded(true)}
        />
        <div className='overflow-hidden relative h-full'>
          <div
            className='absolute z-[1] bottom-1.5 right-1.5 cursor-pointer bg-white p-3.5 rounded-full'
            onClick={(e) => {
              e.stopPropagation();
              if (
                Array.isArray(item.modificators) &&
                item.modificators.length > 0
              ) {
                onOpen?.(item);
              } else {
                add(item, { modifierId: null, quantity: 1 });
              }
              if (navigator.vibrate) navigator.vibrate(50);
            }}
          >
            <Image
              src={plus}
              alt='plus icon'
              className={`transition-all transform-gpu duration-500 ${
                qnty ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
          <div
            className={`absolute transform-gpu bottom-1.5 w-[93%] right-1.5 pr-10 h-10 overflow-hidden cursor-pointer bg-white rounded-full flex items-center justify-between transition-all duration-500 ${
              qnty ? '' : 'translate-x-[89%]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='h-full p-3.5'>
              <Image
                src={minus}
                alt='minus icon'
                onClick={(e) => {
                  e.stopPropagation();
                  decrement(item.id, null, 1);
                  if (navigator.vibrate) navigator.vibrate(50);
                }}
              />
            </div>
            <span className='text-[#21201F] text-lg font-semibold'>{qnty}</span>
            <div></div>
          </div>
        </div>
      </div>
      <h2 className='text-[#21201F] text-lg font-semibold'>{price}</h2>
      <h3 className='text-[#181818] font-medium line-clamp-1'>{name}</h3>
      <span className='text-[#979797]'>{weight}</span>
    </div>
  );
};

export default memo(FoodItem);
