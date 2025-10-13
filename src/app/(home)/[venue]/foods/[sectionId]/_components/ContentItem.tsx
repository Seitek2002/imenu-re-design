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
  venueSlug: string;
};

const ContentItem: FC<Props> = ({ name, img, slug, venueSlug }) => {
  const router = useRouter();

  useEffect(() => {
    console.log(PAGES.MENU(slug));
    router.prefetch(PAGES.MENU(slug));
  }, [router]);

  return (
    <Link
      className='content-item h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden relative flex justify-end items-end'
      href={'/' + venueSlug + '/' + PAGES.MENU(slug)}
    >
      <span className='text-[#21201F] text-sm z-10 font-semibold absolute top-1.5 left-3 line-clamp-2'>
        {name}
      </span>
      <Image
        fill
        src={img || '/placeholder-dish.svg'}
        alt='photo category'
        className={`!w-auto !max-w-full !max-h-[76%] !h-auto !static`}
      />
    </Link>
  );
};

export default ContentItem;
