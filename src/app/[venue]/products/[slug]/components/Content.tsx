'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
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

// Подсекция верхнего уровня (под h2). Может содержать собственные узлы 3-го
// уровня (h3) — для SIERRA «Холодные напитки → Вино → Красное/Белое/Розе».
type SubSection = {
  category: CategoryType;
  products: Product[];
  // Внуки рендерятся как h3 inline. Если есть — products содержит товары,
  // привязанные напрямую к самому child (редкий случай), внуковые товары —
  // в subSubSections.
  subSubSections?: { category: CategoryType; products: Product[] }[];
};

type ParentGroup = {
  parent: CategoryType;
  sections: SubSection[];
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
  const stickyBarRef = useRef<HTMLDivElement>(null);

  // Программный скролл всегда уезжает вниз, sentinel уходит из viewport →
  // Header коллапсит на min-h-12 (48px), sticky-таббар садится на top-12 (48px).
  // Считаем offset от collapsed-состояния: 48 (top-12) + реальная высота бара
  // (меняется когда у активной группы появляются sub-tabs) + 4px воздуха.
  // scrollIntoView со статическим scroll-mt-44 (176px) промахивался на 60+px,
  // оставляя сверху карточки предыдущей секции.
  const scrollToElement = useCallback(
    (el: HTMLElement, behavior: ScrollBehavior) => {
      const barH = stickyBarRef.current
        ? stickyBarRef.current.getBoundingClientRect().height
        : 0;
      const offset = 48 + barH + 4;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior });
    },
    [],
  );

  const { parentGroups, initialChildSlug } = useMemo(() => {
    // Товары узла, не попавшие ни в один из его потомков. Для листа — все
    // товары узла. Используется и для прямых детей (parentOnly), и для
    // grand-узлов (внуки сами могут иметь правнуков, но мы их сейчас не
    // отдельно показываем, складываем в продукты узла-уровня-3).
    const directProducts = (node: CategoryType): Product[] => {
      const childIds = new Set((node.children ?? []).map((c) => c.id));
      return visibleProducts.filter((p) => {
        const inNode = p.categories?.some((c) => c.id === node.id);
        if (!inNode) return false;
        if (childIds.size === 0) return true;
        return !p.categories?.some((c) => childIds.has(c.id));
      });
    };

    // Все товары поддерева (включая узел и потомков любой глубины) — нужно
    // для подсчёта totalCount у родителя.
    const subtreeProductCount = (node: CategoryType): number => {
      let count = directProducts(node).length;
      for (const ch of node.children ?? []) count += subtreeProductCount(ch);
      return count;
    };

    const buildSubSection = (child: CategoryType): SubSection | null => {
      const grandKids = child.children ?? [];
      const ownProducts = directProducts(child);

      if (grandKids.length === 0) {
        return ownProducts.length > 0
          ? { category: child, products: ownProducts }
          : null;
      }

      const subSubSections: NonNullable<SubSection['subSubSections']> = [];
      for (const gk of grandKids) {
        // Правнуки складываем в продукты внука — глубже h3 в UI не идём.
        let products = directProducts(gk);
        for (const ggk of gk.children ?? []) {
          products = products.concat(directProducts(ggk));
        }
        if (products.length > 0) subSubSections.push({ category: gk, products });
      }

      if (ownProducts.length === 0 && subSubSections.length === 0) return null;

      return { category: child, products: ownProducts, subSubSections };
    };

    const groups: ParentGroup[] = [];

    for (const parent of categories) {
      const children = parent.children ?? [];
      const sections: SubSection[] = [];

      if (children.length === 0) {
        const all = visibleProducts.filter((p) =>
          p.categories?.some((c) => c.id === parent.id),
        );
        if (all.length > 0) sections.push({ category: parent, products: all });
      } else {
        const parentOnly = directProducts(parent);
        if (parentOnly.length > 0) {
          sections.push({ category: parent, products: parentOnly });
        }
        for (const child of children) {
          const sub = buildSubSection(child);
          if (sub) sections.push(sub);
        }
      }

      if (sections.length > 0) {
        groups.push({
          parent,
          sections,
          totalCount: subtreeProductCount(parent),
        });
      }
    }

    let childSlug: string | null = null;
    outer: for (const g of groups) {
      for (const s of g.sections) {
        if (s.category.slug === initialSlug && s.category.id !== g.parent.id) {
          childSlug = initialSlug;
          break outer;
        }
        for (const ss of s.subSubSections ?? []) {
          if (ss.category.slug === initialSlug) {
            childSlug = initialSlug;
            break outer;
          }
        }
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
  // VirtualFoodItem отдаёт 0-высоту для незамеренных карточек ниже первого
  // экрана, поэтому первый scrollIntoView попадает в «короткую» вёрстку — а
  // потом группы выше цели догоняют реальную высоту и таргет уплывает вниз.
  // Лечится перескроллом, пока ResizeObserver видит рост контейнера.
  useEffect(() => {
    const hash = window.location.hash;
    const fromHash = hash.startsWith('#subcat-')
      ? decodeURIComponent(hash.slice('#subcat-'.length))
      : null;
    const subcat = initialChildSlug ?? fromHash;
    const parentSlug = !subcat && initialSlug ? initialSlug : null;
    if (!subcat && !parentSlug) return;

    const getTarget = () =>
      subcat
        ? document.getElementById(`subcat-${subcat}`)
        : document.getElementById(`${PARENT_ID_PREFIX}${parentSlug}`);

    if (!getTarget()) return;

    isProgrammaticScrollRef.current = true;

    const scrollToTarget = () => {
      const el = getTarget();
      if (el) scrollToElement(el, 'instant');
    };

    requestAnimationFrame(scrollToTarget);

    const root = contentRef.current;
    let pending = false;
    const ro = root
      ? new ResizeObserver(() => {
          if (pending) return;
          pending = true;
          requestAnimationFrame(() => {
            pending = false;
            scrollToTarget();
          });
        })
      : null;
    if (root && ro) ro.observe(root);

    const release = window.setTimeout(() => {
      ro?.disconnect();
      isProgrammaticScrollRef.current = false;
    }, 1500);

    return () => {
      window.clearTimeout(release);
      ro?.disconnect();
      isProgrammaticScrollRef.current = false;
    };
    // run once after first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-spy: активна та группа, чей верхний край последним пересёк
  // линию ниже sticky-навбара. Offset-based — надёжнее IntersectionObserver
  // для коротких групп (первая «Хиты» легко выпадала из узкой band-полосы).
  //
  // Порог = реальный нижний край sticky-бара, а НЕ константа. Видимость ряда
  // под-вкладок зависит от активной группы (у группы с >1 секцией он есть, у
  // плоской — нет), поэтому высота бара меняется при смене активной группы.
  // Бар стоит в потоке перед контентом → его рост сдвигает el.top секций на ту
  // же величину. С фиксированным порогом это давало петлю: смена активной →
  // под-вкладки появлялись/исчезали → контент сдвигался → порог пересекался
  // обратно → активная снова менялась (таб «сам переключался» на границе двух
  // категорий). Меряя от живого bar.bottom, сдвигаем линию синхронно с el.top —
  // обратная связь по высоте бара взаимоуничтожается.
  useEffect(() => {
    if (allParentGroups.length === 0) return;
    // Допуск должен покрывать воздушный зазор, с которым scrollToElement сажает
    // цель (offset = 48 + barH + 4 → цель оказывается ~4px НИЖЕ линии bar.bottom).
    // Без этого клик по первой под-секции группы (её верх ≈ верх родителя)
    // приземлял родителя на line+4, spy считал его «не доехавшим» и через ~700мс
    // (после снятия programmatic-guard) перекидывал активную на предыдущего
    // родителя — «открывалась предыдущая категория».
    const TOLERANCE = 12;
    const update = () => {
      if (isProgrammaticScrollRef.current) return;
      const bar = stickyBarRef.current;
      const line = bar ? bar.getBoundingClientRect().bottom : 140;
      let best = allParentGroups[0].parent.slug;
      for (const g of allParentGroups) {
        const el = document.getElementById(
          `${PARENT_ID_PREFIX}${g.parent.slug}`,
        );
        if (!el) continue;
        if (el.getBoundingClientRect().top - line <= TOLERANCE) {
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

  const handleSubClick = useCallback(
    (slug: string) => {
      if (!document.getElementById(`subcat-${slug}`)) return;
      const owner = allParentGroups.find((g) =>
        g.sections.some(
          (s) =>
            s.category.slug === slug ||
            (s.subSubSections?.some((ss) => ss.category.slug === slug) ??
              false),
        ),
      );
      isProgrammaticScrollRef.current = true;
      // flushSync: активный родитель должен закоммититься ДО измерения высоты
      // бара в scrollToElement (иначе offset считается под старую группу).
      // Заодно пинним родителя явно — не отдаём его на откуп scroll-spy, который
      // на границе мог увести активную на предыдущую категорию.
      flushSync(() => {
        if (owner) setActiveSlug(owner.parent.slug);
        setActiveSubSlug(slug);
      });
      const el = document.getElementById(`subcat-${slug}`);
      if (el) scrollToElement(el, 'smooth');
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
    },
    [allParentGroups, scrollToElement],
  );

  const handleTabClick = useCallback(
    (idx: number) => {
      const group = allParentGroups[idx];
      if (!group) return;

      isProgrammaticScrollRef.current = true;
      // flushSync: sub-tabs (видимость зависит от activeSlug) должны
      // закоммититься ДО измерения высоты sticky-бара в scrollToElement,
      // иначе offset считается под старую группу и таргет уезжает.
      flushSync(() => {
        setActiveSlug(group.parent.slug);
        // Bug 4 fix: подкатегория для прошлой вкладки больше не валидна —
        // подсвечиваем первую подкатегорию новой группы (или null если
        // у группы нет подсекций).
        const firstSub = group.sections.find(
          (s) => s.category.id !== group.parent.id,
        );
        setActiveSubSlug(firstSub ? firstSub.category.slug : null);
      });

      const getTarget = () =>
        document.getElementById(`${PARENT_ID_PREFIX}${group.parent.slug}`);
      const scrollToTarget = () => {
        const el = getTarget();
        if (el) scrollToElement(el, 'smooth');
      };

      scrollToTarget();

      // Bug 1 fix: VirtualFoodItem стабилизирует высоты только после первого
      // прохода скролла — таргет уплывает. Пока контейнер выше растёт,
      // переcкроливаем (instant, чтобы не было «прыжков» в анимации smooth).
      const root = contentRef.current;
      let pending = false;
      const ro = root
        ? new ResizeObserver(() => {
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
              pending = false;
              const el = getTarget();
              if (el) scrollToElement(el, 'instant');
            });
          })
        : null;
      if (root && ro) ro.observe(root);

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
        ro?.disconnect();
        isProgrammaticScrollRef.current = false;
      }, 1200);
    },
    [allParentGroups, venueSlug, scrollToElement],
  );

  if (allParentGroups.length === 0) return null;

  const tabCategories = allParentGroups.map((g) => g.parent);
  const tabCounts = allParentGroups.map((g) => g.totalCount);
  const activeGroup = allParentGroups.find((g) => g.parent.slug === activeSlug);
  const subSections =
    activeGroup && activeGroup.sections.length > 1 ? activeGroup.sections : [];
  // Кейс «зашли на промежуточный узел» (/products/vino): top-tab был бы один
  // и потому бесполезный — sub-chips детей и так покрывают навигацию.
  const showTopTabs = allParentGroups.length > 1;

  return (
    <div className='bg-white rounded-t-4xl mt-1.5 pb-40 border-t border-gray-100'>
      <div ref={sentinelRef} className='h-1 -mt-1' aria-hidden />
      <div
        ref={stickyBarRef}
        className={`
          sticky z-30 bg-white/95 backdrop-blur-sm shadow-sm transition-[top] duration-300
          ${isHeaderCollapsed ? 'top-12' : 'top-18'}
        `}
      >
        {showTopTabs && (
          <div className='pt-2'>
            <Category
              categories={tabCategories}
              counts={tabCounts}
              activeSlug={activeSlug}
              onSelect={handleTabClick}
            />
          </div>
        )}

        {subSections.length > 0 && (
          <div
            className={`flex gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar ${
              showTopTabs ? '' : 'pt-2'
            }`}
          >
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
                const hasSubSub = (section.subSubSections?.length ?? 0) > 0;

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
                    {section.products.length > 0 && (
                      <Goods products={section.products} />
                    )}
                    {hasSubSub && (
                      <div className='flex flex-col gap-6 mt-2'>
                        {section.subSubSections!.map((ss) => (
                          <section
                            key={ss.category.id}
                            id={`subcat-${ss.category.slug}`}
                            data-subcat-slug={ss.category.slug}
                            className='scroll-mt-44'
                          >
                            <h3 className='text-base font-semibold text-[#5C5C5C] mb-2 px-2.5'>
                              {ss.category.categoryName}
                            </h3>
                            <Goods products={ss.products} />
                          </section>
                        ))}
                      </div>
                    )}
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
