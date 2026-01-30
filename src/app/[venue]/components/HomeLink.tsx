import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface IProps {
  img: string;
  label: string;
  sectionId: number;
  venueSlug: string;
  isPriority?: boolean;
}

const HomeLink: FC<IProps> = ({
  img,
  label,
  sectionId,
  venueSlug,
  isPriority,
}) => {
  return (
    <Link
      href={`/${venueSlug}/categories/${sectionId}?title=${encodeURIComponent(
        label,
      )}`}
      className='text-center block active:scale-95 transition-transform group'
    >
      <div className='relative aspect-square rounded-2xl overflow-hidden bg-gray-50'>
        <div className='absolute inset-0 z-0'>
          <ImageSkeleton />
        </div>

        <Image
          src={img}
          alt={label}
          fill
          className='object-cover z-10 relative'
          sizes={
            isPriority
              ? '(max-width: 640px) 40vw, 200px'
              : '(max-width: 640px) 25vw, 200px'
          }
          priority={isPriority}
          loading={isPriority ? 'eager' : 'lazy'}
        />
      </div>

      <div
        className={`mt-2 font-bold leading-tight text-[#21201f] ${
          isPriority ? 'text-base' : 'text-[13px]'
        }`}
      >
        {label}
      </div>
    </Link>
  );
};

export default HomeLink;
