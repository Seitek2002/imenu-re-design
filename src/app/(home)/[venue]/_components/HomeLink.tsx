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
  sectionId: number;
}

const HomeLink: FC<IProps> = ({ img, label, sectionId }) => {
  const router = useRouter();
  const venue = useVenueQuery(state => state.venue);

  useEffect(() => {
    if (venue?.slug) {
      router.prefetch(`${venue.slug}/foods/${sectionId}?title=${encodeURIComponent(label ?? '')}`);
    }
  }, [router, venue?.slug, label, sectionId]);

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
        <Image priority src={img} alt={String(label ?? '')} className='object-cover m-auto' fill />
      </div>
      <div className='mt-2 font-semibold leading-4'>{label}</div>
    </Link>
  );
};

export default HomeLink;
