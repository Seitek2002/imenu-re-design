import { FC, useRef } from 'react';

import Image from 'next/image';
import { CartItem, useBasket } from '@/store/basket';

import plusIcon from '@/assets/Basket/plus.svg';
import minusIcon from '@/assets/Basket/minus.svg';
import trashRed from '@/assets/Basket/trash-red.svg';

interface IProps {
  it: CartItem;
}

const Item: FC<IProps> = ({ it }) => {
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const { increment, decrement, remove } = useBasket();

  const revealDelete = (key: string) => {
    const el = itemRefs.current[key];
    if (!el) return;
    try {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } catch {
      el.scrollLeft = el.scrollWidth;
    }
  };

  return (
    <li
      ref={(el) => {
        itemRefs.current[it.key] = el;
      }}
      className='flex items-center justify-between gap-3 overflow-x-scroll relative min-h-[72px] no-scrollbar py-3'
    >
      <div className='flex items-center gap-3 min-w-[200px]'>
        <div className='relative w-16 h-16 rounded-[12px] overflow-hidden bg-[#F1F2F3] flex-shrink-0'>
          {it.image ? (
            <Image
              src={it.image}
              alt={it.name}
              fill
              className='object-cover'
              sizes='64px'
            />
          ) : (
            <Image
              src='/placeholder-dish.svg'
              alt='placeholder'
              fill
              className='object-cover'
              sizes='64px'
            />
          )}
        </div>
        <div className='min-w-0'>
          <div className='text-sm font-semibold text-[#21201F] truncate'>
            {it.name}
          </div>
          {it.modifierName && (
            <div className='text-xs text-[#80868B] truncate'>
              {it.modifierName}
            </div>
          )}
          <div className='text-sm text-[#21201F] mt-1'>
            {Math.round(it.unitPrice * it.quantity * 100) / 100} c
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3 bg-[#EFEEEC] rounded-full'>
        <button
          type='button'
          aria-label='minus'
          className='w-8 h-8 flex items-center justify-center'
          onClick={() => {
            if (it.quantity <= 1) {
              revealDelete(it.key);
            } else {
              decrement(it.productId, it.modifierId ?? null, 1);
            }
          }}
        >
          <Image src={minusIcon} alt='minusIcon' />
        </button>
        <span className='w-6 text-center font-semibold'>{it.quantity}</span>
        <button
          type='button'
          aria-label='plus'
          className='w-8 h-8 flex items-center justify-center'
          onClick={() => increment(it.productId, it.modifierId ?? null, 1)}
        >
          <Image src={plusIcon} alt='plusIcon' />
        </button>
      </div>

      <button
        type='button'
        aria-label='Удалить товар'
        onClick={() => remove(it.productId, it.modifierId ?? null)}
        className='absolute -right-20 bg-[#EA635C] py-6 px-4.5 rounded-lg w-[60px] h-[72px]'
      >
        <Image
          width={24}
          height={24}
          src={trashRed}
          alt='trash-icon'
          className='!max-w-[24px]'
        />
      </button>
    </li>
  );
};

export default Item;
