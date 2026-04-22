import Content from './Content';
import SingleCategoryContent from './SingleCategoryContent';
import { VenueService } from '@/services/venue.service';
import { Category } from '@/types/api';
import { readSpotCookie } from '@/lib/spot-cookie.server';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

interface Props {
  venue: string;
  slug: string;
}

// Ищет категорию по slug в дереве ownerButton. Возвращает саму категорию и
// флаг isChild — чтобы решить, показывать ли её как single-list или как
// parent со свайпом/сабхедерами.
function findCategory(
  sourceCats: Category[],
  slug: string,
): { category: Category; isChild: boolean } | null {
  for (const c of sourceCats) {
    if (c.slug === slug) return { category: c, isChild: false };
    for (const child of c.children ?? []) {
      if (child.slug === slug) return { category: child, isChild: true };
    }
  }
  return null;
}

export default async function ProductContentFetcher({ venue, slug }: Props) {
  const spotId = await readSpotCookie(venue);
  const locale = (await getLocale()) as Locale;
  const [allProducts, buttons] = await Promise.all([
    VenueService.getAllProducts(venue, spotId, locale),
    VenueService.getMainButtons(venue, locale),
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

  const hit = findCategory(sourceCats, slug);

  // Child-кейс: кликнули подкатегорию. Показываем только её продукты плоским
  // списком, без соседних child’ов и без Swiper’а между top-level.
  if (hit?.isChild) {
    const products = allProducts.filter((p) =>
      p.categories?.some((c) => c.id === hit.category.id),
    );
    return <SingleCategoryContent category={hit.category} products={products} />;
  }

  // Parent-кейс: top-level или slug не найден — текущее поведение со Swiper’ом.
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
