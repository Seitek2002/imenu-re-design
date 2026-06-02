'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { safeImageSrc } from '@/lib/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, ShoppingBag, Trash2 } from 'lucide-react';
import { useBasketStore } from '@/store/basket';
import { useUiFloatingStore } from '@/store/ui-floating';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  venueSlug: string;
}

export default function FloatingCartButton({ venueSlug }: Props) {
  const mounted = useMounted();
  const pathname = usePathname();
  const t = useTranslations('Cart');

  const totalPrice = useBasketStore((state) => state.getTotalPrice());
  const totalCount = useBasketStore((state) => state.getItemCount());
  const items = useBasketStore((state) => state.items);
  const removeFromBasket = useBasketStore((state) => state.removeFromBasket);
  const billBannerOpen = useUiFloatingStore((s) => s.billBannerOpen);

  const isCartPage = pathname.endsWith('/cart');
  const isTableOrderPage = pathname.includes('/table-order');

  const isVisible =
    mounted && totalCount > 0 && !isCartPage && !isTableOrderPage && !billBannerOpen;

  // Кратковременный label "Добавлено" + лёгкий pulse FAB-а при росте счётчика.
  // Decrement → только мягкий pulse-down (без label), чтобы было понятно «зарегистрировано».
  const prevCountRef = useRef(totalCount);
  const [showAdded, setShowAdded] = useState(false);
  const [pulse, setPulse] = useState<'up' | 'down' | null>(null);
  useEffect(() => {
    if (!mounted) {
      prevCountRef.current = totalCount;
      return;
    }
    if (totalCount > prevCountRef.current) {
      setShowAdded(true);
      setPulse('up');
      const tAdded = setTimeout(() => setShowAdded(false), 2200);
      const tPulse = setTimeout(() => setPulse(null), 350);
      prevCountRef.current = totalCount;
      return () => {
        clearTimeout(tAdded);
        clearTimeout(tPulse);
      };
    }
    if (totalCount < prevCountRef.current) {
      setPulse('down');
      const tPulse = setTimeout(() => setPulse(null), 250);
      prevCountRef.current = totalCount;
      return () => clearTimeout(tPulse);
    }
    prevCountRef.current = totalCount;
  }, [totalCount, mounted]);

  if (!mounted || totalCount === 0) return null;

  return (
    <div
      className={`
        fixed z-30
        left-0 right-0 max-w-175 mx-auto bottom-20
        lg:left-auto lg:right-8 lg:max-w-none lg:mx-0 lg:bottom-28
        transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }
      `}
    >
      <div
        aria-hidden
        className='lg:hidden absolute inset-x-0 -top-12 h-24 bg-gradient-to-t from-white/70 via-white/30 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_top,black_55%,transparent)] pointer-events-none'
      />
      <div className='relative group lg:w-fit'>
        <Link
          href={`/${venueSlug}/cart`}
          aria-label={`${t('title')} — ${totalPrice} с.`}
          className={`
            relative mx-4
            flex items-center justify-between
            h-14 px-5
            bg-brand text-white
            rounded-full shadow-xl
            active:scale-95 hover:brightness-110 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none transition-all
            lg:mx-0 lg:w-16 lg:h-16 lg:px-0 lg:justify-center
            ${pulse === 'up' ? 'scale-110' : pulse === 'down' ? 'scale-95' : 'scale-100'}
          `}
        >
          <div className='flex items-center gap-3 lg:hidden'>
            <div className='flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs font-bold'>
              {totalCount}
            </div>
            <span className='font-medium text-sm'>{t('title')}</span>
          </div>

          <span className='font-bold text-sm lg:hidden'>{totalPrice} с.</span>

          <ShoppingBag size={26} className='hidden lg:block' strokeWidth={2.2} />

          <span className='hidden lg:flex absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-white text-brand text-[11px] font-extrabold rounded-full items-center justify-center px-1.5 leading-none ring-2 ring-brand'>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        </Link>

        <span
          role='status'
          aria-live='polite'
          className={`absolute right-full top-1/2 -translate-y-1/2 mr-4 lg:mr-3 whitespace-nowrap bg-[#111111] text-white text-xs font-bold pl-2 pr-3 py-2 rounded-full pointer-events-none shadow-lg flex items-center gap-1.5 transition-all duration-300 z-10 ${
            showAdded
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-2'
          }`}
        >
          <span className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500'>
            <Check size={11} strokeWidth={3.5} className='text-white' />
          </span>
          {t('added')}
        </span>

        <MiniCartPreview
          items={items}
          totalCount={totalCount}
          totalPrice={totalPrice}
          venueSlug={venueSlug}
          onRemove={removeFromBasket}
          hidden={showAdded}
        />
      </div>
    </div>
  );
}

interface MiniCartItem {
  key: string;
  productName: string;
  productPhoto?: string;
  quantity: number;
  lineUnitPrice: number;
  flatModName?: string;
}

function MiniCartPreview({
  items,
  totalCount,
  totalPrice,
  venueSlug,
  onRemove,
  hidden,
}: {
  items: MiniCartItem[];
  totalCount: number;
  totalPrice: number;
  venueSlug: string;
  onRemove: (key: string) => void;
  hidden: boolean;
}) {
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');

  const MAX_VISIBLE = 4;
  // Самые недавние сверху — обратный порядок добавления.
  const ordered = [...items].reverse();
  const visible = ordered.slice(0, MAX_VISIBLE);
  const extra = Math.max(0, ordered.length - MAX_VISIBLE);

  return (
    <div
      className={`hidden lg:block absolute right-full bottom-0 pr-3 w-[332px] transition-all duration-200 ${
        hidden
          ? 'opacity-0 invisible translate-x-2 pointer-events-none'
          : 'opacity-0 invisible translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 group-hover:pointer-events-auto'
      }`}
    >
      <div className='bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden'>
        <div className='px-4 pt-4 pb-2 flex items-baseline justify-between'>
          <span className='text-[13px] font-bold text-[#111111]'>
            {t('preview.inCart')}
          </span>
          <span className='text-xs font-semibold text-[#6B6B6B] bg-gray-100 rounded-full px-2 py-0.5'>
            {totalCount}
          </span>
        </div>

        <ul className='max-h-[280px] overflow-y-auto'>
          {visible.map((item) => {
            const lineTotal = Math.round(item.lineUnitPrice * item.quantity);
            const photo = safeImageSrc(item.productPhoto, null);
            return (
              <li
                key={item.key}
                className='flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors'
              >
                <div className='relative w-10 h-10 rounded-xl overflow-hidden bg-[#F1F2F3] shrink-0'>
                  {photo && (
                    <Image
                      src={photo}
                      alt={item.productName}
                      fill
                      className='object-cover'
                      sizes='40px'
                    />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs font-semibold text-[#111111] truncate'>
                    {item.productName}
                  </div>
                  <div className='text-[11px] text-[#6B6B6B] mt-0.5 flex items-center gap-1'>
                    <span className='font-medium'>×{item.quantity}</span>
                    <span>·</span>
                    <span>{lineTotal} {tc('currency')}</span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => onRemove(item.key)}
                  className='shrink-0 w-7 h-7 rounded-lg text-[#A4A4A4] hover:text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-all flex items-center justify-center'
                  aria-label='Remove'
                >
                  <Trash2 size={14} strokeWidth={2.2} />
                </button>
              </li>
            );
          })}
        </ul>

        {extra > 0 && (
          <div className='px-4 py-1.5 text-[11px] text-[#6B6B6B] text-center bg-gray-50 border-t border-gray-100'>
            {t('preview.andMore', { count: extra })}
          </div>
        )}

        <div className='px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3'>
          <div className='flex flex-col leading-tight'>
            <span className='text-[10px] text-[#6B6B6B] uppercase tracking-wide font-semibold'>
              {t('totalDue')}
            </span>
            <span className='text-base font-extrabold text-[#111111]'>
              {totalPrice} {tc('currency')}
            </span>
          </div>
          <Link
            href={`/${venueSlug}/cart`}
            className='flex items-center gap-1.5 h-10 px-3.5 bg-brand text-white text-xs font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none transition-all'
          >
            {t('preview.goToCart')}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
