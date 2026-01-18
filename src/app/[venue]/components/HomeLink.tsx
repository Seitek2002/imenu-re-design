'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface IProps {
  img: string;
  label: string;
  sectionId: number;
  venueSlug: string;
  isPriority?: boolean; // Мы уже передаем это пропсом!
}

const HomeLink: FC<IProps> = ({
  img,
  label,
  sectionId,
  venueSlug,
  isPriority,
}) => {
  const [isLoaded, setIsLoaded] = useState(!!isPriority);

  return (
    <Link
      href={`/${venueSlug}/categories/${sectionId}?title=${encodeURIComponent(
        label
      )}`}
      className='text-center block active:scale-95 transition-transform group'
    >
      <div className='relative aspect-square rounded-2xl overflow-hidden bg-gray-50'>
        {/* Скелетон показываем ТОЛЬКО если это НЕ приоритетная картинка и она еще не загрузилась */}
        {!isPriority && !isLoaded && (
          <div className='absolute inset-0 z-0'>
            <ImageSkeleton />
          </div>
        )}

        <Image
          src={img}
          alt={label}
          fill
          className={`object-cover ${
            isPriority
              ? ''
              : `transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`
          }`}
          sizes={
            isPriority
              ? '(max-width: 640px) 40vw, 200px'
              : '(max-width: 640px) 25vw, 200px'
          }
          priority={isPriority}
          onLoad={() => setIsLoaded(true)}
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
