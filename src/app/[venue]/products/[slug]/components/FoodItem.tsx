'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types/api';
import placeholder from '@/assets/Foods/placeholder.webp';
import FoodItemImage from './foods/FoodItemImage';
import FoodItemCounter from './foods/FoodItemCounter';
import ProductLink from './foods/ProductLink';
import { useVenueStore } from '@/store/venue';
import { usePromotionsV2 } from '@/lib/api/queries';
import { findActivePromotionForProduct } from '@/lib/promotions';

interface Props {
  product: Product;
  index?: number;
}

const FoodItem: FC<Props> = ({ product, index = 0 }) => {
  const tc = useTranslations('Common');

  const venueSlug = useVenueStore((s) => s.data?.slug ?? null);
  const spotId = useVenueStore((s) => s.spotId);
  const { data: promotions } = usePromotionsV2(venueSlug, spotId);
  const promo = findActivePromotionForProduct(product, promotions);
  const promoPercent = promo?.benefit.discountPercent ?? null;
  let price = product.productPrice;
  let isFrom = false;

  if (price === 0) {
    const groups = product.groupModifications ?? [];
    const requiredGroups = groups.filter(
      (g) => g.selection.min > 0 && g.items.length > 0,
    );

    // 1) Sum of cheapest items across required groups
    if (requiredGroups.length > 0) {
      const requiredSum = requiredGroups.reduce((sum, g) => {
        const cheapest = Math.min(...g.items.map((i) => Number(i.price)));
        return sum + cheapest * g.selection.min;
      }, 0);
      if (requiredSum > 0) {
        price = requiredSum;
        isFrom = true;
      }
    }

    // 2) Cheapest flat modificator
    if (price === 0 && product.modificators && product.modificators.length > 0) {
      const flatMin = Math.min(...product.modificators.map((m) => m.price));
      if (flatMin > 0) {
        price = flatMin;
        isFrom = true;
      }
    }

    // 3) Cheapest paid item across ANY group (covers groups marked optional in POS)
    if (price === 0) {
      const allItemPrices = groups
        .flatMap((g) => g.items.map((i) => Number(i.price)))
        .filter((p) => p > 0);
      if (allItemPrices.length > 0) {
        price = Math.min(...allItemPrices);
        isFrom = true;
      }
    }
  }

  const imageUrl =
    product.productPhotoSmall || product.productPhoto || placeholder;
  const isPriority = index < 4;

  return (
    <div className='w-full flex flex-col h-full group relative'>
      <ProductLink product={product} className='absolute inset-0 z-0' />

      <div className='relative w-full aspect-square pointer-events-none'>
        <FoodItemImage
          src={imageUrl}
          alt={product.productName}
          isPriority={isPriority}
        />

        {promo && promoPercent != null && (
          <div className='absolute top-1.5 left-1.5 z-10 bg-brand text-white text-[11px] font-bold leading-none px-2 py-1 rounded-md shadow-sm'>
            −{promoPercent}%
          </div>
        )}

        <div className='absolute bottom-1.5 right-1.5 left-1.5 z-10 pointer-events-auto'>
          <FoodItemCounter product={product} />
        </div>
      </div>

      <div className='mt-2 flex flex-col flex-1 justify-between pointer-events-none'>
        <h2 className='text-[#21201F] text-lg font-semibold'>
          {isFrom && (
            <span className='text-sm font-normal text-gray-500 mr-1'>{tc('from')}</span>
          )}
          {price} {tc('currency')}
        </h2>
        <h3 className='text-[#181818] text-sm font-medium leading-tight line-clamp-2 group-active:text-brand transition-colors'>
          {product.productName}
        </h3>
        {product.weight > 0 && (
          <span className='text-[#757575] text-xs mt-1'>
            {product.weight} {product.unitDisplay || product.measureUnit || tc('weightUnit')}
          </span>
        )}
      </div>
    </div>
  );
};

export default FoodItem;
