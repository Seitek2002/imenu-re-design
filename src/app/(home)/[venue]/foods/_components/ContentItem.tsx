'use client';

import { FC, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { PAGES } from '@/config/pages.config';

type Props = {
  name: string;
  img: string;
  slug: string;
};

const ContentItem: FC<Props> = ({ name, img, slug }) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(PAGES.MENU(slug));
  }, [router]);

  return (
    <Link
      className='content-item h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden relative flex justify-end items-end'
      href={PAGES.MENU(slug)}
    >
      <span className='text-[#21201F] bg-[#F6F6F6] text-sm z-10 font-semibold absolute top-3 left-3 line-clamp-2'>
        {name}
      </span>
      <Image src={img || '/placeholder-dish.svg'} fill alt='photo category' className='!w-auto !h-auto !static' />
    </Link>
  );
};

export default ContentItem;
