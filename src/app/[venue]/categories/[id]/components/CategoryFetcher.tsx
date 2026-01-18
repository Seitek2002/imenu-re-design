import Content from './Content';
import { VenueService } from '@/services/venue.service';

interface Props {
  venue: string;
  id: string;
}

export default async function CategoryFetcher({ venue, id }: Props) {
  // Запрос данных переезжает сюда
  // Не забудь про /v2/ если это нужно, но тут мы грузим по sectionId
  const categories = await VenueService.getCategoriesBySection(venue, id);

  return <Content venueSlug={venue} categories={categories} />;
}
