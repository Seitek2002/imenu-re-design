'use client';
import { FC, useState } from 'react';
import Image, { StaticImageData } from 'next/image';

import plus from '@/assets/Goods/plus.svg';
import minus from '@/assets/Goods/minus.svg';

type Props = {
  name: string;
  price: string;
  weight: string;
  img: StaticImageData;
};

const FoodItem: FC<Props> = ({ name, price, weight, img }) => {
  const [quantity, setQuantity] = useState(0);

  const handleClick = (str: string) => {
    if (str === 'plus') {
      setQuantity(quantity + 1);
    } else {
      setQuantity(quantity - 1);
    }

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className='w-40'>
      <div className='w-full h-40 rounded-2xl overflow-hidden flex justify-center items-center relative'>
        <Image src={img} alt='qwerty' className='h-full object-cover' />
        <div
          className='absolute z-[1] bottom-1.5 right-1.5 cursor-pointer bg-white p-3.5 rounded-full'
          onClick={() => handleClick('plus')}
        >
          <Image
            src={plus}
            alt='plus icon'
            className={`transition-all duration-500 ${
              quantity ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        <div
          className={`absolute bottom-1.5 right-1.5 pr-10 h-10 overflow-hidden cursor-pointer bg-white rounded-full flex items-center justify-between transition-all duration-500 ${
            quantity ? ' w-[93%]' : ' w-[3%]'
          }`}
        >
          <div className='h-full p-3.5'>
            <Image
              src={minus}
              alt='minus icon'
              onClick={() => handleClick('minus')}
            />
          </div>
          <span className='text-[#21201F] text-lg font-semibold'>
            {quantity}
          </span>
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
