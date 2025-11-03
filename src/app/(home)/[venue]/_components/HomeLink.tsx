'use client';

import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { useVenueQuery } from '@/store/venue';

interface IProps {
  img: StaticImport | string;
  label?: string | null;
  sectionId: number;
}

const HomeLink: FC<IProps> = ({ img, label, sectionId }) => {
  const venue = useVenueQuery(state => state.venue);

  return (
    <Link
      href={{
        pathname: `${venue?.slug ?? ''}/foods/${sectionId}`,
        query: { title: label ?? '' },
      }}
      key={String(label ?? '')}
      className='text-center relative'
    >
      <div className='relative aspect-square rounded-2xl overflow-hidden'>
        <Image
          src={img}
          alt={String(label ?? '')}
          className='object-cover m-auto'
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
        />
      </div>
      <div className='mt-2 font-semibold leading-4'>{label}</div>
    </Link>
  );
};

export default HomeLink;
