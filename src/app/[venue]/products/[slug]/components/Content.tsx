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
  // Активный индекс нужен для ручной виртуализации слайдов
  const [activeIndex, setActiveIndex] = useState(0);

  const { slidesData, slideCategories, parentCategories, subCategoriesMap, initialIndex } =
    useMemo(() => {
      // Строим плоский categoryMap: id → Category (включая подкатегории из children[])
      const categoryMap = new Map<number, CategoryType>();
      const allCats: CategoryType[] = [];
      categories.forEach((cat) => {
        categoryMap.set(cat.id, cat);
        allCats.push(cat);
        cat.children?.forEach((child) => {
          categoryMap.set(child.id, child);
          allCats.push(child);
        });
      });

      // Группируем товары по категории, а также по родительской категории
      const grouped: Record<string, Product[]> = {};
      allCats.forEach((c) => { grouped[c.slug] = []; });

      products.forEach((p) => {
        if (!p.categories) return;
        // Set нужен чтобы не дублировать товар в одной категории
        const addedTo = new Set<string>();
        p.categories.forEach((c) => {
          const fullCat = categoryMap.get(c.id);
          if (!fullCat) return;
          if (!addedTo.has(fullCat.slug)) {
            grouped[fullCat.slug].push(p);
            addedTo.add(fullCat.slug);
          }
          // Добавляем товар и в родительскую категорию
          if (fullCat.parentCategory) {
            const parentCat = categoryMap.get(fullCat.parentCategory);
            if (parentCat && !addedTo.has(parentCat.slug)) {
              grouped[parentCat.slug].push(p);
              addedTo.add(parentCat.slug);
            }
          }
        });
      });

      // Слайды = родитель (для "Все") + подкатегории, или топ-категории без детей
      const slideList: CategoryType[] = [];
      categories.forEach((cat) => {
        const childrenWithProducts = (cat.children || []).filter(
          (c) => grouped[c.slug]?.length > 0,
        );
        if (childrenWithProducts.length > 0) {
          // Родитель первым (таб "Все"), затем подкатегории
          slideList.push(cat);
          slideList.push(...childrenWithProducts);
        } else if (grouped[cat.slug]?.length > 0) {
          // Нет подкатегорий — добавляем саму категорию
          slideList.push(cat);
        }
      });

      // Верхний таб-бар: только топ-уровень с хотя бы одним слайдом
      const parentCats = categories.filter((cat) => {
        const hasChildSlides = (cat.children || []).some(
          (c) => grouped[c.slug]?.length > 0,
        );
        return hasChildSlides || grouped[cat.slug]?.length > 0;
      });

      // Map parentId → [Все, ...подкатегории] для нижнего таб-бара
      const subMap = new Map<number, CategoryType[]>();
      categories.forEach((cat) => {
        const childrenWithProducts = (cat.children || []).filter(
          (c) => grouped[c.slug]?.length > 0,
        );
        if (childrenWithProducts.length > 0) {
          // Первым идёт виртуальный таб "Все" — это сам родитель с переименованием
          const allTab: CategoryType = { ...cat, categoryName: 'Все' };
          subMap.set(cat.id, [allTab, ...childrenWithProducts]);
        }
      });

      const idx = Math.max(0, slideList.findIndex((c) => c.slug === initialSlug));

      return {
        slidesData: grouped,
        slideCategories: slideList,
        parentCategories: parentCats,
        subCategoriesMap: subMap,
        initialIndex: idx,
      };
    }, [products, categories, initialSlug]);

  // Устанавливаем начальный индекс при загрузке
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  // Определяем активного родителя по текущему slug слайда
  const activeParent = useMemo(() => {
    const activeCat = slideCategories.find((c) => c.slug === activeSlug);
    if (!activeCat) return parentCategories[0];
    if (activeCat.parentCategory) {
      return (
        parentCategories.find((p) => p.id === activeCat.parentCategory) ??
        parentCategories[0]
      );
    }
    return parentCategories.find((p) => p.id === activeCat.id) ?? parentCategories[0];
  }, [activeSlug, slideCategories, parentCategories]);

  // Подкатегории активного родителя (для нижнего ряда)
  const subCategories = activeParent ? (subCategoriesMap.get(activeParent.id) ?? []) : [];

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);

    const category = slideCategories[newIndex];
    if (category) {
      setActiveSlug(category.slug);
      window.history.replaceState(null, '', `/${venueSlug}/products/${category.slug}`);
    }
  };

  // Клик по верхнему табу — прыгаем на первую подкатегорию этого родителя
  const handleParentClick = (parentIndex: number) => {
    const parent = parentCategories[parentIndex];
    if (!parent) return;
    const subs = subCategoriesMap.get(parent.id);
    const targetSlug = subs?.[0]?.slug ?? parent.slug;
    const slideIdx = slideCategories.findIndex((c) => c.slug === targetSlug);
    if (slideIdx >= 0) {
      // Сразу обновляем индекс, чтобы контент начал рендериться ДО прыжка
      setActiveIndex(slideIdx);
      swiperRef.current?.slideTo(slideIdx);
    }
  };

  // Клик по нижнему табу — прыгаем на конкретную подкатегорию
  const handleSubClick = (subSlug: string) => {
    const slideIdx = slideCategories.findIndex((c) => c.slug === subSlug);
    if (slideIdx >= 0) {
      setActiveIndex(slideIdx);
      swiperRef.current?.slideTo(slideIdx);
    }
  };

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 min-h-screen pb-40 border-t border-gray-100 flex flex-col'>
      <div className='sticky top-18 z-30 bg-white shadow-sm'>
        {/* Верхний ряд: родительские категории */}
        <div className='pt-2'>
          <Category
            categories={parentCategories}
            activeSlug={activeParent?.slug ?? ''}
            onSelect={handleParentClick}
          />
        </div>

        {/* Нижний ряд: подкатегории — показываем только если они есть */}
        {subCategories.length > 0 && (
          <div className='flex gap-4 px-5 pt-1 pb-2 overflow-x-auto no-scrollbar border-t border-gray-100'>
            {subCategories.map((sub) => {
              const isActive = sub.slug === activeSlug;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(sub.slug)}
                  className={`whitespace-nowrap text-sm pb-1 transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'text-brand font-bold border-brand'
                      : 'text-[#A4A4A4] font-medium border-transparent'
                  }`}
                >
                  {sub.categoryName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className='flex-1'>
        <Swiper
          // Виртуальный модуль не используем — ручная виртуализация ниже
          modules={[]}
          className='w-full h-full'
          spaceBetween={16}
          slidesPerView={1}
          initialSlide={initialIndex}
          // CSS mode даёт максимальную скорость свайпа
          cssMode={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (initialIndex > 0) swiper.slideTo(initialIndex, 0);
          }}
          onSlideChange={handleSlideChange}
        >
          {slideCategories.map((category, index) => {
            // Ручная виртуализация: рендерим только текущий слайд и соседей (+/- 1)
            // Это держит в DOM только ~3 тяжёлых списка товаров
            const shouldRender = Math.abs(index - activeIndex) <= 1;

            return (
              <SwiperSlide key={category.id}>
                <div className='pb-10 min-h-[80vh]'>
                  {shouldRender ? (
                    <Goods products={slidesData[category.slug]} />
                  ) : (
                    // Лёгкая заглушка сохраняет высоту слайда для корректного скролла
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
