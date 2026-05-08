'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface Props {
  name: string;
  img: string;
  venueSlug: string;
  slug: string;
  // Если задан, элемент — подкатегория. Ведём на страницу родителя с якорем,
  // чтобы пользователь видел соседние подкатегории и работал scroll-spy.
  parentSlug?: string;
  // Число товаров в категории. 0 → бейдж не показываем.
  productCount?: number;
  isLarge: boolean;
  isCover?: boolean;
  isPriority?: boolean;
  id: number;
}

const ContentItem: FC<Props> = ({
  name,
  img,
  venueSlug,
  slug,
  parentSlug,
  productCount = 0,
  isLarge,
  isCover,
  isPriority,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const t = useTranslations('Categories');
  const countLabel = productCount > 0 ? t('itemsCount', { count: productCount }) : null;

  const href = parentSlug
    ? `/${venueSlug}/products/${parentSlug}#subcat-${slug}`
    : `/${venueSlug}/products/${slug}`;

  if (isCover) {
    const hasImg = !!img && img !== '/placeholder.png';

    if (hasImg) {
      return (
        <Link
          href={href}
          className='relative col-span-6 h-32 rounded-2xl overflow-hidden flex items-end p-4
            active:scale-[0.98] transition-transform isolate bg-[#F6F6F6]'
        >
          <Image
            src={img}
            alt={name}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, 600px'
            priority={isPriority}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
          <div className='relative z-10 flex flex-col gap-0.5'>
            <span className='text-white font-bold text-xl leading-tight line-clamp-2 drop-shadow'>
              {name}
            </span>
            {countLabel && (
              <span className='text-white/85 text-xs font-medium drop-shadow'>
                {countLabel}
              </span>
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link
        href={href}
        className='relative col-span-6 h-14 rounded-2xl overflow-hidden flex items-center justify-between pl-5 pr-4
          active:scale-[0.98] transition-transform
          bg-gradient-to-r from-brand/15 via-brand/5 to-transparent'
      >
        <span className='absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-l-2xl' />
        <div className='flex items-baseline gap-2 min-w-0'>
          <span className='text-[#21201F] font-bold text-base leading-tight line-clamp-1'>
            {name}
          </span>
          {countLabel && (
            <span className='text-gray-500 text-xs font-medium shrink-0'>
              {countLabel}
            </span>
          )}
        </div>
        <span className='flex items-center gap-1 text-brand text-sm font-medium shrink-0'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden>
            <path d='M9 6l6 6-6 6' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </span>
      </Link>
    );
  }

  const hasImg = !!img && img !== '/placeholder.png';

  if (!isLarge) {
    return (
      <>
        {/* Mobile: фото на фон + текст по центру */}
        <Link
          href={href}
          className='md:hidden relative col-span-2 h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden flex items-center justify-center p-3
            active:scale-95 transition-transform isolate'
        >
          {hasImg && (
            <>
              {!isPriority && !isLoaded && (
                <div className='absolute inset-0 z-0'>
                  <ImageSkeleton />
                </div>
              )}
              <Image
                src={img}
                alt={name}
                fill
                className={`object-cover ${
                  isPriority
                    ? 'opacity-40'
                    : `transition-opacity duration-500 ${
                        isLoaded ? 'opacity-40' : 'opacity-0'
                      }`
                }`}
                sizes='(max-width: 768px) 33vw, 200px'
                priority={isPriority}
                onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-white/20' />
            </>
          )}

          <div className='relative z-10 flex flex-col items-center gap-0.5'>
            <span className='text-[#21201F] font-bold text-base leading-tight text-center break-words line-clamp-3'>
              {name}
            </span>
            {countLabel && (
              <span className='text-gray-500 text-[11px] font-medium'>
                {countLabel}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop: текст сверху + картинка снизу-по-центру (исходный layout) */}
        <Link
          href={href}
          className='hidden md:flex relative col-span-2 h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden p-3 flex-col justify-between
            active:scale-95 transition-transform isolate'
        >
          <div className='z-10 flex flex-col gap-0.5'>
            <span className='text-[#21201F] font-bold text-base leading-tight break-words line-clamp-2'>
              {name}
            </span>
            {countLabel && (
              <span className='text-gray-500 text-[11px] font-medium'>
                {countLabel}
              </span>
            )}
          </div>

          <div className='relative w-full h-12 self-center'>
            {!isPriority && !isLoaded && (
              <div className='absolute inset-0 z-[-1] rounded-full overflow-hidden'>
                <ImageSkeleton />
              </div>
            )}
            <Image
              src={img}
              alt={name}
              fill
              className={`object-contain ${
                isPriority
                  ? ''
                  : `transition-opacity duration-500 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`
              }`}
              sizes='(max-width: 768px) 33vw, 200px'
              priority={isPriority}
              onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
            />
          </div>
        </Link>
      </>
    );
  }

  return (
    <>
      {/* Mobile: фото на фон + текст по центру (единый стиль с маленькими) */}
      <Link
        href={href}
        className='md:hidden relative col-span-3 h-36 rounded-2xl bg-[#F6F6F6] overflow-hidden flex items-center justify-center p-4
          active:scale-95 transition-transform isolate'
      >
        {hasImg && (
          <>
            {!isPriority && !isLoaded && (
              <div className='absolute inset-0 z-0'>
                <ImageSkeleton />
              </div>
            )}
            <Image
              src={img}
              alt={name}
              fill
              className={`object-cover ${
                isPriority
                  ? 'opacity-40'
                  : `transition-opacity duration-500 ${
                      isLoaded ? 'opacity-40' : 'opacity-0'
                    }`
              }`}
              sizes='(max-width: 768px) 50vw, 300px'
              priority={isPriority}
              onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-white/20' />
          </>
        )}

        <div className='relative z-10 flex flex-col items-center gap-0.5'>
          <span className='text-[#21201F] font-bold text-lg leading-tight text-center break-words line-clamp-3'>
            {name}
          </span>
          {countLabel && (
            <span className='text-gray-500 text-xs font-medium'>
              {countLabel}
            </span>
          )}
        </div>
      </Link>

      {/* Desktop: текст сверху + крупная картинка в углу (исходный layout) */}
      <Link
        href={href}
        className='hidden md:flex relative col-span-3 h-36 rounded-2xl bg-[#F6F6F6] overflow-hidden p-3 flex-col justify-between
          active:scale-95 transition-transform isolate'
      >
        <div className='z-10 flex flex-col gap-0.5 w-3/4'>
          <span className='text-[#21201F] font-bold text-lg leading-tight break-words line-clamp-2'>
            {name}
          </span>
          {countLabel && (
            <span className='text-gray-500 text-xs font-medium'>
              {countLabel}
            </span>
          )}
        </div>

        <div className='relative w-24 h-24 self-end -mb-4 -mr-2'>
          {!isPriority && !isLoaded && (
            <div className='absolute inset-0 z-[-1] rounded-full overflow-hidden'>
              <ImageSkeleton />
            </div>
          )}
          <Image
            src={img}
            alt={name}
            fill
            className={`object-contain ${
              isPriority
                ? ''
                : `transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`
            }`}
            sizes='(max-width: 768px) 50vw, 300px'
            priority={isPriority}
            onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
          />
        </div>
      </Link>
    </>
  );
};

export default ContentItem;
