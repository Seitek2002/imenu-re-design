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
    router.prefetch(PAGES.MENU(slug));
  }, [router]);

  return (
    <Link className='' href={'/' + venueSlug + '/' + PAGES.MENU(slug)}>
      <div className='content-item h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden relative flex justify-center items-end'>
        <Image
          fill
          src={img || '/placeholder-dish.svg'}
          alt='photo category'
          className='object-cover'
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
        />
      </div>
      <span className='text-[#21201F] text-base z-10 font-semibold text-center line-clamp-2'>
        {name}
      </span>
    </Link>
  );
};

export default ContentItem;
