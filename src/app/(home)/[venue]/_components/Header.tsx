'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import searchIcon from '@/assets/Header/search.svg';
import arrowIcon from '@/assets/Header/arrow.svg';
import closeIcon from '@/assets/Basket/trash.svg';

interface IProps {
  title: string;
  showSearch?: boolean;
  hideOnScroll?: boolean;
  onVisibilityChange?: (hidden: boolean) => void;
}

const Header: FC<IProps> = ({ title, showSearch, hideOnScroll, onVisibilityChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!hideOnScroll) return;
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const delta = currentY - lastYRef.current;
        const threshold = 10; // минимальный порог, чтобы не дёргалось

        if (Math.abs(delta) > threshold) {
          if (delta > 0 && currentY > 64) {
            // скролл вниз и уже не у самого верха — прячем
            setHidden(true);
          } else {
            // скролл вверх или у самого верха — показываем
            setHidden(false);
          }
          lastYRef.current = currentY;
        }
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hideOnScroll]);

  useEffect(() => {
    onVisibilityChange?.(hidden);
  }, [hidden, onVisibilityChange]);

  const toggleSearch = () => {
    const params = new URLSearchParams(sp.toString());
    const isOpen = params.get('searchOpen') === '1';
    if (isOpen) {
      // Close search panel and clear search
      params.delete('searchOpen');
      params.delete('search');
      params.delete('category');
    } else {
      params.set('searchOpen', '1');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <header className={`header sticky top-0 bg-white z-20 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className='header__content flex justify-between items-center px-5 pt-2.5 pb-4'>
        <Image
          src={arrowIcon}
          width={24}
          height={24}
          alt='arrowIcon'
          onClick={() => router.back()}
          className='z-10 cursor-pointer'
        />
        <h2 className='text-2xl font-semibold text-center'>{title}</h2>
        <div>
          {showSearch ? (
            <button
              type='button'
              aria-label={sp.get('searchOpen') === '1' ? 'Закрыть поиск' : 'Поиск'}
              onClick={toggleSearch}
              className='cursor-pointer'
            >
              {sp.get('searchOpen') === '1' ? (
                <span className="inline-block text-xl leading-none">✕</span>
              ) : (
                <Image src={searchIcon} width={24} height={24} alt='searchIcon' />
              )}
            </button>
          ) : (
            <span className='inline-block w-6 h-6' />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
