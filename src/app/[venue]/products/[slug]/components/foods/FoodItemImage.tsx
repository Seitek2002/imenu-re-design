'use client';

import { FC, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import ImageSkeleton from '@/components/ui/ImageSkeleton';

interface Props {
  src: string | StaticImageData;
  alt: string;
  isPriority: boolean;
}

const FoodItemImage: FC<Props> = ({ src, alt, isPriority }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className='relative flex items-end w-full aspect-square rounded-2xl overflow-hidden p-1.5 bg-gray-50 isolate'>
      {!isPriority && !isLoaded && (
        <div className='absolute inset-0 z-[-1]'>
          <ImageSkeleton />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        className={`object-cover ${
          isPriority
            ? ''
            : `transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`
        }`}
        fill
        quality={65}
        sizes='(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 250px'
        priority={isPriority}
        onLoad={!isPriority ? () => setIsLoaded(true) : undefined}
      />
    </div>
  );
};

export default FoodItemImage;
