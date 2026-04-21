import { useQuery } from '@tanstack/react-query';
import { VenueService } from '@/services/venue.service';

export const useVenue = (slug: string, tableId?: number) => {
  return useQuery({
    queryKey: ['venue', slug, tableId],
    queryFn: () => VenueService.getVenue(slug, tableId),
    enabled: !!slug, // Запрос не пойдет, пока slug пустой
    staleTime: 1000 * 60 * 5, // Кэшируем данные на 5 минут (супер для скорости)
  });
};
