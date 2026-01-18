'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useBasketStore } from '@/store/basket';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  venueSlug: string;
}

export default function FloatingCartButton({ venueSlug }: Props) {
  const mounted = useMounted();
  const pathname = usePathname();

  const totalPrice = useBasketStore((state) => state.getTotalPrice());
  const totalCount = useBasketStore((state) => state.getItemCount());

  const isMainPage = new RegExp(`^/${venueSlug}(?:/d)?(?:/\\d+)*$`).test(
    pathname
  );
  const isCartPage = pathname === `/${venueSlug}/cart`;

  const isVisible = mounted && !isMainPage && !isCartPage && totalCount > 0;

  if (!mounted || totalPrice === 0) return;

  return (
    <div
      className={`
        fixed bottom-20 left-4 z-30 
        transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }
        right-21
      `}
    >
      <Link
        href={`/${venueSlug}/cart`}
        className='
          flex items-center justify-between 
          w-full h-14 px-5 
          bg-brand text-white 
          rounded-full shadow-xl 
          active:scale-95 transition-transform
        '
      >
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs font-bold'>
            {totalCount}
          </div>
          <span className='font-medium text-sm'>Корзина</span>
        </div>

        <span className='font-bold text-sm font-cruinn'>{totalPrice} c.</span>
      </Link>
    </div>
  );
}
