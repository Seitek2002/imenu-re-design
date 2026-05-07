import Content, { CategoryGroup, CategoryLayout } from './Content';
import { VenueService } from '@/services/venue.service';
import { Category, Product, Promotion } from '@/types/api';
import { fetchPromotions } from '@/lib/api/queries';
import { findActivePromotionForProduct } from '@/lib/promotions';
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
  const all = new Map<number, Category>();
  for (const c of sectionCats) {
    all.set(c.id, c);
    for (const child of c.children ?? []) {
      if (!all.has(child.id)) all.set(child.id, child);
    }
  }

  const parentIds = new Set<number>();
  for (const c of all.values()) {
    if (c.parentCategory != null && all.has(c.parentCategory)) {
      parentIds.add(c.parentCategory);
    }
  }

  const leaves = [...all.values()].filter((c) => !parentIds.has(c.id));

  // Группируем по родителю. Орфаны (родитель не в наборе) идут в безымянную группу.
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

// Считаем для каждой категории «лучший» промо-лейбл: максимальный процент
// скидки среди её товаров с активным промо. Если процентов нет, но есть
// иной тип промо — отдаём дженерик-маркер.
function buildPromoLabels(
  products: Product[],
  promotions: Promotion[],
): Map<number, string> {
  const data = new Map<number, { maxPct: number; hasGeneric: boolean }>();

  for (const product of products) {
    const promo = findActivePromotionForProduct(product, promotions);
    if (!promo) continue;
    const pct = promo.benefit.discountPercent ?? null;
    for (const c of product.categories ?? []) {
      const cur = data.get(c.id) ?? { maxPct: 0, hasGeneric: false };
      if (pct != null) {
        if (pct > cur.maxPct) cur.maxPct = pct;
      } else {
        cur.hasGeneric = true;
      }
      data.set(c.id, cur);
    }
  }

  const labels = new Map<number, string>();
  for (const [id, v] of data) {
    if (v.maxPct > 0) labels.set(id, `−${v.maxPct}%`);
    else if (v.hasGeneric) labels.set(id, '%');
  }
  return labels;
}

export default async function CategoryFetcher({ venue, id }: Props) {
  const locale = (await getLocale()) as Locale;
  const sectionId = Number(id);
  const spotId = await readSpotCookie(venue);

  const [sectionCats, allProducts, promotions] = await Promise.all([
    VenueService.getCategoriesBySection(venue, sectionId, locale),
    VenueService.getAllProducts(venue, spotId, locale),
    fetchPromotions(venue, spotId, locale).catch(() => [] as Promotion[]),
  ]);

  const layout = buildLayout(sectionCats);
  const promoLabels = buildPromoLabels(allProducts, promotions);

  return (
    <Content
      venueSlug={venue}
      layout={layout}
      promoLabelByCatId={Object.fromEntries(promoLabels)}
    />
  );
}
