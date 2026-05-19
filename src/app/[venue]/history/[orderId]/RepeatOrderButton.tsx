'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useVenueProducts } from '@/lib/api/queries';
import { useBasketStore, type AddToBasketSelection } from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import type { OrderV2 } from '@/lib/order';
import Toast from '@/components/ui/Toast';

interface Props {
  order: OrderV2;
}

/**
 * Best-effort пересборка корзины из OrderProducts.
 *
 * Что умеем:
 *  - простые позиции — добавляем как есть с актуальной ценой из каталога;
 *  - flat-модификаторы (размер старого формата) — переносим по `modificator.id`.
 *
 * Что НЕ умеем (зависит от Kuma §1.1 — groupModifications в OrderProductDetail):
 *  - позиции с обязательными group-mods (Кола 1л/2л Postera, бургер + соусы) —
 *    в ответе бэка нет выбранных вариантов, пользователю придётся пересобрать.
 *    Помечаем как «требуют уточнения» и не добавляем в корзину.
 *  - товары снятые с продажи / отсутствующие в текущем каталоге — пропускаем.
 */
export default function RepeatOrderButton({ order }: Props) {
  const t = useTranslations('OrderDetail');
  const router = useRouter();
  const { venue } = useParams<{ venue: string }>();
  const spotId = useVenueStore((s) => s.spotId);
  const { data: catalog, isLoading } = useVenueProducts(venue, spotId);
  const basketItems = useBasketStore((s) => s.items);
  const basketVenue = useBasketStore((s) => s.venueSlug);
  const addToBasket = useBasketStore((s) => s.addToBasket);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const setVenueSlug = useBasketStore((s) => s.setVenueSlug);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRepeat = async () => {
    if (busy || isLoading || !catalog) return;

    if (basketItems.length > 0 && basketVenue && basketVenue !== venue) {
      if (!window.confirm(t('repeatConfirmClear'))) return;
      clearBasket();
    }

    setBusy(true);

    let added = 0;
    let needsReview = 0;
    let missing = 0;

    for (const it of order.orderProducts ?? []) {
      const product = catalog.find((p) => p.id === it.product.id);
      if (!product) {
        missing += 1;
        continue;
      }
      const hasRequiredGroups = (product.groupModifications ?? []).some(
        (g) => g.selection.min >= 1,
      );
      if (hasRequiredGroups) {
        // Не можем восстановить выбор без groupModifications в OrderProductDetail
        needsReview += 1;
        continue;
      }

      const selection: AddToBasketSelection = {};
      if (it.modificator != null && product.modificators?.length) {
        const mod = product.modificators.find((m) => m.id === it.modificator);
        if (mod) {
          selection.flatModId = mod.id;
          selection.flatModName = mod.name;
          selection.flatModPrice = mod.price;
        }
      }

      addToBasket(product, it.count, selection);
      added += 1;
    }

    if (added > 0) setVenueSlug(venue);

    setBusy(false);

    if (added === 0) {
      setToast(t('repeatNothing'));
      return;
    }

    if (needsReview > 0 || missing > 0) {
      setToast(
        t('repeatPartial', {
          added,
          total: order.orderProducts?.length ?? 0,
          review: needsReview + missing,
        }),
      );
    } else {
      setToast(t('repeatSuccess'));
    }

    // даём toast'у показаться, потом ведём в корзину
    window.setTimeout(() => router.push(`/${venue}/cart`), 600);
  };

  return (
    <>
      <button
        type='button'
        onClick={handleRepeat}
        disabled={busy || isLoading || !catalog}
        className='w-full h-12 rounded-2xl bg-[#21201F] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60'
      >
        {busy ? (
          <Loader2 size={18} className='animate-spin' />
        ) : (
          <RotateCcw size={18} />
        )}
        {busy ? t('repeatLoading') : t('repeat')}
      </button>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
