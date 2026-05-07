'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import Goods from './Goods';
import Category from './Category';
import { Product, Category as CategoryType } from '@/types/api';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { usePromotionsV2 } from '@/lib/api/queries';
import { findActivePromotionForProduct } from '@/lib/promotions';

// Виртуальные группы — синтетические "категории" с отрицательным id, чтобы
// не пересекаться с реальными. Слаги никогда не попадают в URL.
const VIRTUAL_DISCOUNTS_ID = -2;
const VIRTUAL_POPULAR_ID = -1;
const VIRTUAL_DISCOUNTS_SLUG = '__discounts__';
const VIRTUAL_POPULAR_SLUG = '__popular__';

function makeVirtualParent(
  id: number,
  slug: string,
  name: string,
): CategoryType {
  return {
    id,
    slug,
    categoryName: name,
    parentCategory: null,
    categoryPhoto: '',
    categoryPhotoSmall: '',
  };
}

interface Props {
  products: Product[];
  categories: CategoryType[];
  venueSlug: string;
  initialSlug: string;
}

type ParentGroup = {
  parent: CategoryType;
  sections: { category: CategoryType; products: Product[] }[];
  totalCount: number;
};

const PARENT_ID_PREFIX = 'parent-';

const Content = ({ products, categories, venueSlug, initialSlug }: Props) => {
  const setHeaderTitleOverride = useUIStore((s) => s.setHeaderTitleOverride);
  const spotId = useVenueStore((s) => s.spotId);
  const { data: promotions } = usePromotionsV2(venueSlug, spotId);
  const tCat = useTranslations('Categories');
  const isProgrammaticScrollRef = useRef(false);

  const { parentGroups, initialChildSlug } = useMemo(() => {
    const groups: ParentGroup[] = [];

    for (const parent of categories) {
      const children = parent.children ?? [];
      const childIdSet = new Set(children.map((c) => c.id));
      const sections: ParentGroup['sections'] = [];

      const parentOnlyProducts = products.filter((p) => {
        const inParent = p.categories?.some((c) => c.id === parent.id);
        if (!inParent) return false;
        return !p.categories?.some((c) => childIdSet.has(c.id));
      });

      if (children.length === 0) {
        const all = products.filter((p) =>
          p.categories?.some((c) => c.id === parent.id),
        );
        if (all.length > 0) sections.push({ category: parent, products: all });
      } else {
        if (parentOnlyProducts.length > 0) {
          sections.push({ category: parent, products: parentOnlyProducts });
        }
        for (const child of children) {
          const childProducts = products.filter((p) =>
            p.categories?.some((c) => c.id === child.id),
          );
          if (childProducts.length > 0) {
            sections.push({ category: child, products: childProducts });
          }
        }
      }

      if (sections.length > 0) {
        const totalCount = sections.reduce(
          (s, sec) => s + sec.products.length,
          0,
        );
        groups.push({ parent, sections, totalCount });
      }
    }

    let childSlug: string | null = null;
    for (const g of groups) {
      const hit = g.sections.find(
        (s) =>
          s.category.slug === initialSlug && s.category.id !== g.parent.id,
      );
      if (hit) {
        childSlug = initialSlug;
        break;
      }
    }

    return { parentGroups: groups, initialChildSlug: childSlug };
  }, [products, categories, initialSlug]);

  // Виртуальные группы: «Со скидкой» (промо) и «Хиты» (isRecommended).
  // Появляются автоматически если есть подходящие товары.
  const virtualGroups = useMemo(() => {
    const groups: ParentGroup[] = [];

    const promoProducts = products.filter((p) =>
      findActivePromotionForProduct(p, promotions),
    );
    if (promoProducts.length > 0) {
      const parent = makeVirtualParent(
        VIRTUAL_DISCOUNTS_ID,
        VIRTUAL_DISCOUNTS_SLUG,
        tCat('discounts'),
      );
      groups.push({
        parent,
        sections: [{ category: parent, products: promoProducts }],
        totalCount: promoProducts.length,
      });
    }

    const popularProducts = products.filter((p) => p.isRecommended);
    if (popularProducts.length > 0) {
      const parent = makeVirtualParent(
        VIRTUAL_POPULAR_ID,
        VIRTUAL_POPULAR_SLUG,
        tCat('popular'),
      );
      groups.push({
        parent,
        sections: [{ category: parent, products: popularProducts }],
        totalCount: popularProducts.length,
      });
    }

    return groups;
  }, [products, promotions, tCat]);

  const allParentGroups = useMemo(
    () => [...virtualGroups, ...parentGroups],
    [virtualGroups, parentGroups],
  );

  const initialActiveSlug = useMemo(() => {
    const direct = allParentGroups.find((g) => g.parent.slug === initialSlug);
    if (direct) return direct.parent.slug;
    if (initialChildSlug) {
      const owner = allParentGroups.find((g) =>
        g.sections.some((s) => s.category.slug === initialChildSlug),
      );
      if (owner) return owner.parent.slug;
    }
    return allParentGroups[0]?.parent.slug ?? '';
  }, [allParentGroups, initialSlug, initialChildSlug]);

  const [activeSlug, setActiveSlug] = useState(initialActiveSlug);

  // Если состав групп изменился (например, promotions подгрузились асинхронно
  // и появилась/исчезла виртуальная группа "Со скидкой"), и текущий activeSlug
  // больше не существует — выравниваем на актуальный initialActiveSlug.
  useEffect(() => {
    const stillExists = allParentGroups.some(
      (g) => g.parent.slug === activeSlug,
    );
    if (!stillExists && initialActiveSlug) {
      setActiveSlug(initialActiveSlug);
    }
  }, [allParentGroups, activeSlug, initialActiveSlug]);

  useEffect(() => {
    const group = allParentGroups.find((g) => g.parent.slug === activeSlug);
    if (group) setHeaderTitleOverride(group.parent.categoryName);
    return () => setHeaderTitleOverride(null);
  }, [activeSlug, allParentGroups, setHeaderTitleOverride]);

  // Initial scroll: к подкатегории либо из path-slug (legacy ссылки),
  // либо из hash вида #subcat-{slug} (новые ссылки с страницы категорий).
  useEffect(() => {
    const hash = window.location.hash;
    const fromHash = hash.startsWith('#subcat-')
      ? decodeURIComponent(hash.slice('#subcat-'.length))
      : null;
    const target = initialChildSlug ?? fromHash;
    const el = target
      ? document.getElementById(`subcat-${target}`)
      : initialSlug
        ? document.getElementById(`${PARENT_ID_PREFIX}${initialSlug}`)
        : null;
    if (!el) return;
    isProgrammaticScrollRef.current = true;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 300);
    });
    // run once after first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-spy: highlight the parent whose top edge crosses the band just
  // below the sticky header+tabs.
  useEffect(() => {
    if (allParentGroups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        const slug = topmost.target.getAttribute('data-parent-slug');
        if (slug) setActiveSlug(slug);
      },
      {
        rootMargin: '-130px 0px -60% 0px',
        threshold: 0,
      },
    );

    allParentGroups.forEach((g) => {
      const el = document.getElementById(`${PARENT_ID_PREFIX}${g.parent.slug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [allParentGroups]);

  const handleTabClick = useCallback(
    (idx: number) => {
      const group = allParentGroups[idx];
      if (!group) return;
      const el = document.getElementById(
        `${PARENT_ID_PREFIX}${group.parent.slug}`,
      );
      if (!el) return;

      isProgrammaticScrollRef.current = true;
      setActiveSlug(group.parent.slug);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Виртуальные группы (id < 0) не должны попадать в URL — их слаги
      // синтетические и не резолвятся бэкендом/маршрутом.
      if (group.parent.id >= 0) {
        window.history.replaceState(
          null,
          '',
          `/${venueSlug}/products/${group.parent.slug}`,
        );
      }
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
    },
    [allParentGroups, venueSlug],
  );

  if (allParentGroups.length === 0) return null;

  const tabCategories = allParentGroups.map((g) => g.parent);
  const tabCounts = allParentGroups.map((g) => g.totalCount);

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 pb-40 border-t border-gray-100'>
      <div className='sticky top-18 z-30 bg-white shadow-sm'>
        <div className='pt-2'>
          <Category
            categories={tabCategories}
            counts={tabCounts}
            activeSlug={activeSlug}
            onSelect={handleTabClick}
          />
        </div>
      </div>

      <div className='flex flex-col gap-10 pt-4'>
        {allParentGroups.map((group) => (
          <div
            key={group.parent.id}
            id={`${PARENT_ID_PREFIX}${group.parent.slug}`}
            data-parent-slug={group.parent.slug}
            className='scroll-mt-36'
          >
            <div className='flex flex-col gap-8'>
              {group.sections.map((section) => {
                const isVirtual = group.parent.id < 0;
                const showHeader =
                  isVirtual ||
                  group.sections.length > 1 ||
                  section.category.id !== group.parent.id;

                return (
                  <section
                    key={section.category.id}
                    id={`subcat-${section.category.slug}`}
                    className='scroll-mt-36'
                  >
                    {showHeader && (
                      <h2 className='text-xl font-bold text-[#21201F] mb-3 px-2.5'>
                        {section.category.categoryName}
                      </h2>
                    )}
                    <Goods products={section.products} />
                  </section>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
