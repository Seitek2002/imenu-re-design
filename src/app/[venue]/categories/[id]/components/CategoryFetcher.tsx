import Content, { CategoryGroup, CategoryLayout } from './Content';
import { VenueService } from '@/services/venue.service';
import { Category } from '@/types/api';
import { readSpotCookie } from '@/lib/spot-cookie.server';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

interface Props {
  venue: string;
  id: string;
}

// Раскладка зависит ТОЛЬКО от структуры данных:
// - есть ли у листьев родители в этом же наборе → grouped (с заголовками-родителями)
// - нет иерархии → flat
// Размер списка не учитываем — иначе одна и та же секция в разных заведениях
// рендерится по-разному, и пользователь не может выработать ментальную модель.
function buildLayout(sectionCats: Category[]): CategoryLayout {
  // Рекурсивно собираем все узлы поддерева секции, чтобы поддержать
  // произвольную глубину (SIERRA: Холодные напитки → Вино → Красное/Белое/Розе).
  // Без рекурсии 3-й уровень терялся и не появлялся ни в одной группе.
  const all = new Map<number, Category>();
  const walk = (nodes: Category[]) => {
    for (const c of nodes) {
      if (!all.has(c.id)) all.set(c.id, c);
      if (c.children?.length) walk(c.children);
    }
  };
  walk(sectionCats);

  const parentIds = new Set<number>();
  for (const c of all.values()) {
    if (c.parentCategory != null && all.has(c.parentCategory)) {
      parentIds.add(c.parentCategory);
    }
  }

  const leaves = [...all.values()].filter((c) => !parentIds.has(c.id));

  // Группируем листья по их непосредственному родителю — даже если глубина
  // больше двух, листья 3-го уровня попадают в группу своего прямого
  // родителя (например, Красное/Белое/Розе → группа «Вино»).
  const groupMap = new Map<number, Category[]>();
  const orphans: Category[] = [];

  for (const leaf of leaves) {
    const parentId = leaf.parentCategory;
    if (parentId != null && all.has(parentId)) {
      const arr = groupMap.get(parentId) ?? [];
      arr.push(leaf);
      groupMap.set(parentId, arr);
    } else {
      orphans.push(leaf);
    }
  }

  // Все листья — orphan-ы (нет иерархии в этой секции) → flat.
  if (groupMap.size === 0) {
    return { mode: 'flat', items: leaves };
  }

  const groups: CategoryGroup[] = [];
  for (const [parentId, items] of groupMap) {
    const parent = all.get(parentId)!;
    groups.push({ parent, items });
  }
  if (orphans.length > 0) {
    groups.push({ parent: null, items: orphans });
  }

  return { mode: 'grouped', groups };
}

export default async function CategoryFetcher({ venue, id }: Props) {
  const locale = (await getLocale()) as Locale;
  const sectionId = Number(id);
  const spotId = await readSpotCookie(venue);

  const [sectionCats, allProducts] = await Promise.all([
    VenueService.getCategoriesBySection(venue, sectionId, locale),
    VenueService.getAllProducts(venue, spotId, locale),
  ]);

  const layout = buildLayout(sectionCats);

  // Прямые товары — линкованные напрямую к id категории.
  const directCount: Record<number, number> = {};
  for (const product of allProducts) {
    for (const c of product.categories ?? []) {
      directCount[c.id] = (directCount[c.id] ?? 0) + 1;
    }
  }

  // Cover-плитки родителей (Холодные напитки, Вино) показывают сумму по
  // всему поддереву. Без этого «Холодные напитки» теряли счёт винных
  // внуков, потому что Вино — промежуточный узел без собственных товаров.
  const productCountBySubtree: Record<number, number> = {};
  const fillSubtree = (nodes: typeof sectionCats) => {
    for (const c of nodes) {
      let sum = directCount[c.id] ?? 0;
      if (c.children?.length) {
        fillSubtree(c.children);
        for (const ch of c.children) sum += productCountBySubtree[ch.id] ?? 0;
      }
      productCountBySubtree[c.id] = sum;
    }
  };
  fillSubtree(sectionCats);

  return (
    <Content
      venueSlug={venue}
      layout={layout}
      productCountByCatId={productCountBySubtree}
    />
  );
}
