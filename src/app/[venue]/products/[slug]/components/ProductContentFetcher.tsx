import Content from './Content';
import { VenueService } from '@/services/venue.service';

interface Props {
  venue: string;
  slug: string;
}

export default async function ProductContentFetcher({ venue, slug }: Props) {
  const [allProducts, categories] = await Promise.all([
    VenueService.getAllProducts(venue),
    VenueService.getAllCategories(venue),
  ]);

  return (
    <Content
      products={allProducts}
      categories={categories}
      venueSlug={venue}
      initialSlug={slug}
    />
  );
}
