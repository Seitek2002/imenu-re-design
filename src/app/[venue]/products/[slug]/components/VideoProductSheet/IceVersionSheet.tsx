'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Snowflake, X } from 'lucide-react';
import type { VideoProductMock } from '@/data/mock-video-products';
import type { Product } from '@/types/api';
import { useVenueStore } from '@/store/venue';
import { variantPrice } from '@/lib/pricing';

import VideoBackground from './VideoBackground';
import SizePill from './SizePill';
import GroupChip from './GroupChip';
import GroupGrid from './GroupGrid';
import BottomBar from './BottomBar';
import ProductDetailSheet from './ProductDetailSheet';

const haptic = (ms = 30) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
};

interface Props {
  open: boolean;
  /** Мок-данные альтернативной версии (demo-режим). */
  mock: VideoProductMock | null;
  /** Реальный вложенный товар из API (iceVersion). Приоритет над mock. */
  iceProduct?: Product | null;
  onClose: () => void;
}

/**
 * Bottom sheet с полной видео-витриной альтернативной версии товара.
 * Открывается по клику на чип «Айс версия» / «Горячая версия».
 * Поддерживает оба источника данных: реальный Product и mock VideoProductMock.
 */
export default function IceVersionSheet({ open, mock, iceProduct, onClose }: Props) {
  // ── Единый источник данных ───────────────────────────────────────────────
  const product = iceProduct ?? mock?.product ?? null;
  const videoUrl = iceProduct?.productVideoLarge ?? mock?.videoUrl ?? '';
  const poster =
    iceProduct
      ? (iceProduct.productVideoPoster ?? iceProduct.productPhoto ?? undefined)
      : (mock?.product.productPhoto ?? mock?.posterUrl ?? undefined);
  const productDetails = iceProduct?.productDetails ?? mock?.productDetails ?? null;
  const variantChip = iceProduct?.iceVersionChip ?? mock?.variantChip ?? null;
  const chipIcons: Record<string, string> = mock?.chipIcons ?? {};
  const groupMeta = mock?.groupMeta ?? null;

  const spotId = useVenueStore((s) => s.spotId);

  // ── Локальный стейт ──────────────────────────────────────────────────────
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [qnty, setQnty] = useState(1);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Сброс стейта при смене товара
  const lastIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!open || !product) {
      if (!open) lastIdRef.current = null;
      return;
    }
    if (lastIdRef.current === product.id) return;
    lastIdRef.current = product.id;
    setSizeId(product.modificators[0]?.id ?? null);
    setCounts({});
    setQnty(1);
    setExpandedGroupId(null);
    setDetailOpen(false);
  }, [open, product]);

  // ESC → закрыть (если детальный лист закрыт)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !detailOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, detailOpen, onClose]);

  const groups = useMemo(() => product?.groupModifications ?? [], [product]);

  const expandedGroup = useMemo(
    () => (expandedGroupId == null ? null : groups.find((g) => g.id === expandedGroupId) ?? null),
    [expandedGroupId, groups],
  );

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const mod = product.modificators.find((m) => m.id === sizeId);
    const base = mod ? variantPrice(mod, spotId) : product.productPrice;
    const adds = groups.reduce(
      (acc, g) => acc + g.items.reduce((s, i) => s + Number(i.price) * (counts[i.id] ?? 0), 0),
      0,
    );
    return base + adds;
  }, [product, sizeId, groups, counts, spotId]);

  const groupCounts = useMemo(() => {
    const out: Record<number, number> = {};
    for (const g of groups) {
      out[g.id] = g.items.reduce((s, i) => s + (counts[i.id] ?? 0), 0);
    }
    return out;
  }, [groups, counts]);

  const groupSelectedItems = useMemo(() => {
    const out: Record<number, (typeof groups)[0]['items'][0] | undefined> = {};
    for (const g of groups) {
      out[g.id] = g.items.find((i) => (counts[i.id] ?? 0) > 0);
    }
    return out;
  }, [groups, counts]);

  const handleToggleGroup = useCallback((id: number) => {
    haptic(25);
    setExpandedGroupId((prev) => (prev === id ? null : id));
  }, []);

  const handleSelectSize = useCallback((id: number) => {
    haptic(25);
    setSizeId(id);
  }, []);

  if (!product) return null;

  const totalPrice = unitPrice * qnty;

  return (
    <div
      className={`
        absolute inset-0 z-40 flex flex-col text-white overflow-hidden pb-6
        transition-transform duration-500
        ${open ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      role='dialog'
      aria-modal='true'
      aria-label={product.productName}
    >
      <VideoBackground src={videoUrl} poster={poster} />

      <div
        className='absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/50 pointer-events-none'
        aria-hidden='true'
      />

      {/* Кнопка закрытия — вернуться к основному товару */}
      <button
        type='button'
        onClick={() => { haptic(25); onClose(); }}
        style={{ top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))' }}
        className='absolute right-4 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ring-1 ring-white/20'
        aria-label='Закрыть'
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      {/* Заголовок + описание + размер + «Подробнее» */}
      <div
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}
        className='relative z-10 px-5 pb-2 flex flex-col gap-3 shrink-0'
      >
        <div className='pr-12'>
          <h1 className='text-[40px] font-medium leading-none tracking-tight'>
            {product.productName}
          </h1>
          {product.productDescription && (
            <p className='text-white/70 text-sm mt-2 max-w-70 line-clamp-2'>
              {product.productDescription}
            </p>
          )}
          {productDetails && (
            <button
              type='button'
              onClick={() => { haptic(25); setDetailOpen(true); }}
              className='text-sm mt-1 pl-1 w-fit text-white underline underline-offset-[6px] decoration-white/50 decoration-1'
            >
              Подробнее
            </button>
          )}
        </div>

        <SizePill
          options={product.modificators}
          selectedId={sizeId}
          onSelect={handleSelectSize}
        />
      </div>

      {/* Сетка группы + нижняя панель */}
      <div className='flex-1 flex flex-col min-h-0'>
        <div className='relative flex-1 flex flex-col justify-end z-10 px-4 py-2 min-h-0'>
          {expandedGroup && (
            <GroupGrid
              group={expandedGroup}
              counts={counts}
              onChange={setCounts}
              columns={groupMeta?.[expandedGroup.id]?.columns}
              darkSelected={groupMeta?.[expandedGroup.id]?.darkSelected}
              segmentPairs={groupMeta?.[expandedGroup.id]?.segmentPairs}
            />
          )}
        </div>

        <div className='justify-end'>
          {/* Нижний ряд чипов — чип возврата всегда виден */}
          <div className='relative z-10 shrink-0'>
            <div className='flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1 items-end'>

              <VariantReturnChip
                variantType={iceProduct?.variantType ?? null}
                label={variantChip?.label ?? 'Назад'}
                onReturn={() => { haptic(25); onClose(); }}
              />

              {groups.length > 0 && (
                <div className='w-px h-12 bg-white/25 shrink-0 self-center mx-0.5' aria-hidden='true' />
              )}

              {groups.map((g) => (
                <GroupChip
                  key={g.id}
                  group={g}
                  icon={chipIcons[g.name]}
                  active={expandedGroupId === g.id}
                  selectedCount={groupCounts[g.id] ?? 0}
                  selectedItem={groupSelectedItems[g.id]}
                  onClick={() => handleToggleGroup(g.id)}
                />
              ))}
            </div>
          </div>

          <BottomBar
            qnty={qnty}
            onQntyChange={(n) => { haptic(25); setQnty(n); }}
            totalPrice={totalPrice}
            onAdd={() => { haptic(60); onClose(); }}
          />
        </div>
      </div>

      {productDetails && (
        <ProductDetailSheet
          open={detailOpen}
          details={productDetails}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Чип «Горячая/Айс версия» внутри ice sheet — закрывает его
// ---------------------------------------------------------------------------
function VariantReturnChip({
  variantType,
  label,
  onReturn,
}: {
  variantType: 'ice' | 'hot' | null | undefined;
  label: string;
  onReturn: () => void;
}) {
  // Текущий продукт — ice/hot. Возврат — к противоположному.
  const Icon = variantType === 'ice' ? Flame : variantType === 'hot' ? Snowflake : Flame;
  const displayLabel = variantType === 'ice' ? 'Горячий' : variantType === 'hot' ? 'Айс' : label;

  return (
    <button
      type='button'
      onClick={onReturn}
      className='relative shrink-0 w-21 h-27 rounded-[20px] flex flex-col items-center justify-between pt-2.5 pb-2.5 overflow-hidden active:scale-95 transition-all duration-150 bg-white/25 backdrop-blur-md ring-1 ring-white/30'
      aria-label={displayLabel}
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        <Icon size={36} strokeWidth={1.5} className='text-white' />
      </div>
      <span className='text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 w-full px-1.5 shrink-0'>
        {displayLabel}
      </span>
    </button>
  );
}
