import Content, { CategoryGroup, CategoryLayout } from './Content';
import { VenueService } from '@/services/venue.service';
import { Category } from '@/types/api';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

interface Props {
  venue: string;
  id: string;
}

const FLAT_THRESHOLD = 8;

function buildLayout(sectionCats: Category[]): CategoryLayout {
  // Собираем всё: топ-уровень секции + раскрытые дети, чтобы найти всех родителей.
  const all = new Map<number, Category>();
  for (const c of sectionCats) {
    all.set(c.id, c);
    for (const child of c.children ?? []) {
      if (!all.has(child.id)) all.set(child.id, child);
    }
  }

  // parentIds = те, кто фигурирует как parentCategory у кого-то из набора.
  const parentIds = new Set<number>();
  for (const c of all.values()) {
    if (c.parentCategory != null && all.has(c.parentCategory)) {
      parentIds.add(c.parentCategory);
    }
  }

  // Листья — всё, кроме внутренних узлов.
  const leaves = [...all.values()].filter((c) => !parentIds.has(c.id));

  if (leaves.length <= FLAT_THRESHOLD) {
    return { mode: 'flat', items: leaves };
  }

  // Группируем по родителю. Орфаны (родитель не в наборе) идут в "Остальное".
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
  const buttons = await VenueService.getMainButtons(venue, locale);
  const sectionId = Number(id);

  const button = buttons.flat().find((b) => b.section?.id === sectionId);
  const sectionCats = button?.categories ?? [];

  const layout = buildLayout(sectionCats);

  return <Content venueSlug={venue} layout={layout} />;
}
