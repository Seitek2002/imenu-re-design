'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';

import Nav from './Nav';
import Link from 'next/link';
import { PAGES } from '@/config/pages.config';
import { useBasket } from '@/store/basket';

import bellIcon from '@/assets/Footer/bell.svg';

const Footer: FC = () => {
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();
  const venueRoot = params?.venue ? `/${params.venue}` : '';
  const isHome = pathname === venueRoot;
  const collapsed = !isHome;

  const isBasket = pathname === PAGES.BASKET(venueRoot);

  // basket/hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const itemsMap = useBasket((s) => s.items);
  const itemCount = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );
  const showNext = hydrated && itemCount > 0 && !isBasket;

  return (
    <footer className='fixed bottom-0 left-0 right-0 flex flex-col items-center z-10'>
      {isHome && showNext ? (
        <div className="w-full flex items-center gap-2 px-4">
          <button
            aria-label="Позвать официанта"
            className="flex-1 flex items-center bg-[#FF8127] text-white rounded-3xl py-4 px-4 gap-2"
          >
            <Image src={bellIcon} alt="bell icon" />
            <span className="whitespace-nowrap">
              Позвать официанта к <b>12 столику</b>
            </span>
          </button>
          <Link
            href={PAGES.BASKET(venueRoot)}
            className="flex-1 text-center bg-[#FF7A00] text-white rounded-3xl py-4 font-semibold"
          >
            Далее
          </Link>
        </div>
      ) : (
        <>
          <button
            aria-label="Позвать официанта"
            className={`group flex items-center bg-[#FF8127] text-white rounded-3xl mb-1 overflow-hidden transition-all duration-1000 ${
              collapsed ? 'p-3.5 ml-[80%]' : 'py-4 px-8 gap-2'
            }`}
          >
            <Image src={bellIcon} alt="bell icon" />
            <span
              className={`whitespace-nowrap transition-all duration-1000 ${
                collapsed
                  ? 'max-w-0 opacity-0 ml-0'
                  : 'max-w-[300px] opacity-100 ml-2'
              }`}
            >
              Позвать официанта к <b>12 столику</b>
            </span>
          </button>
          {showNext && (
            <Link
              href={PAGES.BASKET(venueRoot)}
              className="py-4 px-8 bg-[#FF7A00] text-white rounded-3xl mb-1 font-semibold"
            >
              Далее
            </Link>
          )}
        </>
      )}
      <Nav />
    </footer>
  );
};

export default Footer;
