'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { getNavItems } from './Nav.helpers';

import { match } from 'path-to-regexp';

const Nav = () => {
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();

  const initialVenueRoot = params?.venue ? `/${params.venue}` : '';
  const [venueRoot, setVenueRoot] = useState<string>(initialVenueRoot);

  useEffect(() => {
    if (!initialVenueRoot) {
      const stored =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('venueRoot')
          : null;
      if (stored && stored !== venueRoot) {
        setVenueRoot(stored);
      }
    } else {
      if (initialVenueRoot !== venueRoot) {
        setVenueRoot(initialVenueRoot);
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('venueRoot', initialVenueRoot);
      }
    }
  }, [initialVenueRoot, venueRoot]);

  const items = getNavItems(venueRoot || '');

  return (
    <nav className='flex bg-white border-t-[1px] border-[#E5E7EB] py-6'>
      {items.map(({ icon, label, href }) => (
        <Link
          href={href}
          key={label}
          className={`flex flex-col items-center px-4 ${
            !!match(href)(pathname) ? '' : 'opacity-50'
          }`}
        >
          <Image src={icon} alt='basketIcon icon' />
          <span className='text-[#5B5B5B]'>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
