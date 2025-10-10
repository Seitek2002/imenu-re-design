'use client';

import { FC, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { useVenueQuery } from '@/store/venue';

interface IProps {
  img: StaticImport;
  label: string;
}

const HomeLink: FC<IProps> = ({ img, label }) => {
  const router = useRouter();
  const venue = useVenueQuery(state => state.venue);

  useEffect(() => {
    router.prefetch(venue.slug + '/foods');
  }, [router]);

  return (
    <Link href={venue.slug + '/foods'} key={label} className='text-center relative'>
      <Image src={img} alt={label} />
      <div className='mt-2 font-semibold'>{label}</div>
    </Link>
  );
};

export default HomeLink;
