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

// Рекурсивно ищет категорию любой глубины. Возвращает саму категорию и флаг
// isChild — true для всех потомков (child/grandchild/…). Top-level рендерим
// как parent с сабхедерами, потомков — как single-list.
function findCategory(
  sourceCats: Category[],
  slug: string,
  depth = 0,
): { category: Category; isChild: boolean } | null {
  for (const c of sourceCats) {
    if (c.slug === slug) return { category: c, isChild: depth > 0 };
    const hit = findCategory(c.children ?? [], slug, depth + 1);
    if (hit) return hit;
  }
  return null;
}

// Собирает id всех потомков (включая саму категорию) рекурсивно. Нужно,
// чтобы /v2/products/?categories=... вернул товары всего поддерева, а не
// только товары прямых детей top-level узла.
function collectDescendantIds(cats: Category[], out: number[] = []): number[] {
  for (const c of cats) {
    out.push(c.id);
    if (c.children?.length) collectDescendantIds(c.children, out);
  }
  return out;
}

export default async function ProductContentFetcher({ venue, slug }: Props) {
  const spotId = await readSpotCookie(venue);
  const locale = (await getLocale()) as Locale;
  const buttons = await VenueService.getMainButtons(venue, locale);

  const flatButtons = buttons.flat();

  // Находим секцию, которой принадлежит slug. Рекурсивно — slug может быть
  // внуком (SIERRA: Холодные напитки → Вино → Красное/Белое/Розе).
  const ownerButton = flatButtons.find(
    (b) => b.categories && findCategory(b.categories, slug),
  );

  const sourceCats = ownerButton?.categories ?? [];

  const hit = findCategory(sourceCats, slug);

  // Child-кейс: кликнули подкатегорию (любой глубины). Показываем только её
  // ветку — без соседних узлов и табов одного уровня выше.
  if (hit?.isChild) {
    const ids = collectDescendantIds([hit.category]);
    const products = await VenueService.getAllProducts(
      venue,
      spotId,
      locale,
      ids,
    );

    // Промежуточный узел (Вино → Красное/Белое/Розе): отдаём в Content как
    // одну top-level категорию — рендер сам построит h2/h3 для внуков.
    // SingleCategoryContent оставляем только для настоящих листьев, где
    // нечего разделять по подзаголовкам.
    if ((hit.category.children?.length ?? 0) > 0) {
      return (
        <Content
          products={products}
          categories={[hit.category]}
          venueSlug={venue}
          initialSlug={slug}
        />
      );
    }

    return <SingleCategoryContent category={hit.category} products={products} />;
  }

  // Parent-кейс: top-level или slug не найден. Top-level — те, у кого parent
  // не входит в текущий набор (т.е. корни поддерева в этой секции).
  const catMap = new Map<number, Category>();
  for (const c of sourceCats) {
    if (!catMap.has(c.id)) catMap.set(c.id, c);
  }

  // Категория может быть одновременно top-level и продублирована как child
  // другого узла — оставляем такие как top-level если перешли по их slug,
  // иначе активным становится первый таб секции.
  const categories = Array.from(catMap.values()).filter(
    (c) =>
      !c.parentCategory ||
      !catMap.has(c.parentCategory) ||
      c.slug === slug,
  );

  // Бэк фильтрует по точным id — тащим id всего поддерева каждой top-level
  // категории, иначе товары внуков (id 96 Красное) не придут когда фильтр
  // содержит только id корня (86 Холодные напитки).
  const categoryIds =
    categories.length > 0 ? collectDescendantIds(categories) : null;
  const allProducts = await VenueService.getAllProducts(
    venue,
    spotId,
    locale,
    categoryIds,
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
