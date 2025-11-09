'use client';

import { FC, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import ImenuSquareSkeleton from '@/components/ui/ImenuSquareSkeleton';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { useVenueQuery } from '@/store/venue';

interface IProps {
  img: StaticImport | string;
  label?: string | null;
  sectionId: number;
  venueSlug?: string;
}

const HomeLink: FC<IProps> = ({ img, label, sectionId, venueSlug }) => {
  const venue = useVenueQuery(state => state.venue);
  const [imgLoaded, setImgLoaded] = useState(false);
  const slug = venueSlug ?? venue?.slug ?? '';

  return (
    <Link
      href={{
        pathname: `/${slug}/foods/${sectionId}`,
        query: { title: label ?? '' },
      }}
      key={String(label ?? '')}
      className='text-center relative'
    >
      <div className='relative aspect-square rounded-2xl overflow-hidden'>
        {!imgLoaded && (
          <ImenuSquareSkeleton className='absolute inset-0 w-full h-full' />
        )}
        <Image
          src={img}
          alt={String(label ?? '')}
          className='object-cover m-auto'
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
          fill
          priority
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <div className='mt-2 font-semibold leading-4'>{label}</div>
    </Link>
  );
};

export default HomeLink;
