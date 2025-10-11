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

  return (
    <nav className='flex justify-center bg-white border-t-[1px] border-[#E5E7EB] py-3 w-full'>
      {items.map(({ icon, label, href }) => (
        <Link
          href={href}
          key={label}
          prefetch
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
