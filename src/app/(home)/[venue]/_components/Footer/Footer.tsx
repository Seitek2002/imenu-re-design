import { FC } from 'react';
import Image from 'next/image';

import Nav from './Nav';

import bellIcon from '@/assets/Footer/bell.svg';

const Footer: FC = () => {
  return (
    <footer className='fixed bottom-0 left-0 right-0 flex flex-col items-center z-10'>
      <button className='flex items-center gap-2 bg-[#FF8127] text-white rounded-3xl py-4 px-8 mb-1'>
        <Image src={bellIcon} alt='bell icon' />
        Позвать официанта к 12 столику
      </button>
      <Nav />
    </footer>
  );
};

export default Footer;
