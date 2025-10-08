'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import Category from './Category';
import Goods from './Goods';
import { useCart } from '@/store/cart';

const Content = () => {
  const { categories } = useCart();

  return (
    <div className='bg-white rounded-4xl mt-1.5 min-h-[120svh]'>
      <Category categories={categories} />
      <Swiper modules={[Pagination]} className='px-4'>
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
