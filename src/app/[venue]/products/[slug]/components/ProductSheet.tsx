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
import { Plus, Minus, Utensils, Check, ChevronLeft } from 'lucide-react';
import { useSearchParams, usePathname, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import {
  GroupItem,
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
import { variantPrice } from '@/lib/pricing';
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
        <OptionalGroupsBar
          groups={optional}
          counts={counts}
          onChange={onChange}
        />
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
        {group.items.map((item) => {
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

      {error && (
        <p className='text-xs text-red-500 mt-2'>{error}</p>
      )}
    </div>
  );
};

/**
 * Карточка модификатора. Реализация перенесена из VideoProductSheet/GroupGridItem
 * и адаптирована под светлый ProductSheet: фото `w-14 h-14` со skeleton-лоадером
 * и фолбэком `/splash-placeholder.svg`, полностью видимое название, вес·цена,
 * степпер `− N +` на иконках lucide. Карточка типонезависима — семантику
 * single/multiple задаёт родитель через `canIncrement` + `onInc`/`onDec`.
 */
const ModifierItemCard = ({
  item,
  count,
  type,
  canIncrement,
  onInc,
  onDec,
}: {
  item: GroupItem;
  count: number;
  type: 'single' | 'multiple';
  canIncrement: boolean;
  onInc: () => void;
  onDec: () => void;
}) => {
  const t = useTranslations('Product');
  const tc = useTranslations('Common');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hoverSide, setHoverSide] = useState<'l' | 'r' | null>(null);
  const selected = count > 0;
  const priceNum = Number(item.price);
  const bruttoNum = Number(item.brutto);
  const rawPhoto = item.photo || item.thumbnail || null;
  const showImg = !!rawPhoto && !imgError;

  // Зоны лево/право активны только когда есть что уменьшать (multiple, count>0)
  const zonesActive = type === 'multiple' && count > 0;

  const priceLabel =
    priceNum > 0 ? t('pricePlus', { price: priceNum }) : t('free');
  const meta =
    bruttoNum > 0
      ? `${Math.round(bruttoNum)} ${tc('weightUnit')} · ${priceLabel}`
      : priceLabel;

  // Клик по карточке. single — переключение выбора. multiple — левая половина
  // уменьшает, правая увеличивает; на пустой карточке (или с клавиатуры) —
  // просто добавляем.
  const handleCardClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (type === 'single') {
      if (selected) onDec();
      else onInc();
      return;
    }
    const keyboard = e.detail === 0;
    if (count > 0 && !keyboard) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX - rect.left < rect.width / 2) {
        onDec();
        return;
      }
    }
    onInc();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!zonesActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientX - rect.left < rect.width / 2 ? 'l' : 'r';
    setHoverSide((prev) => (prev === side ? prev : side));
  };
  const handleMouseLeave = () =>
    setHoverSide((prev) => (prev === null ? prev : null));

  return (
    <button
      type='button'
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={item.name}
      className={`group relative overflow-hidden rounded-2xl p-2 pt-3 flex flex-col items-center h-full min-h-[138px] text-center cursor-pointer transition-all duration-150 ${
        selected
          ? 'bg-white ring-2 ring-[#21201F]/25 shadow-md'
          : 'bg-white ring-1 ring-black/5 hover:ring-[#21201F]/15 hover:shadow-sm'
      }`}
    >
      {/* Оверлей наведённой стороны (лево −, право +) на всю высоту; фото лежит
          выше (z-10) на непрозрачной плитке, поэтому им не задевается */}
      {zonesActive && (
        <>
          <span
            className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 transition-colors duration-150 ${
              hoverSide === 'l' ? 'bg-[#21201F]/[0.05]' : ''
            }`}
          />
          <span
            className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 transition-colors duration-150 ${
              hoverSide === 'r' ? 'bg-[#21201F]/[0.05]' : ''
            }`}
          />
        </>
      )}

      <div className='relative z-10 flex flex-1 flex-col items-center w-full'>
        {/* Фото — компактный квадрат (object-cover); skeleton при загрузке,
            нейтральная иконка при отсутствии/ошибке */}
        <div className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100'>
          {showImg ? (
            <>
              {!imgLoaded && (
                <div className='absolute inset-0 animate-pulse bg-black/5' />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rawPhoto}
                alt={item.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <Utensils size={20} strokeWidth={1.75} className='text-[#21201F]/25' />
            </div>
          )}
        </div>

        {/* Название — полностью видимое, без обрезки */}
        <div className='text-[13px] font-bold mt-1 leading-snug text-[#21201F] break-words w-full'>
          {item.name}
        </div>

        {/* Вес · цена */}
        <div className='text-[11px] mt-0.5 text-[#21201F]/60 leading-tight w-full'>
          {meta}
        </div>

        {/* Индикатор состояния (визуальный — клики обрабатывает карточка).
            multiple+selected — степпер разнесён по краям: − слева, + справа */}
        {!selected ? (
          <div className='mt-auto pt-1.5 flex items-center justify-center min-h-7 pointer-events-none'>
            <span className='w-7 h-7 rounded-full bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center'>
              <Plus size={16} strokeWidth={2.5} className='text-[#21201F]' />
            </span>
          </div>
        ) : type === 'single' ? (
          <div className='mt-auto pt-1.5 flex items-center justify-center min-h-7 pointer-events-none'>
            <span className='w-7 h-7 rounded-full bg-[#21201F] flex items-center justify-center'>
              <Check size={15} strokeWidth={3} className='text-white' />
            </span>
          </div>
        ) : (
          <div className='mt-auto pt-1.5 w-full flex items-center justify-between min-h-7 pointer-events-none'>
            <span
              className={`w-6 h-6 rounded-full bg-white shadow-sm ring-1 flex items-center justify-center transition-all duration-150 ${
                hoverSide === 'l' ? 'ring-[#21201F]/40 scale-110' : 'ring-black/5'
              }`}
            >
              <Minus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </span>
            <span className='font-bold text-sm text-[#21201F]'>{count}</span>
            <span
              className={`w-6 h-6 rounded-full bg-white shadow-sm ring-1 flex items-center justify-center transition-all duration-150 ${
                !canIncrement
                  ? 'opacity-40 ring-black/5'
                  : hoverSide === 'r'
                    ? 'ring-[#21201F]/40 scale-110'
                    : 'ring-black/5'
              }`}
            >
              <Plus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * Плавающее окно (≈343×320) с модификаторами одной группы. Рендерится порталом
 * в контейнер шита `[data-product-sheet]`, поэтому позиционируется относительно
 * него и одинаково работает на мобиле и десктопе. Закрывается тапом по фону
 * или Escape.
 */
const ModifierPopover = ({
  group,
  counts,
  onChange,
  onClose,
}: {
  group: GroupModification;
  counts: CountsState;
  onChange: (next: CountsState) => void;
  onClose: () => void;
}) => {
  // Контейнер шита уже в DOM к моменту открытия поповера — берём его лениво,
  // без setState-in-effect.
  const [container] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined'
      ? null
      : (document.querySelector('[data-product-sheet]') as HTMLElement | null),
  );
  const touchStartY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const { type, min, max } = group.selection;
  const sum = sumGroupCount(group, counts);
  const canIncrementGlobal = max <= 0 || sum < max;

  // Логика инкремента/декремента — как в VideoProductSheet/GroupGrid.
  const handleInc = (itemId: number) => {
    if (type === 'single') {
      const next: CountsState = { ...counts };
      for (const it of group.items) next[it.id] = 0;
      next[itemId] = 1;
      onChange(next);
      return;
    }
    if (!canIncrementGlobal) return;
    onChange({ ...counts, [itemId]: (counts[itemId] ?? 0) + 1 });
  };

  const handleDec = (itemId: number) => {
    const current = counts[itemId] ?? 0;
    if (current <= 0) return;
    // single + min=0: повторный тап снимает выбор
    if (type === 'single' && min === 0) {
      onChange({ ...counts, [itemId]: 0 });
      return;
    }
    onChange({ ...counts, [itemId]: current - 1 });
  };

  if (!container) return null;

  return createPortal(
    <div
      className='absolute inset-0 z-30 flex items-end justify-center px-3 pt-4 pb-[100px]'
      onClick={onClose}
      // Гасим всплытие touch: из-за React-портала свайп иначе долетает до
      // swipe-to-dismiss основной модалки и закрывает её. Свайп вниз (когда
      // сетка вверху) закрывает сам поповер.
      onTouchStart={(e) => {
        e.stopPropagation();
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => {
        e.stopPropagation();
        if (touchStartY.current == null) return;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
        if (dy > 70 && atTop) onClose();
        touchStartY.current = null;
      }}
      onTouchCancel={(e) => {
        e.stopPropagation();
        touchStartY.current = null;
      }}
    >
      <div className='absolute inset-0 bg-black/15 popover-backdrop' />
      <div
        className='relative w-full max-w-[420px] max-h-full flex flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl border border-black/5 popover-rise'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Грэб-хэндл вместо шапки — окно закрывается свайпом вниз/тапом вне/Escape/чипом */}
        <div className='flex justify-center pt-2.5 pb-1 shrink-0'>
          <div className='w-9 h-1 rounded-full bg-[#21201F]/15' />
        </div>

        <div
          ref={scrollRef}
          className='px-3 pt-1 pb-4 flex-1 min-h-0 overflow-y-auto overscroll-contain'
        >
          <div className='grid grid-cols-3 gap-2.5'>
            {group.items.map((item) => {
              const count = counts[item.id] ?? 0;
              const canIncrement =
                type === 'single' ? count === 0 : canIncrementGlobal;
              return (
                <ModifierItemCard
                  key={item.id}
                  item={item}
                  count={count}
                  type={type}
                  canIncrement={canIncrement}
                  onInc={() => handleInc(item.id)}
                  onDec={() => handleDec(item.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    container,
  );
};

/**
 * Чип группы опциональных модификаторов. Дизайн перенесён из
 * VideoProductSheet/GroupChip (3 состояния) и адаптирован под светлую тему:
 * ничего не выбрано — «+» кружок над карточкой; выбран 1 — фото и название
 * элемента; выбрано >1 — фото + бейдж количества. Тап открывает поповер.
 */
/** Плитка мозаики 22×22 для чипа группы: фото с фолбэком на нейтральную
 * иконку при отсутствии/ошибке загрузки. Состояние ошибки локально, чтобы
 * каждая плитка падала независимо. */
const MosaicTile = ({ item }: { item: GroupItem }) => {
  const [errored, setErrored] = useState(false);
  const photo = item.photo || item.thumbnail || null;
  if (!photo || errored) {
    return (
      <span className='w-full h-full bg-gray-100 flex items-center justify-center'>
        <Utensils size={12} strokeWidth={1.75} className='text-[#21201F]/30' />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt=''
      onError={() => setErrored(true)}
      className='w-full h-full object-cover'
    />
  );
};

const OptionalGroupChip = ({
  group,
  counts,
  active,
  onClick,
}: {
  group: GroupModification;
  counts: CountsState;
  active: boolean;
  onClick: () => void;
}) => {
  const sum = sumGroupCount(group, counts);
  const selected = group.items.filter((i) => (counts[i.id] ?? 0) > 0);
  const hasSelection = sum > 0;
  const label = sum === 1 && selected[0] ? selected[0].name : group.name;
  // Мозаика из первых 4 уникальных выбранных модификаторов. Бейдж `+N` сверху
  // продолжает отрабатывать оверфлоу по полному количеству (sum).
  const tiles = selected.slice(0, 4);

  return (
    <button
      type='button'
      onClick={onClick}
      className={`relative shrink-0 w-[92px] h-[90px] rounded-2xl flex flex-col items-center justify-center gap-1.5 px-1 active:scale-95 transition-all duration-150 outline-none ${
        active
          ? 'bg-white ring-2 ring-[#21201F]/15 shadow-sm'
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
      aria-pressed={active}
      aria-label={hasSelection ? `${label}: ${sum}` : label}
    >
      {sum > 1 && (
        <span className='absolute top-1.5 right-1.5 bg-[#21201F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center'>
          {sum}
        </span>
      )}

      {hasSelection ? (
        <div
          className='w-11 h-11 rounded-xl overflow-hidden grid gap-px bg-white'
          style={
            tiles.length >= 2
              ? {
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: tiles.length >= 3 ? '1fr 1fr' : '1fr',
                }
              : undefined
          }
        >
          {tiles.length === 3 ? (
            <>
              <div className='row-span-2 overflow-hidden'>
                <MosaicTile item={tiles[0]} />
              </div>
              <div className='overflow-hidden'>
                <MosaicTile item={tiles[1]} />
              </div>
              <div className='overflow-hidden'>
                <MosaicTile item={tiles[2]} />
              </div>
            </>
          ) : (
            tiles.map((item) => (
              <div key={item.id} className='overflow-hidden'>
                <MosaicTile item={item} />
              </div>
            ))
          )}
        </div>
      ) : (
        <span className='w-9 h-9 rounded-full border border-[#21201F]/15 flex items-center justify-center'>
          <Plus size={18} strokeWidth={2} className='text-[#21201F]' />
        </span>
      )}

      {/* Высота под две строки зарезервирована, чтобы «+»/фото у чипов с одно- и
          двухстрочными названиями стояли на одном уровне (button — justify-center) */}
      <span className='text-[11px] font-medium text-center text-[#21201F] leading-tight line-clamp-2 break-words w-full min-h-[28px]'>
        {label}
      </span>
    </button>
  );
};

/**
 * Ряд чипов-групп опциональных модификаторов. Тап по чипу открывает
 * {@link ModifierPopover} с модификаторами этой группы.
 */
const OptionalGroupsBar = ({
  groups,
  counts,
  onChange,
}: {
  groups: GroupModification[];
  counts: CountsState;
  onChange: (next: CountsState) => void;
}) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const openGroup = groups.find((g) => g.id === openId) ?? null;

  return (
    <div className='flex gap-2 overflow-x-auto -mx-5 px-5 pt-1 pb-1 items-center scrollbar-none'>
      {groups.map((g) => (
        <OptionalGroupChip
          key={g.id}
          group={g}
          counts={counts}
          active={openId === g.id}
          onClick={() => setOpenId((prev) => (prev === g.id ? null : g.id))}
        />
      ))}

      {openGroup && (
        <ModifierPopover
          group={openGroup}
          counts={counts}
          onChange={onChange}
          onClose={() => setOpenId(null)}
        />
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

  // Мастер включается только когда есть хотя бы одна обязательная группа
  // (min>0) — иначе остаётся одностраничный лист. Каждая обязательная группа —
  // отдельный шаг; все опциональные собраны в один общий шаг (пиллами).
  const requiredGroups = useMemo(
    () => groups.filter((g) => g.selection.min > 0),
    [groups],
  );
  const optionalGroups = useMemo(
    () => groups.filter((g) => g.selection.min === 0),
    [groups],
  );
  const hasOptional = optionalGroups.length > 0;
  const wizard = requiredGroups.length > 0;

  // Карта шагов: только обязательные группы + обзор. Опциональные шагом не
  // считаются — они показываются как чипы-апселл над summary на review-шаге.
  type WizardStep =
    | { kind: 'required'; group: GroupModification }
    | { kind: 'review' };
  const steps: WizardStep[] = useMemo(() => {
    const list: WizardStep[] = requiredGroups.map((group) => ({
      kind: 'required',
      group,
    }));
    list.push({ kind: 'review' });
    return list;
  }, [requiredGroups]);

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

  // --- Пошаговый мастер ---
  const totalSteps = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'fwd' | 'back'>('fwd');
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);
  useEffect(() => clearAdvance, [clearAdvance]);

  const goNext = useCallback(() => {
    clearAdvance();
    setSlideDir('fwd');
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [clearAdvance, totalSteps]);
  const goBack = useCallback(() => {
    clearAdvance();
    setSlideDir('back');
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [clearAdvance]);
  const goToStep = useCallback(
    (i: number) => {
      clearAdvance();
      setSlideDir(i >= stepIndex ? 'fwd' : 'back');
      setStepIndex(i);
    },
    [clearAdvance, stepIndex],
  );

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isReviewStep = currentStep?.kind === 'review';
  const currentGroup =
    currentStep?.kind === 'required' ? currentStep.group : null;

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
  const currentValid = currentGroup ? !errors[currentGroup.id] : true;

  // Изменение на текущем шаге мастера. Для single-select обязательной группы
  // после выбора авто-переход к следующему шагу (~260мс).
  const handleCurrentChange = useCallback(
    (next: CountsState) => {
      setCounts(next);
      // Авто-переход только для обязательных single-select: в опциональной
      // группе тап может означать «снять выбор», поэтому шаг не двигаем.
      if (
        currentGroup &&
        currentGroup.selection.type === 'single' &&
        currentGroup.selection.min > 0
      ) {
        clearAdvance();
        advanceTimer.current = setTimeout(() => goNext(), 260);
      }
    },
    [currentGroup, clearAdvance, goNext],
  );

  const unitPrice = useMemo(() => {
    const base = selectedFlat
      ? variantPrice(selectedFlat, spotId)
      : product.productPrice;
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
  }, [product, selectedFlat, groups, counts, spotId]);

  const totalPrice = unitPrice * qnty;

  const handleAdd = () => {
    if (!isValid) return;
    if (navigator.vibrate) navigator.vibrate(50);
    addToBasket(product, qnty, {
      flatModId: selectedFlat?.id,
      flatModName: selectedFlat?.name,
      flatModPrice: selectedFlat ? variantPrice(selectedFlat, spotId) : undefined,
      groupSelections: buildGroupSelections(product, counts),
    });
    onClose();
  };

  const weightLabel =
    product.weight > 0
      ? `${product.weight} ${product.unitDisplay || product.measureUnit || ''}`.trim()
      : null;

  // ─── Пошаговый мастер (есть обязательные группы) ───
  if (wizard) {
    const progress = ((stepIndex + 1) / totalSteps) * 100;
    const stepTitle = isReviewStep
      ? t('review')
      : currentGroup!.selection.title || currentGroup!.name;
    const slideClass = slideDir === 'fwd' ? 'step-slide-in' : 'step-slide-back';

    // Индекс шага, на котором редактируется группа. Опциональные собраны на
    // review-шаге (как апселл-чипы над summary), туда же и ведём.
    const stepIndexForGroup = (g: GroupModification) => {
      if (g.selection.min > 0) {
        return steps.findIndex(
          (s) => s.kind === 'required' && s.group.id === g.id,
        );
      }
      return steps.findIndex((s) => s.kind === 'review');
    };

    return (
      <>
        <div
          className='flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-4 md:pb-0'
          {...scrollProps}
        >
          <div className='md:p-6'>
            {/* Герой: фото, название, цена, промо, описание — как раньше */}
            <div className='md:grid md:grid-cols-2 md:gap-6 md:items-start'>
              <div className='relative w-full aspect-4/3 md:aspect-square md:rounded-2xl overflow-hidden shrink-0'>
                <Image
                  src={product.productPhoto || '/placeholder-dish.svg'}
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

            {/* Прогресс + текущий шаг */}
            <div className='px-5 pb-2 md:px-0 md:pb-0 md:mt-6'>
              <div className='mb-4'>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-sm font-semibold text-[#21201F] truncate pr-2'>
                    {stepTitle}
                  </span>
                  <span className='text-xs text-gray-400 shrink-0'>
                    {t('stepProgress', { current: stepIndex + 1, total: totalSteps })}
                  </span>
                </div>
                <div className='relative h-1.5 w-full rounded-full bg-gray-100 overflow-hidden'>
                  <div
                    className='absolute inset-0 bg-[linear-gradient(to_right,#5EEAD4_0%,#FAA924_60%,#F3811F_100%)] transition-[clip-path] duration-300 ease-out'
                    style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                  />
                </div>
              </div>

              <div key={stepIndex} className={slideClass}>
            {currentGroup && (
              <GroupSection
                group={currentGroup}
                counts={counts}
                onChange={handleCurrentChange}
                error={null}
                absolutePricing={product.productPrice === 0}
              />
            )}

            {isReviewStep && (
              <div className='flex flex-col gap-4'>
                {hasOptional && (
                  <div>
                    <div className='text-xs font-semibold text-[#21201F] mb-2'>
                      {t('extras')}
                    </div>
                    <OptionalGroupsBar
                      groups={optionalGroups}
                      counts={counts}
                      onChange={setCounts}
                    />
                  </div>
                )}

                <div className='flex flex-col gap-2'>
                  <span className='text-xs text-gray-400'>{t('reviewHint')}</span>
                  {requiredGroups.map((g) => {
                    const chosen = g.items.filter(
                      (i) => (counts[i.id] ?? 0) > 0,
                    );
                    const label = chosen.length
                      ? chosen
                          .map((i) => {
                            const c = counts[i.id] ?? 0;
                            return c > 1 ? `${i.name} ×${c}` : i.name;
                          })
                          .join(', ')
                      : t('noExtras');
                    return (
                      <button
                        key={g.id}
                        type='button'
                        onClick={() => goToStep(stepIndexForGroup(g))}
                        className='w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left hover:bg-gray-100 active:scale-[0.99] transition-all'
                      >
                        <div className='min-w-0'>
                          <div className='text-xs text-gray-400'>{g.name}</div>
                          <div
                            className={`font-medium truncate ${
                              chosen.length ? 'text-[#21201F]' : 'text-gray-400'
                            }`}
                          >
                            {label}
                          </div>
                        </div>
                        <span className='text-sm font-medium text-brand shrink-0'>
                          {t('edit')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* Футер: навигация / добавление */}
        <div className='p-4 border-t border-gray-100 bg-white md:bg-transparent md:border-none'>
          {isReviewStep ? (
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={goBack}
                aria-label={t('back')}
                className='h-14 w-14 rounded-2xl bg-[#F5F5F5] text-[#21201F] hover:bg-[#ececec] active:scale-95 transition-all shrink-0 flex items-center justify-center'
              >
                <ChevronLeft size={22} strokeWidth={2.25} />
              </button>
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
                onClick={handleAdd}
                className='flex-1 min-w-0 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 hover:brightness-95 disabled:opacity-40 disabled:active:scale-100'
              >
                <span>{t('add')}</span>
                <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
                  {totalPrice} с.
                </span>
              </button>
            </div>
          ) : (
            <div className='flex gap-3'>
              {stepIndex > 0 && (
                <button
                  type='button'
                  onClick={goBack}
                  aria-label={t('back')}
                  className='h-14 w-14 rounded-2xl bg-[#F5F5F5] text-[#21201F] hover:bg-[#ececec] active:scale-95 transition-all shrink-0 flex items-center justify-center'
                >
                  <ChevronLeft size={22} strokeWidth={2.25} />
                </button>
              )}
              <button
                disabled={!currentValid}
                onClick={goNext}
                className='flex-1 min-w-0 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 hover:brightness-95 disabled:opacity-40 disabled:active:scale-100'
              >
                <span>{t('next')}</span>
                {unitPrice > 0 && (
                  <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
                    {unitPrice} {tc('currency')}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

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
                        {variantPrice(mod, spotId)} с.
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
            className='flex-1 min-w-0 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 hover:brightness-95 disabled:opacity-40 disabled:active:scale-100'
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
        data-product-sheet
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
