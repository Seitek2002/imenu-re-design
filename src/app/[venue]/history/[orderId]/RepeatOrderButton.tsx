'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useVenueProducts } from '@/lib/api/queries';
import {
  useBasketStore,
  type AddToBasketSelection,
  type BasketGroupSelection,
} from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import type { OrderV2 } from '@/lib/order';
import Toast from '@/components/ui/Toast';

interface Props {
  order: OrderV2;
}

/**
 * Пересборка корзины из OrderProducts.
 *
 * Что умеем:
 *  - простые позиции — добавляем с актуальной ценой из каталога;
 *  - flat-модификаторы (старый формат размеров) — по `modificator.id`;
 *  - group-модификаторы — по `groupModifications[]` из `OrderProduct` (Kuma 2026-05-20).
 *
 * Что НЕ умеем:
 *  - товары снятые с продажи / отсутствующие в текущем каталоге — пропускаем;
 *  - позиции где group-mod был выбран, но соответствующий GroupItem удалён
 *    из каталога с тех пор — помечаем «требуют уточнения».
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

      const selection: AddToBasketSelection = {};

      if (it.modificator != null && product.modificators?.length) {
        const mod = product.modificators.find((m) => m.id === it.modificator);
        if (mod) {
          selection.flatModId = mod.id;
          selection.flatModName = mod.name;
          selection.flatModPrice = mod.price;
        }
      }

      // Восстанавливаем group-мод выбор: лукапим каждую запись it.groupModifications[]
      // в product.groupModifications[].items[] чтобы определить groupId и собрать
      // BasketGroupSelection с актуальными name/price из каталога.
      if (it.groupModifications?.length && product.groupModifications?.length) {
        const grouped = new Map<number, BasketGroupSelection>();
        let lookupFailed = false;
        for (const gm of it.groupModifications) {
          const groupDef = product.groupModifications.find((g) =>
            g.items.some((i) => i.id === gm.id),
          );
          if (!groupDef) {
            lookupFailed = true;
            break;
          }
          const item = groupDef.items.find((i) => i.id === gm.id)!;
          let entry = grouped.get(groupDef.id);
          if (!entry) {
            entry = { groupId: groupDef.id, groupName: groupDef.name, items: [] };
            grouped.set(groupDef.id, entry);
          }
          entry.items.push({
            id: item.id,
            name: item.name,
            count: gm.count,
            price: item.price,
          });
        }
        if (lookupFailed) {
          // Какой-то выбранный вариант больше не в каталоге — лучше попросить юзера переcобрать.
          needsReview += 1;
          continue;
        }
        selection.groupSelections = Array.from(grouped.values());
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
