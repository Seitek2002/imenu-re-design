'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useTranslations } from 'next-intl';

import Goods from './Goods';
import Category from './Category';
import { Product, Category as CategoryType } from '@/types/api';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { useCheckout } from '@/store/checkout';

// Виртуальные группы — синтетические "категории" с отрицательным id, чтобы
// не пересекаться с реальными. Слаги никогда не попадают в URL.
const VIRTUAL_POPULAR_ID = -1;
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
  const setHeaderCollapsed = useUIStore((s) => s.setHeaderCollapsed);
  const isHeaderCollapsed = useUIStore((s) => s.isHeaderCollapsed);

  const mounted = useMounted();
  const tableNumber = useVenueStore((s) => s.tableNumber);
  const userSelectedType = useCheckout((s) => s.userSelectedType);
  const isDelivery = mounted && !tableNumber && userSelectedType === 'delivery';

  const visibleProducts = useMemo(
    () =>
      isDelivery
        ? products.filter((p) => p.available_for_delivery !== false)
        : products,
    [products, isDelivery],
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  const tCat = useTranslations('Categories');
  const isProgrammaticScrollRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { parentGroups, initialChildSlug } = useMemo(() => {
    const groups: ParentGroup[] = [];

    for (const parent of categories) {
      const children = parent.children ?? [];
      const childIdSet = new Set(children.map((c) => c.id));
      const sections: ParentGroup['sections'] = [];

      const parentOnlyProducts = visibleProducts.filter((p) => {
        const inParent = p.categories?.some((c) => c.id === parent.id);
        if (!inParent) return false;
        return !p.categories?.some((c) => childIdSet.has(c.id));
      });

      if (children.length === 0) {
        const all = visibleProducts.filter((p) =>
          p.categories?.some((c) => c.id === parent.id),
        );
        if (all.length > 0) sections.push({ category: parent, products: all });
      } else {
        if (parentOnlyProducts.length > 0) {
          sections.push({ category: parent, products: parentOnlyProducts });
        }
        for (const child of children) {
          const childProducts = visibleProducts.filter((p) =>
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
  }, [visibleProducts, categories, initialSlug]);

  // Виртуальная группа «Хиты» (isRecommended). Появляется автоматически,
  // если есть подходящие товары.
  const virtualGroups = useMemo(() => {
    const groups: ParentGroup[] = [];

    const popularProducts = visibleProducts.filter((p) => p.isRecommended);
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
  }, [visibleProducts, tCat]);

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
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Если состав групп изменился и текущий activeSlug больше не существует —
  // выравниваем на актуальный initialActiveSlug.
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

  // Collapse-on-scroll: когда сентинель уходит за верхнюю границу — сворачиваем
  // хэдер, навбар подтягивается к самому верху и визуально занимает его место.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderCollapsed(!entry.isIntersecting),
      { rootMargin: '0px', threshold: 0 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setHeaderCollapsed(false);
    };
  }, [setHeaderCollapsed]);

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

  // Scroll-spy: активна та группа, чей верхний край последним пересёк
  // линию ниже sticky-навбара. Offset-based — надёжнее IntersectionObserver
  // для коротких групп (первая «Хиты» легко выпадала из узкой band-полосы).
  useEffect(() => {
    if (allParentGroups.length === 0) return;
    const OFFSET = 140;
    const update = () => {
      if (isProgrammaticScrollRef.current) return;
      let best = allParentGroups[0].parent.slug;
      for (const g of allParentGroups) {
        const el = document.getElementById(
          `${PARENT_ID_PREFIX}${g.parent.slug}`,
        );
        if (!el) continue;
        if (el.getBoundingClientRect().top - OFFSET <= 0) {
          best = g.parent.slug;
        } else {
          break;
        }
      }
      setActiveSlug(best);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [allParentGroups]);

  // Scroll-spy второго уровня — отслеживаем активную подсекцию по всем
  // группам сразу. Используется для подсветки чипа в sub-tabs.
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
        const slug = topmost.target.getAttribute('data-subcat-slug');
        if (slug) setActiveSubSlug(slug);
      },
      { rootMargin: '-180px 0px -60% 0px', threshold: 0 },
    );

    allParentGroups.forEach((g) =>
      g.sections.forEach((s) => {
        const el = document.getElementById(`subcat-${s.category.slug}`);
        if (el) observer.observe(el);
      }),
    );

    return () => observer.disconnect();
  }, [allParentGroups]);

  // Прогресс скролла по всему меню — тонкая полоска под навбаром.
  useEffect(() => {
    const STICKY_OFFSET = 130;
    const update = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const traveled = Math.max(0, STICKY_OFFSET - rect.top);
      const total = Math.max(
        1,
        el.offsetHeight - (window.innerHeight - STICKY_OFFSET),
      );
      setProgress(Math.min(1, traveled / total));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [allParentGroups]);

  const handleSubClick = useCallback((slug: string) => {
    const el = document.getElementById(`subcat-${slug}`);
    if (!el) return;
    isProgrammaticScrollRef.current = true;
    setActiveSubSlug(slug);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 700);
  }, []);

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
  const activeGroup = allParentGroups.find((g) => g.parent.slug === activeSlug);
  const subSections =
    activeGroup && activeGroup.sections.length > 1 ? activeGroup.sections : [];

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 pb-40 border-t border-gray-100'>
      <div ref={sentinelRef} className='h-1 -mt-1' aria-hidden />
      <div
        className={`
          sticky z-30 bg-white/95 backdrop-blur-sm shadow-sm transition-[top] duration-300
          ${isHeaderCollapsed ? 'top-12' : 'top-18'}
        `}
      >
        <div className='pt-2'>
          <Category
            categories={tabCategories}
            counts={tabCounts}
            activeSlug={activeSlug}
            onSelect={handleTabClick}
          />
        </div>

        {subSections.length > 0 && (
          <div className='flex gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar'>
            {subSections.map((s) => {
              const isActive = activeSubSlug === s.category.slug;
              return (
                <button
                  key={s.category.id}
                  onClick={() => handleSubClick(s.category.slug)}
                  className={`
                    shrink-0 px-3 py-1 rounded-full text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-[#21201F]/10 text-[#21201F] font-semibold'
                        : 'text-[#9A9A9A] hover:text-[#5C5C5C]'
                    }
                  `}
                >
                  {s.category.categoryName}
                </button>
              );
            })}
          </div>
        )}

        <div className='h-0.5 bg-gray-100'>
          <div
            className='h-full bg-[#21201F] transition-[width] duration-150'
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div ref={contentRef} className='flex flex-col gap-10 pt-4'>
        {allParentGroups.map((group) => (
          <div
            key={group.parent.id}
            id={`${PARENT_ID_PREFIX}${group.parent.slug}`}
            data-parent-slug={group.parent.slug}
            className='scroll-mt-44'
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
                    data-subcat-slug={section.category.slug}
                    className='scroll-mt-44'
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
