import ImageSkeleton from '@/components/ui/ImageSkeleton';

export default function ContentSkeleton() {
  return (
    <div className='bg-white rounded-t-4xl mt-1.5 min-h-screen pb-40 border-t border-gray-100'>
      {/* 1. Скелетон Табов (Категорий) */}
      <div className='flex gap-6 px-5 py-4 overflow-hidden'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-8 w-24 bg-gray-100 rounded-full animate-pulse shrink-0'
          />
        ))}
      </div>

      {/* 2. Скелетон Сетки Товаров */}
      <div className='grid grid-cols-2 gap-x-3 gap-y-6 px-2.5 mt-2'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className='w-full flex flex-col'>
            {/* Квадрат картинки */}
            <div className='aspect-square rounded-2xl overflow-hidden mb-2 relative'>
              <ImageSkeleton />
            </div>
            {/* Текст цены */}
            <div className='h-5 w-16 bg-gray-100 rounded mb-1 animate-pulse' />
            {/* Текст названия (2 строки) */}
            <div className='h-4 w-full bg-gray-100 rounded mb-1 animate-pulse' />
            <div className='h-4 w-2/3 bg-gray-100 rounded animate-pulse' />
          </div>
        ))}
      </div>
    </div>
  );
}
