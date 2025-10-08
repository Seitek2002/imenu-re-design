'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import Category from './Category';
import Goods from './Goods';
import { useCart } from '@/store/cart';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGES } from '@/config/pages.config';

const Content = () => {
  const { categories } = useCart();
  const router = useRouter();
  const searchCategory = useSearchParams().get('category');
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  // Sync initial slide with URL param and keep in sync when categories change
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const idx = categories.findIndex((c) => c.categoryName === searchCategory);
    const target = idx >= 0 ? idx : 0;
    setActiveIndex(target);
    if (swiperRef.current) {
      swiperRef.current.slideTo(target, 0);
    }
  }, [categories, searchCategory]);

  return (
    <div className='bg-white rounded-4xl mt-1.5 min-h-[120svh]'>
      <Category
        categories={categories}
        activeSlug={categories[activeIndex]?.categoryName}
        onSelect={(slug, index) => {
          setActiveIndex(index);
          swiperRef.current?.slideTo(index);
          router.replace(PAGES.MENU(slug));
        }}
      />
      <Swiper
        modules={[Pagination]}
        className='px-4'
        onSwiper={(s) => {
          swiperRef.current = s;
          // ensure initial alignment once swiper is ready
          if (activeIndex) s.slideTo(activeIndex, 0);
        }}
        onSlideChange={(s) => {
          setActiveIndex(s.activeIndex);
          const slug = categories[s.activeIndex]?.categoryName;
          if (slug) router.replace(PAGES.MENU(slug));
        }}
      >
        {categories.map((category, i) => (
          <SwiperSlide key={i}>
            <Goods category={category.categoryName} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Content;
