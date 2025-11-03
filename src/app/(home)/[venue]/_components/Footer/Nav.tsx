'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { getNavItems } from './Nav.helpers';
import { useBasket } from '@/store/basket';

import { match } from 'path-to-regexp';

const Nav = () => {
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();
  const router = useRouter();

  const [venueRoot, setVenueRoot] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('venueRoot');
    if (stored) {
      setVenueRoot(stored);
    } else {
      const fallback = params?.venue ? `/${params.venue}` : '';
      setVenueRoot(fallback);
    }
  }, [pathname, params?.venue]);

  const items = getNavItems(venueRoot || '');

  // Программный префетч всех пунктов нижней навигации
  useEffect(() => {
    try {
      items.forEach(({ href }) => {
        if (href) router.prefetch(href);
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, items.map(i => i.href).join(',')]);

  // basket count with hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const itemsMap = useBasket((s) => s.items);
  const cartCount = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );

  return (
    <nav className='flex justify-center bg-white border-t-[1px] border-[#E5E7EB] py-3 w-full pb-9'>
      {items.map(({ icon, label, href }) => (
        <Link
          href={href}
          key={label}
          prefetch
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(50);
          }}
          className={`flex flex-col items-center px-4`}
        >
          <div className='relative'>
            <Image
              src={icon}
              alt='basketIcon icon'
              className={`${!!match(href)(pathname) ? '' : 'opacity-50'}`}
            />
            {hydrated && cartCount > 0 && /\/basket$/.test(href) && (
              <span className='absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#FF3B30] text-white text-[10px] leading-[16px] text-center'>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className={`text-[#5B5B5B] ${!!match(href)(pathname) ? '' : 'opacity-50'}`}>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
