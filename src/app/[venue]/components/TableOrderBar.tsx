'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useVenueStore } from '@/store/venue';
import { useCurrentPosOrder } from '@/lib/api/pos-orders';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  venueSlug: string;
}

function toNumber(v: string | undefined | null): number {
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function TableOrderBar({ venueSlug }: Props) {
  const mounted = useMounted();
  const pathname = usePathname();
  const t = useTranslations('TableOrderBar');
  const tableId = useVenueStore((s) => s.tableId);
  const tableNumber = useVenueStore((s) => s.tableNumber);

  const { data: order } = useCurrentPosOrder(tableId);

  if (!mounted || !tableId) return null;

  const target = `/${venueSlug}/table-order`;
  if (pathname === target || pathname === `/${venueSlug}/cart`) return null;

  if (!order || order.items.length === 0) return null;

  const itemsCount = order.items.reduce(
    (acc, it) => acc + toNumber(it.qty),
    0,
  );
  const remaining = Math.max(
    0,
    toNumber(order.total) - toNumber(order.paidAmount),
  );

  return (
    <Link
      href={target}
      className='fixed bottom-36 left-0 right-0 z-40 max-w-175 mx-auto px-3'
    >
      <div className='bg-brand text-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3 active:scale-[0.98] transition-transform'>
        <UtensilsCrossed size={18} className='shrink-0' />
        <div className='flex-1 min-w-0'>
          <div className='text-[11px] uppercase tracking-wide opacity-80 leading-none'>
            {t('label', { num: tableNumber || '' })}
          </div>
          <div className='text-sm font-bold leading-tight truncate'>
            {t('summary', {
              count: Math.round(itemsCount),
              amount: Math.round(remaining || toNumber(order.total)),
            })}
          </div>
        </div>
        <ChevronRight size={18} className='shrink-0 opacity-80' />
      </div>
    </Link>
  );
}
