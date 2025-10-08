'use client';
import { FC, useState } from 'react';
import Image from 'next/image';
import type { ApiItem } from './Goods.helpers';

import plus from '@/assets/Goods/plus.svg';
import minus from '@/assets/Goods/minus.svg';

type Props = { item: ApiItem };

const FoodItem: FC<Props> = ({ item }) => {
  const [qnty, setQnty] = useState(0);

  const name = item.productName;
  const price = item.productPrice ? `${item.productPrice} сом` : '';
  const weight = item.weight ? `${item.weight}` : '';
  const img =
    item.productPhotoSmall ||
    item.productPhoto ||
    item.productPhotoLarge ||
    '/placeholder-dish.svg';

  const handleClick = (op: 'plus' | 'minus') => {
    if (op === 'plus') {
      setQnty(qnty + 1);
    } else {
      setQnty(qnty - 1);
    }
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className='w-full'>
      <div className='relative w-full aspect-square rounded-2xl overflow-hidden'>
        <Image src={img} alt='qwerty' fill className='object-cover' />
        <div
          className='absolute z-[1] bottom-1.5 right-1.5 cursor-pointer bg-white p-3.5 rounded-full'
          onClick={() => handleClick('plus')}
        >
          <Image
            src={plus}
            alt='plus icon'
            className={`transition-all duration-500 ${
              qnty ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        <div
          className={`absolute bottom-1.5 right-1.5 pr-10 h-10 overflow-hidden cursor-pointer bg-white rounded-full flex items-center justify-between transition-all duration-500 ${
            qnty ? ' w-[93%]' : ' w-[3%]'
          }`}
        >
          <div className='h-full p-3.5'>
            <Image
              src={minus}
              alt='minus icon'
              onClick={() => handleClick('minus')}
            />
          </div>
          <span className='text-[#21201F] text-lg font-semibold'>{qnty}</span>
          <div></div>
        </div>
      </div>
      <h2 className='text-[#21201F] text-lg font-semibold'>{price}</h2>
      <h3 className='text-[#181818] font-medium line-clamp-1'>{name}</h3>
      <span className='text-[#979797]'>{weight}</span>
    </div>
  );
};

export default FoodItem;
