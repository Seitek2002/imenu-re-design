'use client';

import { useBasketStore } from '@/store/basket';
import { useBonusStore } from '@/store/bonus';
import { useCheckout } from '@/store/checkout';
import { useVenueStore } from '@/store/venue';
import {
  useClientBonus,
  usePromotionsV2,
  useVenueProducts,
} from '@/lib/api/queries';
import { pickAppliedPromotion } from '@/lib/promotions';
import { maxDeductibleBonus } from '@/lib/bonus';

interface Options {
  subtotal: number;
  deliveryType: 'takeout' | 'delivery' | 'dinein';
  deliveryCost: number;
}

export function useOrderSummary({ subtotal, deliveryType, deliveryCost }: Options) {
  const venue = useVenueStore((s) => s.data);
  const spotId = useVenueStore((s) => s.spotId);
  const { phone } = useCheckout();

  const { isBonusUsed, bonusAmount, setBonusUsed, setBonusAmount } = useBonusStore();

  const { data: bonusData } = useClientBonus({ phone, venueSlug: venue?.slug ?? '' });
  const availableBonuses = bonusData?.bonus ?? 0;
  const maxDeductible = maxDeductibleBonus(
    availableBonuses,
    subtotal,
    venue?.bonusMaxDeductiblePercent,
  );
  const effectiveAmount = isBonusUsed ? Math.min(Math.max(0, bonusAmount), maxDeductible) : 0;
  const discount = effectiveAmount;

  const basketItems = useBasketStore((s) => s.items);
  const { data: promotions } = usePromotionsV2(venue?.slug, spotId);
  const { data: productsCatalog } = useVenueProducts(venue?.slug, spotId);
  const applied = pickAppliedPromotion(promotions, basketItems, productsCatalog);
  const promoDiscount = applied?.discount.amount ?? 0;

  const finalDisplayTotal = Math.max(
    0,
    subtotal + (deliveryType === 'delivery' ? deliveryCost : 0) - discount - promoDiscount,
  );

  const handleBonusToggle = () => {
    if (isBonusUsed) {
      setBonusUsed(false);
      setBonusAmount(0);
    } else {
      setBonusUsed(true);
      setBonusAmount(maxDeductible);
    }
  };

  return {
    availableBonuses,
    maxDeductible,
    effectiveAmount,
    discount,
    isBonusUsed,
    bonusAmount,
    setBonusAmount,
    handleBonusToggle,
    applied,
    promoDiscount,
    finalDisplayTotal,
  };
}
