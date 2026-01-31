'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';

import 'swiper/css';

import Goods from './Goods';
import Category from './Category';
import { Product, Category as CategoryType } from '@/types/api';

interface Props {
  products: Product[];
  categories: CategoryType[];
  venueSlug: string;
  initialSlug: string;
}

const Content = ({ products, categories, venueSlug, initialSlug }: Props) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  // Нам нужно знать активный индекс для нашей ручной виртуализации
  const [activeIndex, setActiveIndex] = useState(0);

  const { slidesData, activeCategories, initialIndex } = useMemo(() => {
    // ... твоя логика группировки (Map) остается без изменений ...
    const categoryMap = new Map<number, CategoryType>();
    categories.forEach((cat) => categoryMap.set(cat.id, cat));

    const grouped: Record<string, Product[]> = {};
    categories.forEach((c) => {
      grouped[c.slug] = [];
    });

    products.forEach((p) => {
      if (!p.categories) return;
      p.categories.forEach((c) => {
        const fullCat = categoryMap.get(c.id);
        if (fullCat) {
          grouped[fullCat.slug].push(p);
        }
      });
    });

    const validCategories = categories.filter(
      (c) => grouped[c.slug]?.length > 0
    );
    const index = validCategories.findIndex((c) => c.slug === initialSlug);

    return {
      slidesData: grouped,
      activeCategories: validCategories,
      initialIndex: index >= 0 ? index : 0,
    };
  }, [products, categories, initialSlug]);

  // Устанавливаем начальный индекс при загрузке
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex); // Обновляем индекс для рендера

    const category = activeCategories[newIndex];
    if (category) {
      setActiveSlug(category.slug);
      const newUrl = `/${venueSlug}/products/${category.slug}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleCategoryClick = (index: number) => {
    // Сразу обновляем индекс, чтобы контент начал рендериться ДО прыжка
    setActiveIndex(index);
    swiperRef.current?.slideTo(index);
  };

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 min-h-screen pb-40 border-t border-gray-100 flex flex-col'>
      <div className='pt-2 sticky top-18 z-30 bg-white shadow-sm'>
        <Category
          categories={activeCategories}
          activeSlug={activeSlug}
          onSelect={handleCategoryClick}
        />
      </div>

      <div className='flex-1'>
        <Swiper
          // 1. Убираем модуль Virtual
          modules={[]}
          className='w-full h-full'
          spaceBetween={16}
          slidesPerView={1}
          initialSlide={initialIndex}
          // 2. ВКЛЮЧАЕМ CSS MODE (для идеальной скорости)
          cssMode={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (initialIndex > 0) swiper.slideTo(initialIndex, 0);
          }}
          onSlideChange={handleSlideChange}
        >
          {activeCategories.map((category, index) => {
            // 3. 🔥 РУЧНАЯ ВИРТУАЛИЗАЦИЯ
            // Рендерим контент только если слайд текущий, или соседний (+/- 1)
            // Это держит в DOM только ~3 тяжелых списка товаров.
            const shouldRender = Math.abs(index - activeIndex) <= 1;

            return (
              <SwiperSlide key={category.id}>
                <div className='pb-10 min-h-[80vh]'>
                  {shouldRender ? (
                    <Goods products={slidesData[category.slug]} />
                  ) : (
                    // ЗАГЛУШКА: Легкий пустой блок, сохраняющий высоту.
                    // Браузер видит его и может к нему проскроллить.
                    <div className='h-full w-full flex items-center justify-center'>
                      <div className='loading-spinner text-gray-300'>...</div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default Content;
