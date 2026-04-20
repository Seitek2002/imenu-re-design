'use client';

import { useEffect, useRef } from 'react';
import { useVenueStore, Venue } from '@/store/venue';
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
    } else {
      if (currentSlug && currentSlug !== venue.slug) {
        setContext({
          tableId: null,
          spotId: null,
          tableNumber: null,
          venueSlug: venue.slug,
        });
        // При смене заведения — сбрасываем чужую точку из куки.
        clearSpotCookie();
      }
    }

    const color = venue?.colorTheme || '#b45309';
    document.documentElement.style.setProperty('--brand-color', color);

    initialized.current = true;
  }, [venue, tableId, spotId, isKioskMode, setContext, currentSlug]);

  return null;
}
