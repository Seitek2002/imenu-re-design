export default function CategoriesSkeleton() {
  // Имитируем 10 элементов (два полных цикла 3-2-3-2)
  const skeletonItems = Array.from({ length: 10 });

  return (
    <div className='bg-white rounded-4xl p-4 pb-36 min-h-screen shadow-sm mt-4'>
      <div className='grid grid-cols-6 gap-3'>
        {skeletonItems.map((_, index) => {
          // Та же самая логика сетки, что и в реальном Content.tsx
          const positionInCycle = index % 5;
          const isLarge = positionInCycle >= 3;

          return (
            <div
              key={index}
              className={`
                relative rounded-3xl bg-[#F6F6F6] overflow-hidden p-3 flex flex-col justify-between
                animate-pulse
                ${isLarge ? 'col-span-3 h-32.5' : 'col-span-2 h-32.5'}
              `}
            >
              {/* Скелетон текста */}
              <div
                className={`
                  bg-gray-200 rounded-md h-5
                  ${isLarge ? 'w-2/3' : 'w-full'}
                `}
              />

              {/* Скелетон картинки */}
              <div
                className={`
                  bg-gray-200 rounded-full
                  ${
                    isLarge
                      ? 'w-20 h-20 self-end -mb-2 -mr-1'
                      : 'w-14 h-14 mt-2 self-center'
                  }
                `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
