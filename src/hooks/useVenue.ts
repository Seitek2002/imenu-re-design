import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { VenueService } from '@/services/venue.service';
import type { Locale } from '@/lib/locale';

export const useVenue = (slug: string, tableId?: number) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ['venue', slug, tableId, locale],
    queryFn: () => VenueService.getVenue(slug, tableId, locale),
    enabled: !!slug, // Запрос не пойдет, пока slug пустой
    staleTime: 1000 * 60 * 5, // Кэшируем данные на 5 минут (супер для скорости)
  });
};
