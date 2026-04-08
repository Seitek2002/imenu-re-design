'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface Props {
  name: string;
  img: string;
  venueSlug: string;
  slug: string;
  isLarge: boolean;
  isPriority?: boolean;
  id: number;
}

const ContentItem: FC<Props> = ({
  name,
  img,
  venueSlug,
  slug,
  isLarge,
  isPriority,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link
      href={`/${venueSlug}/products/${slug}`}
      className={`
        relative rounded-3xl bg-[#F6F6F6] overflow-hidden p-3 flex flex-col justify-between
        active:scale-95 transition-transform isolate
        ${isLarge ? 'col-span-3' : 'col-span-2'}
      `}
    >
      <span
        className={`
        text-[#21201F] font-bold leading-tight z-10
        ${isLarge ? 'text-[120%] w-2/3' : 'text-[120%]'}
      `}
      >
        {name}
      </span>

      <div
        className={`
        relative 
        ${
          isLarge
            ? 'w-24 h-24 self-end -mb-4 -mr-2'
            : 'w-full h-16 mt-2 self-center'
        }
      `}
      >
        {/* 🔥 ОПТИМИЗАЦИЯ 1: Скелетон только для НЕ приоритетных */}
        {!isPriority && !isLoaded && (
          <div className='absolute inset-0 z-[-1] rounded-full overflow-hidden'>
            <ImageSkeleton />
          </div>
        )}

        {/* 🔥 ОПТИМИЗАЦИЯ 2: Убираем анимацию для приоритетных */}
        <Image
          src={img}
          alt={name}
          fill
          className={`object-contain ${
            isPriority
              ? '' // Показываем сразу жестко
              : `transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`
          }`}
          sizes={
            isLarge
              ? '(max-width: 768px) 50vw, 300px'
              : '(max-width: 768px) 33vw, 200px'
          }
          priority={isPriority}
          // onLoadingComplete - современная замена onLoad в Next.js (но onLoad тоже работает)
          onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
        />
      </div>
    </Link>
  );
};

export default ContentItem;
