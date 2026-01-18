'use client';

import { FC } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useBasketStore } from '@/store/basket';
import { useMounted } from '@/hooks/useMounted';
import { Product } from '@/types/api';
import { useProductStore } from '@/store/product';

import plus from '@/assets/Goods/plus.svg';
import minus from '@/assets/Goods/minus.svg';

interface Props {
  product: Product;
}

const FoodItemCounter: FC<Props> = ({ product }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addToBasket = useBasketStore((state) => state.addToBasket);
  const decrementItem = useBasketStore((state) => state.decrementItem);
  const setProduct = useProductStore((state) => state.setProduct);

  const count = useBasketStore((state) =>
    state.items
      .filter((item) => item.id === product.id)
      .reduce((acc, item) => acc + item.quantity, 0)
  );

  const mounted = useMounted();
  const displayCount = mounted ? count : 0;
  const hasModifiers = product.modificators && product.modificators.length > 0;

  const openSheet = () => {
    setProduct(product); // Сохраняем в стор
    const params = new URLSearchParams(searchParams.toString());
    params.set('product', product.id.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.vibrate) navigator.vibrate(20);

    if (hasModifiers) {
      openSheet();
    } else {
      addToBasket(product);
    }
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(20);

    if (hasModifiers) {
      openSheet();
    } else {
      decrementItem(product.id.toString());
    }
  };

  return (
    <div
      className='overflow-hidden relative h-10 w-full rounded-full z-10'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* ПЛЮС */}
      <button
        aria-label={`Добавить ${product.productName}`}
        className='absolute z-10 bottom-0 right-0 cursor-pointer bg-white p-3.5 rounded-full shadow-sm active:scale-90 transition-transform'
        onClick={handlePlus}
      >
        <Image
          src={plus}
          alt=''
          className={`transition-transform duration-300 ${
            displayCount ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* СЛАЙДЕР С МИНУСОМ */}
      <div
        className={`absolute bottom-0 w-full right-0 pr-10 h-10 bg-white rounded-full flex items-center justify-between transition-transform duration-300 shadow-sm ${
          displayCount ? 'translate-x-0' : 'translate-x-[120%]'
        }`}
      >
        <button
          aria-label='Уменьшить'
          className='h-full p-3.5 flex items-center justify-center cursor-pointer active:scale-90 transition-transform'
          onClick={handleMinus}
        >
          <Image src={minus} alt='' />
        </button>
        <span className='text-[#21201F] text-lg font-semibold'>
          {displayCount}
        </span>
        <div className='w-2' />
      </div>
    </div>
  );
};

export default FoodItemCounter;
