'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';

import 'swiper/css';

import Goods from './Goods';
import Category from './Category';
import { Product, Category as CategoryType } from '@/types/api';
import { useUIStore } from '@/store/ui';

interface Props {
  products: Product[];
  categories: CategoryType[]; // top-level категории (родители)
  venueSlug: string;
  initialSlug: string;
}

type ParentSlide = {
  parent: CategoryType;
  sections: { category: CategoryType; products: Product[] }[];
};

const Content = ({ products, categories, venueSlug, initialSlug }: Props) => {
  const swiperRef = useRef<SwiperType | null>(null);

  const { parentSlides, initialParentIdx, initialChildSlug } = useMemo(() => {
    const slides: ParentSlide[] = [];

    for (const parent of categories) {
      const children = parent.children ?? [];
      const childIdSet = new Set(children.map((c) => c.id));

      const sections: ParentSlide['sections'] = [];

      // Продукты, привязанные к родителю напрямую (минуя детей)
      const parentOnlyProducts = products.filter((p) => {
        const inParent = p.categories?.some((c) => c.id === parent.id);
        if (!inParent) return false;
        // если продукт принадлежит какому-то ребёнку этого родителя, не дублируем
        return !p.categories?.some((c) => childIdSet.has(c.id));
      });

      if (children.length === 0) {
        // Родитель без детей — одна плоская лента под именем родителя
        const all = products.filter((p) =>
          p.categories?.some((c) => c.id === parent.id),
        );
        if (all.length > 0) {
          sections.push({ category: parent, products: all });
        }
      } else {
        // Родитель + дети — секции по каждой подкатегории
        if (parentOnlyProducts.length > 0) {
          sections.push({ category: parent, products: parentOnlyProducts });
        }
        for (const child of children) {
          const childProducts = products.filter((p) =>
            p.categories?.some((c) => c.id === child.id),
          );
          if (childProducts.length > 0) {
            sections.push({ category: child, products: childProducts });
          }
        }
      }

      if (sections.length > 0) {
        slides.push({ parent, sections });
      }
    }

    // Ищем, к какому родителю относится initialSlug
    let parentIdx = 0;
    let childSlug: string | null = null;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.parent.slug === initialSlug) {
        parentIdx = i;
        break;
      }
      const hit = slide.sections.find(
        (s) => s.category.slug === initialSlug && s.category.id !== slide.parent.id,
      );
      if (hit) {
        parentIdx = i;
        childSlug = initialSlug;
        break;
      }
    }

    return {
      parentSlides: slides,
      initialParentIdx: parentIdx,
      initialChildSlug: childSlug,
    };
  }, [products, categories, initialSlug]);

  const [activeIndex, setActiveIndex] = useState(initialParentIdx);
  const setHeaderTitleOverride = useUIStore((s) => s.setHeaderTitleOverride);

  useEffect(() => {
    setActiveIndex(initialParentIdx);
  }, [initialParentIdx]);

  // Синхронизируем заголовок Header с активным родителем
  useEffect(() => {
    const parent = parentSlides[activeIndex]?.parent;
    if (parent) setHeaderTitleOverride(parent.categoryName);
    return () => setHeaderTitleOverride(null);
  }, [activeIndex, parentSlides, setHeaderTitleOverride]);

  // При открытии с child-слагом скроллим к нужной подкатегории
  useEffect(() => {
    if (!initialChildSlug) return;
    const el = document.getElementById(`subcat-${initialChildSlug}`);
    if (el) {
      // requestAnimationFrame — чтобы Swiper успел отрендерить текущий слайд
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }
  }, [initialChildSlug]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);
    const parent = parentSlides[newIndex]?.parent;
    if (parent) {
      window.history.replaceState(
        null,
        '',
        `/${venueSlug}/products/${parent.slug}`,
      );
    }
  };

  const handleParentClick = (idx: number) => {
    setActiveIndex(idx);
    swiperRef.current?.slideTo(idx);
  };

  const parentList = parentSlides.map((s) => s.parent);
  const activeParentSlug = parentSlides[activeIndex]?.parent.slug ?? '';

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 min-h-screen pb-40 border-t border-gray-100 flex flex-col'>
      <div className='sticky top-18 z-30 bg-white shadow-sm'>
        <div className='pt-2'>
          <Category
            categories={parentList}
            activeSlug={activeParentSlug}
            onSelect={handleParentClick}
          />
        </div>
      </div>

      <div className='flex-1'>
        <Swiper
          modules={[]}
          className='w-full h-full'
          spaceBetween={16}
          slidesPerView={1}
          initialSlide={initialParentIdx}
          cssMode={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (initialParentIdx > 0) swiper.slideTo(initialParentIdx, 0);
          }}
          onSlideChange={handleSlideChange}
        >
          {parentSlides.map((slide, index) => {
            const shouldRender = Math.abs(index - activeIndex) <= 1;

            return (
              <SwiperSlide key={slide.parent.id}>
                <div className='pb-10 min-h-[80vh]'>
                  {shouldRender ? (
                    <div className='flex flex-col gap-8 pt-4'>
                      {slide.sections.map((section) => {
                        // Заголовок не нужен, если секция одна и она же — сам родитель
                        // (родитель без подкатегорий). Имя уже в топ-табе.
                        const showHeader =
                          slide.sections.length > 1 ||
                          section.category.id !== slide.parent.id;

                        return (
                          <section
                            key={section.category.id}
                            id={`subcat-${section.category.slug}`}
                            // scroll-mt компенсирует высоту липких родит. табов
                            className='scroll-mt-28'
                          >
                            {showHeader && (
                              <h2 className='text-xl font-bold text-[#21201F] mb-3 px-2.5'>
                                {section.category.categoryName}
                              </h2>
                            )}
                            <Goods products={section.products} />
                          </section>
                        );
                      })}
                    </div>
                  ) : (
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
