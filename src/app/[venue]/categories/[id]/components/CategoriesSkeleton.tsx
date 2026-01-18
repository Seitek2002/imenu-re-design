import ImageSkeleton from '@/components/ui/ImageSkeleton';

const CategoriesSkeleton = () => {
  // Генерируем 10 фейковых элементов
  const fakeItems = Array.from({ length: 10 });

  return (
    <div className='bg-white rounded-4xl p-4 pb-36 min-h-screen shadow-sm mt-4'>
      <div className='grid grid-cols-6 gap-3'>
        {fakeItems.map((_, index) => {
          // Твоя логика сетки 3-2-3-2
          const positionInCycle = index % 5;
          const isLarge = positionInCycle >= 3;

          return (
            <div
              key={index}
              className={`
                relative rounded-3xl bg-[#F6F6F6] overflow-hidden p-3 flex flex-col justify-between
                ${
                  isLarge
                    ? 'col-span-3 aspect-[1.4/1]'
                    : 'col-span-2 aspect-[0.8/1]'
                }
              `}
            >
              {/* Скелетон текста заголовка */}
              <div
                className={`bg-gray-200 rounded animate-pulse ${
                  isLarge ? 'h-4 w-2/3' : 'h-3 w-full'
                }`}
              />

              {/* Скелетон картинки */}
              <div
                className={`
                relative bg-gray-200 rounded-full animate-pulse
                ${
                  isLarge
                    ? 'w-24 h-24 self-end -mb-4 -mr-2'
                    : 'w-16 h-16 mt-2 self-center rounded-full'
                }
              `}
              >
                <ImageSkeleton />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesSkeleton;
