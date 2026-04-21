'use client';

import { useEffect, useRef } from 'react';
import { useVenueStore, Venue } from '@/store/venue';
import { useBasketStore } from '@/store/basket';
import { writeSpotCookie, clearSpotCookie } from '@/lib/spot-cookie.client';

interface Props {
  venue: Venue;
  tableId?: number;
  spotId?: number;
  isKioskMode?: boolean;
}

export default function VenueInitializer({
  venue,
  tableId,
  spotId,
  isKioskMode,
}: Props) {
  const initialized = useRef(false);

  const setContext = useVenueStore((state) => state.setContext);
  const currentSlug = useVenueStore((state) => state.venueSlug);

  useEffect(() => {
    useVenueStore.setState({ data: venue });

    const tableNumFromApi = venue.table?.tableNum;

    const hasNewContext =
      (tableId !== undefined && tableId !== null) ||
      (spotId !== undefined && spotId !== null);

    const venueChanged = !!currentSlug && currentSlug !== venue.slug;

    const basket = useBasketStore.getState();
    // Корзина живёт в localStorage и переживает сессию, а venueSlug в
    // useVenueStore — в sessionStorage. Сверяем по slug’у, записанному
    // внутри самой корзины, чтобы ловить смену заведения и между сессиями.
    const basketFromOtherVenue =
      basket.venueSlug != null && basket.venueSlug !== venue.slug;
    // Корзина, сохранённая до внедрения scope’а (или «осиротевшая» после
    // clearBasket), не имеет slug’а. Если там лежат позиции — мы не можем
    // подтвердить их происхождение, безопаснее сбросить.
    const basketOrphanedWithItems =
      basket.venueSlug == null && basket.items.length > 0;

    if (venueChanged || basketFromOtherVenue || basketOrphanedWithItems) {
      basket.clearBasket();
    }
    basket.setVenueSlug(venue.slug);

    if (hasNewContext) {
      setContext({
        tableId,
        spotId,
        isKioskMode,
        tableNumber: tableNumFromApi,
        venueSlug: venue.slug,
      });
      // QR-контекст имеет приоритет — синхронизируем куку, чтобы SSR отдавал
      // цены этой точки при последующих переходах.
      if (spotId != null) writeSpotCookie(venue.slug, spotId);
    } else if (venueChanged) {
      setContext({
        tableId: null,
        spotId: null,
        tableNumber: null,
        venueSlug: venue.slug,
      });
      // При смене заведения — сбрасываем чужую точку из куки.
      clearSpotCookie();
    }

    const color = venue?.colorTheme || '#b45309';
    document.documentElement.style.setProperty('--brand-color', color);

    initialized.current = true;
  }, [venue, tableId, spotId, isKioskMode, setContext, currentSlug]);

  return null;
}
