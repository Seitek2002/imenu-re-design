'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useSearchParams, usePathname, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import {
  GroupModification,
  Modificator,
  Product,
} from '@/types/api';
import { useProductStore } from '@/store/product';
import {
  useBasketStore,
  BasketGroupSelection,
} from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import { useMounted } from '@/hooks/useMounted';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';
import { useVenueProducts, usePromotionsV2 } from '@/lib/api/queries';
import { findActivePromotionForProduct } from '@/lib/promotions';

import plusIcon from '@/assets/Goods/plus.svg';
import minusIcon from '@/assets/Goods/minus.svg';

type CountsState = Record<number, number>;

function sumGroupCount(group: GroupModification, counts: CountsState): number {
  return group.items.reduce((s, i) => s + (counts[i.id] ?? 0), 0);
}

function buildGroupSelections(
  product: Product,
  counts: CountsState,
): BasketGroupSelection[] {
  const groups = product.groupModifications ?? [];
  return groups
    .map((g) => ({
      groupId: g.id,
      groupName: g.name,
      items: g.items
        .filter((i) => (counts[i.id] ?? 0) > 0)
        .map((i) => ({
          id: i.id,
          name: i.name,
          count: counts[i.id],
          price: i.price,
        })),
    }))
    .filter((g) => g.items.length > 0);
}

function emojiForGroup(name: string): string {
  const n = name.toLowerCase();
  if (/молок|milk|сүт/.test(n)) return '🥛';
  if (/сахар|sugar|шекер/.test(n)) return '🍬';
  if (/сироп|syrup/.test(n)) return '🍯';
  if (/лёд|лед|ice|муз/.test(n)) return '🧊';
  if (/сливк|cream|каймак/.test(n)) return '🫧';
  if (/соус|sauce/.test(n)) return '🫙';
  if (/топпинг|topping/.test(n)) return '✨';
  if (/темп|temperature/.test(n)) return '🌡️';
  if (/размер|size|өлч/.test(n)) return '📐';
  if (/хлеб|bread|нан/.test(n)) return '🍞';
  if (/сыр|cheese|быш/.test(n)) return '🧀';
  if (/мясо|meat|эт/.test(n)) return '🥩';
  if (/специ|spice/.test(n)) return '🌶️';
  if (/добавк|extra|кошумча/.test(n)) return '➕';
  if (/напит|drink/.test(n)) return '🥤';
  if (/десерт|dessert/.test(n)) return '🍮';
  return '🍽️';
}

const CARD_COLORS = [
  { bg: 'bg-orange-50', shadow: 'shadow-orange-100', iconBg: 'bg-orange-100' },
  { bg: 'bg-sky-50',    shadow: 'shadow-sky-100',    iconBg: 'bg-sky-100' },
  { bg: 'bg-violet-50', shadow: 'shadow-violet-100', iconBg: 'bg-violet-100' },
  { bg: 'bg-emerald-50',shadow: 'shadow-emerald-100',iconBg: 'bg-emerald-100' },
  { bg: 'bg-rose-50',   shadow: 'shadow-rose-100',   iconBg: 'bg-rose-100' },
  { bg: 'bg-amber-50',  shadow: 'shadow-amber-100',  iconBg: 'bg-amber-100' },
];

const GroupsGrid = ({
  groups,
  counts,
  onChange,
  errors,
  absolutePricing,
}: {
  groups: GroupModification[];
  counts: CountsState;
  onChange: (next: CountsState) => void;
  errors: Record<number, string>;
  absolutePricing: boolean;
}) => {
  const required = groups.filter((g) => g.selection.min > 0);
  const optional = groups.filter((g) => g.selection.min === 0);

  const [expandedId, setExpandedId] = useState<number | null>(
    () => optional[0]?.id ?? null,
  );

  const expandedGroup = optional.find((g) => g.id === expandedId) ?? null;

  return (
    <div className='flex flex-col gap-5'>
      {required.map((g) => (
        <GroupSection
          key={g.id}
          group={g}
          counts={counts}
          onChange={onChange}
          error={errors[g.id] ?? null}
          absolutePricing={absolutePricing}
        />
      ))}

      {optional.length > 0 && (
        <div className='flex flex-col gap-3'>
          <div className='flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none'>
            {optional.map((g, idx) => {
              const sum = sumGroupCount(g, counts);
              const hasSelection = sum > 0;
              const isExpanded = expandedId === g.id;
              const hasError = !!errors[g.id];
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const emoji = emojiForGroup(g.name);

              const chipLabel = (() => {
                if (!hasSelection) return g.name;
                if (g.selection.type === 'single') {
                  const selected = g.items.find((i) => (counts[i.id] ?? 0) > 0);
                  return selected?.name ?? g.name;
                }
                return `${g.name} ×${sum}`;
              })();

              return (
                <button
                  key={g.id}
                  type='button'
                  onClick={() => setExpandedId((prev) => (prev === g.id ? null : g.id))}
                  className={`flex flex-col items-center justify-between pt-3 pb-2.5 px-2 w-[84px] h-[84px] rounded-2xl shrink-0 active:scale-95 transition-all shadow-sm ${
                    isExpanded
                      ? 'bg-[#21201F] shadow-[#21201F]/20'
                      : hasError
                        ? 'bg-red-50 shadow-red-100'
                        : `${color.bg} ${color.shadow}`
                  }`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xl ${
                    isExpanded ? 'bg-white/15' : hasError ? 'bg-red-100' : color.iconBg
                  }`}>
                    {hasSelection && !isExpanded ? (
                      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#21201F' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    ) : isExpanded ? (
                      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <line x1='5' y1='12' x2='19' y2='12' />
                      </svg>
                    ) : (
                      <span className='leading-none'>{emoji}</span>
                    )}
                  </span>
                  <span className={`text-[10px] font-semibold text-center leading-tight w-full line-clamp-2 ${
                    isExpanded ? 'text-white' : hasError ? 'text-red-500' : 'text-[#21201F]/75'
                  }`}>
                    {chipLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {expandedGroup && (
            <div className='rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4'>
              <GroupSection
                group={expandedGroup}
                counts={counts}
                onChange={onChange}
                error={errors[expandedGroup.id] ?? null}
                absolutePricing={absolutePricing}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GroupSection = ({
  group,
  counts,
  onChange,
  error,
  absolutePricing = false,
}: {
  group: GroupModification;
  counts: CountsState;
  onChange: (next: CountsState) => void;
  error: string | null;
  /** When true, single-select required group items show as variant prices ("140 c.") instead of deltas ("+140 c.") */
  absolutePricing?: boolean;
}) => {
  const t = useTranslations('Product');
  const tc = useTranslations('Common');
  const { type, min, max } = group.selection;
  const sum = sumGroupCount(group, counts);
  const showAbsolute = absolutePricing && type === 'single' && min > 0;

  const COLLAPSE_THRESHOLD = 3;
  const collapsible =
    type === 'multiple' && group.items.length > COLLAPSE_THRESHOLD;
  const hiddenSelectedCount = collapsible
    ? group.items
        .slice(COLLAPSE_THRESHOLD)
        .reduce((s, i) => s + (counts[i.id] ?? 0), 0)
    : 0;
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded || hiddenSelectedCount > 0;
  const visibleItems =
    collapsible && !isExpanded
      ? group.items.slice(0, COLLAPSE_THRESHOLD)
      : group.items;
  const hiddenCount = group.items.length - COLLAPSE_THRESHOLD;

  const badge =
    min === max
      ? t('exactly', { n: min })
      : min > 0
        ? t('requiredUpTo', { n: max })
        : t('upTo', { n: max });

  const handleSingle = (itemId: number) => {
    const current = counts[itemId] ?? 0;
    const next: CountsState = { ...counts };
    for (const it of group.items) next[it.id] = 0;
    // При min=0 повторный тап снимает выбор
    if (current > 0 && min === 0) {
      next[itemId] = 0;
    } else {
      next[itemId] = 1;
    }
    onChange(next);
  };

  const handleStep = (itemId: number, delta: number) => {
    const current = counts[itemId] ?? 0;
    const nextVal = Math.max(0, current + delta);
    if (delta > 0 && sum >= max) return; // достигнут max по группе
    onChange({ ...counts, [itemId]: nextVal });
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-2'>
        <div className='flex flex-col'>
          <span className='font-semibold'>{group.name}</span>
          <span className='text-xs text-gray-400'>
            {max > 0 ? t('chosenOf', { current: sum, max }) : t('chosen', { current: sum })}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            min > 0
              ? 'text-green-500 bg-green-50'
              : 'text-blue-500 bg-blue-50'
          }`}
        >
          {badge}
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {visibleItems.map((item) => {
          const count = counts[item.id] ?? 0;
          const selected = count > 0;
          const priceNum = Number(item.price);

          if (type === 'single') {
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => handleSingle(item.id)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                  selected
                    ? 'border-[#21201F] bg-[#21201F] text-white'
                    : 'border-gray-100 bg-gray-50 text-gray-800'
                }`}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-medium truncate'>{item.name}</span>
                    {Number(item.brutto) > 0 && (
                      <span
                        className={`text-xs ${selected ? 'text-gray-300' : 'text-gray-400'}`}
                      >
                        {Math.round(Number(item.brutto))} {tc('weightUnit')}
                      </span>
                    )}
                  </div>
                </div>
                <span className='text-sm font-semibold shrink-0'>
                  {priceNum > 0
                    ? showAbsolute
                      ? `${priceNum} ${tc('currency')}`
                      : t('pricePlus', { price: priceNum })
                    : t('included')}
                </span>
              </button>
            );
          }

          // multiple
          const canInc = sum < max;
          return (
            <div
              key={item.id}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border ${
                selected
                  ? 'border-[#21201F] bg-gray-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className='flex items-center gap-3 min-w-0'>
                <div className='flex flex-col min-w-0'>
                  <span className='font-medium truncate text-gray-800'>
                    {item.name}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {Number(item.brutto) > 0
                      ? `${Math.round(Number(item.brutto))} ${tc('weightUnit')} · `
                      : ''}
                    {priceNum > 0 ? t('pricePlus', { price: priceNum }) : t('free')}
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => handleStep(item.id, -1)}
                  disabled={count === 0}
                  className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30'
                  aria-label='minus'
                >
                  <Image src={minusIcon} alt='' width={14} height={14} />
                </button>
                <span className='w-5 text-center font-semibold text-sm'>
                  {count}
                </span>
                <button
                  type='button'
                  onClick={() => handleStep(item.id, +1)}
                  disabled={!canInc}
                  className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30'
                  aria-label='plus'
                >
                  <Image src={plusIcon} alt='' width={14} height={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {collapsible && hiddenSelectedCount === 0 && (
        <div className='flex justify-center mt-3'>
          <button
            type='button'
            onClick={() => setExpanded((v) => !v)}
            className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 active:scale-95 transition-transform hover:bg-gray-100'
          >
            <span>
              {expanded ? t('showLess') : t('showMore', { n: hiddenCount })}
            </span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <polyline points='6 9 12 15 18 9' />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p className='text-xs text-red-500 mt-2'>{error}</p>
      )}
    </div>
  );
};

const ProductContent = ({
  product,
  onClose,
  scrollProps,
}: {
  product: Product;
  onClose: () => void;
  scrollProps?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const addToBasket = useBasketStore((s) => s.addToBasket);
  const t = useTranslations('Product');
  const tc = useTranslations('Common');

  const venueSlug = useVenueStore((s) => s.data?.slug ?? null);
  const spotId = useVenueStore((s) => s.spotId);
  const { data: promotions } = usePromotionsV2(venueSlug, spotId);
  const promo = findActivePromotionForProduct(product, promotions);

  const groups = useMemo(() => {
    const list = product.groupModifications ?? [];
    const isSize = (name: string) => /разм|size|өлч/i.test(name);
    return [...list].sort((a, b) => {
      const aSize = isSize(a.name) ? 0 : 1;
      const bSize = isSize(b.name) ? 0 : 1;
      if (aSize !== bSize) return aSize - bSize;
      const aReq = a.selection.min > 0 ? 0 : 1;
      const bReq = b.selection.min > 0 ? 0 : 1;
      return aReq - bReq;
    });
  }, [product.groupModifications]);
  const hasGroups = groups.length > 0;
  // Правило: если есть groupModifications, плоские modificators игнорируем.
  const flatMods: Modificator[] = hasGroups ? [] : product.modificators ?? [];

  const [qnty, setQnty] = useState(1);
  const [counts, setCounts] = useState<CountsState>(() => {
    // Pre-select the cheapest item in each required single-select group,
    // so the header price never starts at 0 for variant-style products.
    const init: CountsState = {};
    for (const g of groups) {
      if (
        g.selection.type === 'single' &&
        g.selection.min > 0 &&
        g.items.length > 0
      ) {
        const cheapest = g.items.reduce((a, b) =>
          Number(a.price) <= Number(b.price) ? a : b,
        );
        init[cheapest.id] = 1;
      }
    }
    return init;
  });
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(
    flatMods.length > 0 ? flatMods[0].id : null,
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  const selectedFlat = flatMods.find((m) => m.id === selectedFlatId) ?? null;

  const errors = useMemo(() => {
    const out: Record<number, string> = {};
    for (const g of groups) {
      const sum = sumGroupCount(g, counts);
      if (sum < g.selection.min) {
        out[g.id] =
          g.selection.min === g.selection.max
            ? t('errorChoose', { n: g.selection.min })
            : t('errorMin', { n: g.selection.min });
      } else if (sum > g.selection.max) {
        out[g.id] = t('errorMax', { n: g.selection.max });
      }
    }
    return out;
  }, [groups, counts, t]);

  const isValid = Object.keys(errors).length === 0;

  const unitPrice = useMemo(() => {
    const base = selectedFlat?.price ?? product.productPrice;
    const add = groups.reduce(
      (acc, g) =>
        acc +
        g.items.reduce(
          (s, i) => s + Number(i.price) * (counts[i.id] ?? 0),
          0,
        ),
      0,
    );
    return base + add;
  }, [product, selectedFlat, groups, counts]);

  const totalPrice = unitPrice * qnty;

  const handleAdd = () => {
    if (!isValid) return;
    if (navigator.vibrate) navigator.vibrate(50);
    addToBasket(product, qnty, {
      flatModId: selectedFlat?.id,
      flatModName: selectedFlat?.name,
      flatModPrice: selectedFlat?.price,
      groupSelections: buildGroupSelections(product, counts),
    });
    onClose();
  };

  const weightLabel =
    product.weight > 0
      ? `${product.weight} ${product.unitDisplay || product.measureUnit || ''}`.trim()
      : null;

  return (
    <>
      <div className='flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-20 md:pb-0' {...scrollProps}>
        <div className='md:p-6'>
          <div className='md:grid md:grid-cols-2 md:gap-6 md:items-start'>
            <div className='relative w-full aspect-4/3 md:aspect-square md:rounded-2xl overflow-hidden shrink-0'>
              <Image
                src={product.productPhoto || '/placeholder.svg'}
                alt={product.productName}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  imgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes='(max-width: 768px) 100vw, 500px'
                onLoad={() => setImgLoaded(true)}
              />
            </div>

            <div className='p-5 md:p-0 min-w-0'>
              <h2 className='text-2xl font-bold leading-tight mb-1'>
                {product.productName}
              </h2>
              {unitPrice > 0 && (
                <div className='text-xl font-bold text-[#21201F] mb-2'>
                  {unitPrice} {tc('currency')}
                </div>
              )}
              {promo && (
                <div className='flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 mb-3'>
                  <span className='text-orange-500 text-base leading-none mt-0.5'>🏷</span>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-orange-700 leading-tight'>{promo.name}</p>
                    {promo.description && (
                      <p className='text-xs text-orange-600 mt-0.5 leading-snug'>{promo.description}</p>
                    )}
                  </div>
                </div>
              )}
              {product.productDescription && (
                <p className='text-gray-500 text-sm leading-relaxed'>
                  {product.productDescription}
                </p>
              )}
              {weightLabel && (
                <p className='text-xs text-gray-400 mt-1'>{t('weight', { value: weightLabel })}</p>
              )}
            </div>
          </div>

          <div className='px-5 pb-5 md:px-0 md:pb-0 md:mt-6 flex flex-col gap-5 min-w-0'>
            {flatMods.length > 0 && (
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-semibold'>{t('size')}</span>
                  <span className='text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full'>
                    {t('required')}
                  </span>
                </div>
                <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                  {flatMods.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedFlatId(mod.id)}
                      className={`p-2.5 rounded-xl border text-sm transition-all min-w-0 ${
                        selectedFlatId === mod.id
                          ? 'border-[#21201F] bg-[#21201F] text-white shadow-md'
                          : 'border-gray-100 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className='font-medium truncate'>{mod.name}</div>
                      <div
                        className={`text-xs ${
                          selectedFlatId === mod.id
                            ? 'text-gray-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {mod.price} с.
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasGroups && (
              <GroupsGrid
                groups={groups}
                counts={counts}
                onChange={setCounts}
                errors={errors}
                absolutePricing={product.productPrice === 0}
              />
            )}
          </div>
        </div>
      </div>

      <div className='p-4 border-t border-gray-100 bg-white md:bg-transparent md:border-none'>
        <div className='flex gap-3'>
          <div className='flex items-center gap-4 bg-[#F5F5F5] rounded-2xl px-4 py-3 h-14'>
            <button
              onClick={() => setQnty((q) => Math.max(1, q - 1))}
              className='active:scale-90 transition-transform'
            >
              <Image src={minusIcon} alt='minus' />
            </button>
            <span className='font-bold text-lg w-4 text-center'>{qnty}</span>
            <button
              onClick={() => setQnty((q) => q + 1)}
              className='active:scale-90 transition-transform'
            >
              <Image src={plusIcon} alt='plus' />
            </button>
          </div>

          <button
            disabled={!isValid}
            className='flex-1 min-w-0 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100'
            onClick={handleAdd}
          >
            <span>{t('add')}</span>
            <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
              {totalPrice} с.
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default function ProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = useParams();
  const venueSlug = (params?.venue as string) || null;
  const spotId = useVenueStore((s) => s.spotId);

  const closingRef = useRef(false);
  const productId = searchParams.get('product');

  const locale = useLocale();
  const prevLocaleRef = useRef(locale);
  const productFromStore = useProductStore((s) => s.selectedProduct);
  const setProductInStore = useProductStore((s) => s.setProduct);

  // При смене локали обнуляем стор — чтобы не показывать старые переводы.
  // useVenueProducts перефетчит и активная модалка обновится.
  useEffect(() => {
    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      if (productFromStore) setProductInStore(null);
    }
  }, [locale, productFromStore, setProductInStore]);

  // Грузим продукты всегда, когда модалка открыта — чтобы при смене локали
  // подтягивались актуальные переводы (стор сохраняет старый язык).
  // useVenueProducts включает локаль в queryKey, так что рефетч происходит сам.
  const isOpenByStore = !!productFromStore;
  const isOpenByUrl = !!productId;
  const { data: allProducts } = useVenueProducts(
    isOpenByStore || isOpenByUrl ? venueSlug : null,
    spotId,
  );

  const freshProduct = useMemo(() => {
    if (!allProducts) return null;
    const id = productId ?? (productFromStore ? String(productFromStore.id) : null);
    if (!id) return null;
    return allProducts.find((p) => String(p.id) === id) ?? null;
  }, [allProducts, productId, productFromStore]);

  // Свежие данные с актуальной локалью имеют приоритет над стором.
  const activeProduct = freshProduct ?? productFromStore;

  // Синкаем свежие данные в стор, чтобы при смене языка стор обновлялся.
  // Сравниваем по productName — он меняется при смене локали.
  useEffect(() => {
    if (!freshProduct || closingRef.current) return;
    if (
      !productFromStore ||
      productFromStore.id !== freshProduct.id ||
      productFromStore.productName !== freshProduct.productName
    ) {
      setProductInStore(freshProduct);
    }
  }, [freshProduct, productFromStore, setProductInStore]);

  const isOpen = !!activeProduct;

  const handleClose = useCallback(() => {
    closingRef.current = true;
    setProductInStore(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);

    setTimeout(() => {
      closingRef.current = false;
    }, 100);
  }, [searchParams, pathname, setProductInStore]);

  useEffect(() => {
    if (!mounted) return;
    const bodyStyle = document.body.style;
    if (isOpen) {
      bodyStyle.overflow = 'hidden';
      bodyStyle.touchAction = 'none';
    } else {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    }
    return () => {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    };
  }, [isOpen, mounted]);

  const { dragY, handleProps, contentProps, backdropOpacity, sheetStyle } =
    useSwipeToDismiss(handleClose);

  useEscapeKey(isOpen, handleClose);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex justify-center items-end md:items-center pointer-events-none ${isOpen ? 'active-modal' : ''}`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
          isOpen
            ? 'pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={isOpen ? { opacity: backdropOpacity(0.5) } : undefined}
        onClick={handleClose}
      />

      <div
        className={`
          relative w-full md:w-[75%] md:max-w-2xl bg-white
          rounded-t-4xl md:rounded-4xl
          h-[85vh] md:h-auto md:max-h-[85vh]
          shadow-2xl overflow-hidden flex flex-col
          pointer-events-auto
          ${isOpen ? '' : 'translate-y-full md:translate-y-5 md:opacity-0 transition-transform duration-300'}
        `}
        style={isOpen ? sheetStyle() : undefined}
      >
        <div
          className='w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 touch-none cursor-grab active:cursor-grabbing'
          onClick={handleClose}
          {...handleProps}
        >
          <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
        </div>

        <button
          type='button'
          className='flex absolute leading-0 top-4 right-4 z-10 h-8 w-8 rounded-full items-center justify-center text-xl bg-white shadow-sm border border-gray-200 hover:bg-gray-50'
          onClick={handleClose}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {!activeProduct ? (
          <div className=''></div>
        ) : (
          <ProductContent
            key={activeProduct.id}
            product={activeProduct}
            onClose={handleClose}
            scrollProps={contentProps}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
