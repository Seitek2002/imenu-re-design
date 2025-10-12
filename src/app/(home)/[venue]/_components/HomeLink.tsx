'use client';

import { FC, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { useVenueQuery } from '@/store/venue';

interface IProps {
  img: StaticImport | string;
  label?: string | null;
}

const HomeLink: FC<IProps> = ({ img, label }) => {
  const router = useRouter();
  const venue = useVenueQuery(state => state.venue);

  useEffect(() => {
    if (venue?.slug) {
      router.prefetch(venue.slug + '/foods');
    }
  }, [router, venue?.slug]);

  return (
    <Link
      href={(venue?.slug ? venue.slug : '') + '/foods'}
      key={String(label ?? '')}
      className='text-center relative'
    >
      <div className='h-[170px] relative'>
        <Image priority fill src={img} alt={String(label ?? '')} />
      </div>
      <div className='mt-2 font-semibold'>{label}</div>
    </Link>
  );
};

export default HomeLink;
