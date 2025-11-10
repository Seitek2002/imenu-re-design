'use client';

import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useProductsV2 } from '@/lib/api/queries';
import type { Product } from '@/lib/api/types';
import GoodItem from './GoodItem';
import SkeletonGoodItem from './SkeletonGoodItem';

type Props = {
  onOpen?: (product: Product) => void;
};

export default function SearchResults({ onOpen }: Props) {
  const sp = useSearchParams();
  const q = (sp.get('search') ?? '').trim();
  const params = useParams<{ venue?: string }>();
  const venueSlug =
    params?.venue ??
    (typeof window !== 'undefined'
      ? (localStorage.getItem('venueRoot') || '').replace(/^\//, '')
      : undefined);

  const { data, isLoading } = useProductsV2(
    { venueSlug, search: q },
    { enabled: !!venueSlug && !!q }
  );

  const items = (data || []).sort((a, b) => {
    const aHas = !!(a.productPhoto && String(a.productPhoto).trim());
    const bHas = !!(b.productPhoto && String(b.productPhoto).trim());
    return Number(bHas) - Number(aHas);
  });

  return (
    <div className="px-3 pb-6">
      <div className="text-sm text-[#6B7280] mb-3">
        Поиск: <span className="font-medium text-[#111111]">{q}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonGoodItem key={i} />)
        ) : items.length > 0 ? (
          items.map((item) => <GoodItem key={item.id} item={item} onOpen={onOpen} />)
        ) : (
          <div className="col-span-2">
            <div className="flex flex-col items-center justify-center text-center py-10 rounded-2xl bg-[#F5F5F5]">
              <div className="relative w-28 h-28 mb-3">
                <Image src="/placeholder-dish.svg" alt="Нет результатов" fill className="object-contain opacity-80" />
              </div>
              <div className="text-base font-semibold">Ничего не найдено</div>
              <div className="text-sm text-[#6B7280] mt-1">Попробуйте изменить запрос</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
