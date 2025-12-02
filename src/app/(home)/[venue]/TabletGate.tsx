'use client';

import { usePathname } from 'next/navigation';
import { isTabletRoutePath } from '@/lib/utils/slug';
import { useVenueQuery } from '@/store/venue';

export default function TabletGate() {
  const pathname = usePathname();
  const isTabletRoute = isTabletRoutePath(pathname);
  const { tableId } = useVenueQuery();

  // Только для планшетного режима (route ...d) и когда не задан стол
  if (!isTabletRoute || tableId) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F6F7] p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold text-[#111] mb-3">Режим планшета</h1>
        <p className="text-[#4B5563]">
          Сканируйте QR‑код на столе, чтобы открыть меню для этого стола.
        </p>
      </div>
    </div>
  );
}
