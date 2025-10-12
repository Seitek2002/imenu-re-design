'use client';

import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import searchIcon from '@/assets/Header/search.svg';
import arrowIcon from '@/assets/Header/arrow.svg';

interface IProps {
  title: string;
  showSearch?: boolean;
  hideOnScroll?: boolean;
  onVisibilityChange?: (hidden: boolean) => void;
}

const Header: FC<IProps> = ({ title, showSearch, hideOnScroll, onVisibilityChange }) => {
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
  const router = useRouter();

  return (
    <header className={`header sticky top-0 bg-white rounded-b-4xl z-20 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className='header__content flex justify-between items-center px-5 pt-2.5 pb-4'>
        <Image
          src={arrowIcon}
          width={24}
          height={24}
          alt='arrowIcon'
          onClick={() => router.back()}
        />
        <h2 className='text-2xl font-semibold absolute right-0 left-0 text-center'>{title}</h2>
        <div>
          {showSearch && (
            <Image src={searchIcon} width={24} height={24} alt='searchIcon' />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
