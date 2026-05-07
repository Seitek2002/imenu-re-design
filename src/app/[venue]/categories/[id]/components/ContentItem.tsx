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
  // Если задан, элемент — подкатегория. Ведём на страницу родителя с якорем,
  // чтобы пользователь видел соседние подкатегории и работал scroll-spy.
  parentSlug?: string;
  // "−20%" / "%" — если в категории есть товары с активным промо.
  promoLabel?: string | null;
  isLarge: boolean;
  isPriority?: boolean;
  id: number;
}

const ContentItem: FC<Props> = ({
  name,
  img,
  venueSlug,
  slug,
  parentSlug,
  promoLabel,
  isLarge,
  isPriority,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const href = parentSlug
    ? `/${venueSlug}/products/${parentSlug}#subcat-${slug}`
    : `/${venueSlug}/products/${slug}`;

  return (
    <Link
      href={href}
      className={`
        relative rounded-2xl bg-[#F6F6F6] overflow-hidden p-3 flex flex-col justify-between
        active:scale-95 transition-transform isolate
        ${isLarge ? 'col-span-3 h-36' : 'col-span-2 h-28'}
      `}
    >
      <span
        className={`
        text-[#21201F] font-bold leading-tight z-10 break-words line-clamp-2
        ${isLarge ? 'text-lg w-3/4' : 'text-base'}
      `}
      >
        {name}
      </span>

      {promoLabel && (
        <div className='absolute top-1.5 left-1.5 z-20 bg-brand text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md shadow-sm'>
          {promoLabel}
        </div>
      )}

      <div
        className={`
        relative 
        ${
          isLarge
            ? 'w-24 h-24 self-end -mb-4 -mr-2'
            : 'w-full h-12 self-center'
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
