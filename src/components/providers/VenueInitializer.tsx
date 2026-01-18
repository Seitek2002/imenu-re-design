'use client';

import { useEffect, useRef } from 'react';
import { useVenueStore, Venue } from '@/store/venue';

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

  useEffect(() => {
    // 1. Сохраняем данные заведения
    useVenueStore.setState({ data: venue });

    // 🔥 2. Вытаскиваем номер стола из ответа API
    // АПИ возвращает: "table": { "id": 84, "tableNum": "19" }
    const tableNumFromApi = venue.table?.tableNum;

    // 3. Сохраняем всё в контекст
    useVenueStore.getState().setContext({
      tableId,
      spotId,
      isKioskMode,
      tableNumber: tableNumFromApi, // <-- Вот мы его передаем!
    });

    // 4. Цвет темы
    const color = venue?.colorTheme || '#b45309';
    document.documentElement.style.setProperty('--brand-color', color);

    initialized.current = true;
  }, [venue, tableId, spotId, isKioskMode]);

  return null;
}
