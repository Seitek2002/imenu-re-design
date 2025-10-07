'use client';
import { FC } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';

import Nav from './Nav';

import bellIcon from '@/assets/Footer/bell.svg';

const Footer: FC = () => {
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();
  const venueRoot = params?.venue ? `/${params.venue}` : '';
  const isHome = pathname === venueRoot;
  const collapsed = !isHome;

  return (
    <footer className='fixed bottom-0 left-0 right-0 flex flex-col items-center z-10'>
      <button
        aria-label='Позвать официанта'
        className={`group flex items-center bg-[#FF8127] text-white rounded-3xl mb-1 overflow-hidden transition-all duration-300 ${
          collapsed ? 'p-3.5' : 'py-4 px-8 gap-2'
        }`}
      >
        <Image src={bellIcon} alt='bell icon' />
        <span
          className={`whitespace-nowrap transition-all duration-300 ${
            collapsed
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[300px] opacity-100 ml-2'
          }`}
        >
          Позвать официанта к <b>12 столику</b>
        </span>
      </button>
      <Nav />
    </footer>
  );
};

export default Footer;
