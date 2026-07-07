'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types/api';
import placeholder from '@/assets/Foods/placeholder.webp';
import { safeImageSrc } from '@/lib/image';
import FoodItemImage from './foods/FoodItemImage';
import FoodItemVideo from './foods/FoodItemVideo';
import FoodItemCounter from './foods/FoodItemCounter';
import ProductLink from './foods/ProductLink';
import { useVenueStore } from '@/store/venue';
import { usePromotionsV2 } from '@/lib/api/queries';
import { findActivePromotionForProduct } from '@/lib/promotions';
import { productPriceLabel } from '@/lib/pricing';

interface Props {
  product: Product;
  index?: number;
}

const FoodItem: FC<Props> = ({ product, index = 0 }) => {
  const tc = useTranslations('Common');
  const tp = useTranslations('Cart.promo');

  const venueSlug = useVenueStore((s) => s.data?.slug ?? null);
  const spotId = useVenueStore((s) => s.spotId);
  const { data: promotions } = usePromotionsV2(venueSlug, spotId);
  const promo = findActivePromotionForProduct(product, promotions);
  const promoPercent = promo?.benefit.discountPercent ?? null;
  const promoLabel = promo
    ? promoPercent != null
      ? `−${promoPercent}%`
      : tp('itemBadgeGeneric')
    : null;
  // Цена дефолтного варианта (productPriceLabel сам предпочитает priceFrom,
  // но падает на productPrice, когда per-spot priceFrom=0 у тех-карт).
  const price = productPriceLabel(product);

  const imageUrl = safeImageSrc(
    product.productPhotoSmall || product.productPhoto,
    placeholder,
  );
  const isPriority = index < 4;

  return (
    <div className='w-full flex flex-col h-full group relative hover:opacity-90 transition-opacity'>
      <ProductLink product={product} className='absolute inset-0 z-0' />

      <div className='relative w-full aspect-square pointer-events-none'>
        <FoodItemImage
          src={imageUrl}
          alt={product.productName}
          isPriority={isPriority}
        />

        {product.isVideoProduct && product.productVideo && (
          <FoodItemVideo
            src={product.productVideo}
            poster={product.productPhoto || undefined}
          />
        )}

        {promoLabel && (
          <div className='absolute top-1.5 left-1.5 z-10 bg-brand text-white text-[11px] font-bold leading-none px-2 py-1 rounded-md shadow-sm'>
            {promoLabel}
          </div>
        )}

        <div className='absolute bottom-1.5 right-1.5 left-1.5 z-10 pointer-events-auto'>
          <FoodItemCounter product={product} />
        </div>
      </div>

      <div className='mt-2 flex flex-col flex-1 pointer-events-none'>
        <h2 className='text-[#21201F] text-lg font-semibold'>
          {price != null ? `${price} ${tc('currency')}` : ''}
        </h2>
        <h3 className='text-[#181818] text-sm font-medium leading-tight line-clamp-2 group-hover:text-brand group-active:text-brand transition-colors mt-1 flex-1'>
          {product.productName}
        </h3>
        {product.weight > 0 ? (
          <span className='text-[#757575] text-xs mt-1'>
            {product.weight} {product.unitDisplay || product.measureUnit || tc('weightUnit')}
          </span>
        ) : (
          <span className='text-xs mt-1 invisible'>&#8203;</span>
        )}
      </div>
    </div>
  );
};

export default FoodItem;
