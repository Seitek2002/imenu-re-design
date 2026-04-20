import Content from './Content';
import { VenueService } from '@/services/venue.service';
import { Category } from '@/types/api';
import { readSpotCookie } from '@/lib/spot-cookie.server';

interface Props {
  venue: string;
  slug: string;
}

export default async function ProductContentFetcher({ venue, slug }: Props) {
  const spotId = await readSpotCookie(venue);
  const [allProducts, buttons] = await Promise.all([
    VenueService.getAllProducts(venue, spotId),
    VenueService.getMainButtons(venue),
  ]);

  const flatButtons = buttons.flat();

  // Находим секцию, которой принадлежит slug (прямо или через children).
  const ownerButton = flatButtons.find((b) =>
    b.categories?.some(
      (c) => c.slug === slug || c.children?.some((ch) => ch.slug === slug),
    ),
  );

  // Если нашли — берём категории только из неё; иначе fallback на все.
  const sourceCats = (ownerButton ?? { categories: flatButtons.flatMap((b) => b.categories ?? []) }).categories ?? [];

  const catMap = new Map<number, Category>();
  for (const c of sourceCats) {
    if (!catMap.has(c.id)) catMap.set(c.id, c);
  }

  // Берём только top-level в рамках секции (children раскрываются внутри Content).
  const categories = Array.from(catMap.values()).filter(
    (c) => !c.parentCategory || !catMap.has(c.parentCategory),
  );

  return (
    <Content
      products={allProducts}
      categories={categories}
      venueSlug={venue}
      initialSlug={slug}
    />
  );
}
