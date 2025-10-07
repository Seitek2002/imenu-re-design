'use client';

import { FC } from 'react';

import Image from 'next/image';

import searchIcon from '@/assets/Header/search.svg';
import arrowIcon from '@/assets/Header/arrow.svg';
import { useRouter } from 'next/navigation';

interface IProps {
  title: string;
  showSearch?: boolean;
}

const Header: FC<IProps> = ({ title, showSearch }) => {
  const router = useRouter();

  return (
    <header className='header sticky top-0 bg-white rounded-b-4xl z-20'>
      <div className='header__content flex justify-between items-center px-5 pt-2.5 pb-4'>
        <Image
          src={arrowIcon}
          width={24}
          height={24}
          alt='arrowIcon'
          onClick={() => router.back()}
        />
        <h2 className='text-2xl font-semibold'>{title}</h2>
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
