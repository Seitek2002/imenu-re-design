'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useCart } from '@/store/cart';
import FoodDetail from './FoodDetail';
import { type Product } from '@/lib/api/types';

import 'swiper/css';
import 'swiper/css/pagination';

import Category, { type CategoryHandle } from './Category';
import Goods from './Goods';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

import { PAGES } from '@/config/pages.config';

const Content = ({ headerHidden }: { headerHidden?: boolean }) => {
  const { categories } = useCart();
  const router = useRouter();
  const searchCategory = useSearchParams().get('category');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const sp = useSearchParams();
  const searchQuery = (sp.get('search') ?? '').trim();
  const searchOpen = sp.get('searchOpen') === '1';

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };
  const swiperRef = useRef<any>(null);
  const categoryRef = useRef<CategoryHandle | null>(null);

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
    <div className='bg-white rounded-4xl mt-1.5 pb-40'>
      <FoodDetail
        open={isDetailOpen}
        product={selectedProduct}
        onClose={() => setIsDetailOpen(false)}
      />
      {/* Search input: appears only when toggled from header */}
      {searchOpen && (
        <div className='px-3 pt-3'>
          <SearchBar placeholder='Поиск блюд' autoFocus />
        </div>
      )}

      {/* When search is present, render results instead of category swiper */}
      {searchQuery ? (
        <SearchResults onOpen={handleOpenProduct} />
      ) : (
        <>
          <Category
            ref={categoryRef}
            categories={categories}
            headerHidden={headerHidden}
            activeSlug={categories[activeIndex]?.categoryName}
            onSelect={(slug, index) => {
              setActiveIndex(index);
              swiperRef.current?.slideTo(index);
              router.replace(PAGES.MENU(slug), { scroll: false });
            }}
          />
          <Swiper
            modules={[Pagination]}
            className='pb-10'
            autoHeight={true}
            spaceBetween={30}
            onSwiper={(s) => {
              swiperRef.current = s;
              s.slideTo(activeIndex, 0);
              categoryRef.current?.scrollToSlug(
                categories[activeIndex]?.categoryName
              );
            }}
            onSlideChange={(s) => {
              setActiveIndex(s.activeIndex);
              const slug = categories[s.activeIndex]?.categoryName;
              if (slug) {
                router.replace(PAGES.MENU(slug), { scroll: false });
                categoryRef.current?.scrollToSlug(slug);
              }
            }}
          >
            {categories.map((category, i) => (
              <SwiperSlide key={i}>
                <Goods
                  category={category.categoryName}
                  onOpen={handleOpenProduct}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </div>
  );
};

export default Content;
