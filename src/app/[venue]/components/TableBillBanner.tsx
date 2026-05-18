'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, ReceiptText, X } from 'lucide-react';
import { useVenueStore } from '@/store/venue';
import { useUiFloatingStore } from '@/store/ui-floating';
import { useTableOrderSocket } from '@/hooks/useTableOrderSocket';
import { toMoneyNumber as toNumber, subtractMoney } from '@/types/pos-order';

interface Props {
  venueSlug: string;
}

export default function TableBillBanner({ venueSlug }: Props) {
  const pathname = usePathname();
  const t = useTranslations('TableBillBanner');
  const tableId = useVenueStore((s) => s.tableId);
  const tableNumberStore = useVenueStore((s) => s.tableNumber);
  const setBillBannerOpen = useUiFloatingStore((s) => s.setBillBannerOpen);
  const setHasOpenBill = useUiFloatingStore((s) => s.setHasOpenBill);

  // На странице счёта стола сам экран и есть напоминание — баннер не нужен
  // (заодно избегаем второго WS-коннекта).
  const isOnTableOrder = pathname.includes('/table-order');
  // На корзине нижняя CTA-плашка занимает место и так — не дублируем.
  const isOnCart = pathname.includes('/cart');

  const skip = isOnTableOrder || isOnCart;
  const { order } = useTableOrderSocket(skip ? null : tableId);

  const [dismissedKey, setDismissedKey] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(`imenu-bill-dismissed:${venueSlug}`);
  });

  const remainingStr = subtractMoney(order?.total ?? '0.00', order?.paidAmount ?? '0.00');
  const remaining = toNumber(remainingStr);
  const itemsCount =
    order?.items.filter((it) => toNumber(it.qty) > 0).length ?? 0;
  const stateKey = order ? `${order.id}:${order.version}` : null;

  const visible =
    !!tableId &&
    !skip &&
    !!order &&
    itemsCount > 0 &&
    remaining > 0 &&
    dismissedKey !== stateKey;

  useEffect(() => {
    setBillBannerOpen(visible);
    return () => setBillBannerOpen(false);
  }, [visible, setBillBannerOpen]);

  // Точка на «Корзине» — даже если баннер дисмиссили, индикатор остаётся,
  // пока WS видит открытый счёт.
  const hasBill =
    !!tableId && !skip && !!order && itemsCount > 0 && remaining > 0;
  useEffect(() => {
    setHasOpenBill(hasBill);
    return () => setHasOpenBill(false);
  }, [hasBill, setHasOpenBill]);

  if (!visible || !order || !stateKey) return null;

  const onDismiss = () => {
    sessionStorage.setItem(`imenu-bill-dismissed:${venueSlug}`, stateKey);
    setDismissedKey(stateKey);
  };

  const tableLabel = order.tableName || tableNumberStore || '';

  return (
    <div className='fixed bottom-20 lg:bottom-28 left-0 right-0 z-40 px-3 pointer-events-none max-w-175 mx-auto'>
      <div className='pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#E7E7E7] overflow-hidden animate-fadeIn'>
        <div className='h-1 bg-brand' />
        <div className='flex items-center gap-3 px-3 py-3'>
          <div className='w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0'>
            <ReceiptText size={22} />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-[13px] font-bold text-[#111111] truncate'>
                {t('title')}
              </span>
              {tableLabel && (
                <span className='text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-md bg-[#F1F2F3] text-[#6B6B6B]'>
                  №{tableLabel}
                </span>
              )}
            </div>
            <div className='text-xs text-[#6B6B6B] mt-0.5 truncate'>
              {t('subtitle', { count: itemsCount })}
            </div>
          </div>

          <button
            onClick={onDismiss}
            aria-label={t('dismiss')}
            className='w-8 h-8 rounded-lg text-[#A4A4A4] flex items-center justify-center shrink-0 active:scale-95 hover:bg-black/5 hover:text-[#6B6B6B] focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:outline-none transition-all cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        <Link
          href={`/${venueSlug}/table-order`}
          className='flex items-center justify-between gap-2 mx-3 mb-3 h-12 rounded-xl bg-brand text-white font-bold text-sm px-4 active:scale-[0.98] hover:brightness-110 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none transition-all shadow-md'
        >
          <span>{t('cta', { amount: remainingStr })}</span>
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
}
