'use client';

import ContentItem from './ContentItem';
import { Category } from '@/types/api';

interface Props {
  venueSlug: string;
  categories: Category[];
}

const Content = ({ venueSlug, categories }: Props) => {
  // Проверка на пустоту
  if (!categories || categories.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] text-gray-400'>
        <p>В этом разделе пока нет категорий</p>
      </div>
    );
  }

  // Показываем только топ-уровень: подкатегории отображаются на странице товаров
  const topLevel = categories.filter((c) => !c.parentCategory);

  return (
    <div className='bg-white rounded-4xl p-4 pb-36 min-h-screen shadow-sm mt-4'>
      <div className='grid grid-cols-6 gap-3'>
        {topLevel.map((item, index) => {
          // Логика сетки 3-2-3-2
          const positionInCycle = index % 5;
          const isLarge = positionInCycle >= 3;

          return (
            <ContentItem
              key={item.id}
              id={item.id}
              name={item.categoryName}
              // Используем маленькое фото для скорости (оно есть в JSON)
              img={
                item.categoryPhotoSmall ||
                item.categoryPhoto ||
                '/placeholder.png'
              }
              venueSlug={venueSlug}
              // 🔥 ВАЖНО: передаем slug для красивой ссылки
              slug={item.slug}
              isLarge={isLarge}
              isPriority={index < 5}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Content;
