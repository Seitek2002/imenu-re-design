'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { useMounted } from '@/hooks/useMounted';
import { MOCK_VIDEO_PRODUCTS } from '@/data/mock-video-products';

import VideoBackground from './VideoBackground';
import SizePill from './SizePill';
import GroupChip from './GroupChip';
import GroupGrid from './GroupGrid';
import BottomBar from './BottomBar';
import ProductDetailSheet from './ProductDetailSheet';
import IceVersionSheet from './IceVersionSheet';

const DEMO_PARAM = 'demo';

const haptic = (ms = 30) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate)
    navigator.vibrate(ms);
};

/**
 * Full-screen витрина товара с видео-фоном.
 * Триггер: `?demo=<slug>` в URL.
 */
export default function VideoProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const demoSlug = searchParams.get(DEMO_PARAM);
  const mock = demoSlug ? (MOCK_VIDEO_PRODUCTS[demoSlug] ?? null) : null;
  const isOpen = !!mock;

  const [sizeId, setSizeId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [qnty, setQnty] = useState(1);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [iceOpen, setIceOpen] = useState(false);

  // Мок альтернативной версии (Айс/Горячая) — null если у товара нет альтернативы
  const iceMock = useMemo(
    () => (mock?.variantSlug ? (MOCK_VIDEO_PRODUCTS[mock.variantSlug] ?? null) : null),
    [mock],
  );

  // Реинициализация при смене мока
  const lastSlugRef = useRef<string | null>(null);
  useEffect(() => {
    if (!mock) {
      lastSlugRef.current = null;
      return;
    }
    if (lastSlugRef.current === demoSlug) return;
    lastSlugRef.current = demoSlug;

    setSizeId(mock.product.modificators[0]?.id ?? null);
    setCounts({});
    setQnty(1);
    setExpandedGroupId(null);
    setDetailOpen(false);
    setIceOpen(false);
  }, [demoSlug, mock]);

  // Scroll lock
  useEffect(() => {
    if (!mounted || !isOpen) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevTouch = body.style.touchAction;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouch;
    };
  }, [isOpen, mounted]);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(DEMO_PARAM);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  // ESC → закрыть overlay (если детальный лист закрыт)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !detailOpen) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, detailOpen, handleClose]);

  const groups = useMemo(() => mock?.product.groupModifications ?? [], [mock]);

  const expandedGroup = useMemo(
    () =>
      expandedGroupId == null
        ? null
        : (groups.find((g) => g.id === expandedGroupId) ?? null),
    [expandedGroupId, groups],
  );

  // Цена = цена размера + сумма выбранных доп. опций
  const unitPrice = useMemo(() => {
    if (!mock) return 0;
    const mod = mock.product.modificators.find((m) => m.id === sizeId);
    const base = mod?.price ?? mock.product.productPrice;
    const adds = groups.reduce(
      (acc, g) =>
        acc +
        g.items.reduce((s, i) => s + Number(i.price) * (counts[i.id] ?? 0), 0),
      0,
    );
    return base + adds;
  }, [mock, sizeId, groups, counts]);

  const totalPrice = unitPrice * qnty;

  // Счётчики и выбранные элементы по группам — для чипов
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

  const handleAdd = useCallback(() => {
    haptic(60);
    // TODO: подключить к useBasketStore.addToBasket после согласования дизайна
    handleClose();
  }, [handleClose]);

  const handleDetailOpen = useCallback(() => {
    haptic(25);
    setDetailOpen(true);
  }, []);

  if (!mounted || !mock) return null;
  const {
    product,
    videoUrl,
    posterUrl,
    chipIcons,
    variantChip,
    productDetails,
    groupMeta,
  } = mock;

  return createPortal(
    <div
      className='fixed inset-0 z-110 flex flex-col text-white overflow-hidden pb-6'
      role='dialog'
      aria-modal='true'
      aria-label={product.productName}
    >
      <VideoBackground
        src={videoUrl}
        poster={product.productPhoto || posterUrl}
      />

      {/* Градиент сверху и снизу для читаемости текста */}
      <div
        className='absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/50 pointer-events-none'
        aria-hidden='true'
      />

      {/* Кнопка закрытия */}
      <button
        type='button'
        onClick={handleClose}
        style={{
          top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        }}
        className='absolute right-4 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ring-1 ring-white/20'
        aria-label='Закрыть'
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      {/* Заголовок + описание + размер + «Подробнее» */}
      <div
        style={{
          paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
        }}
        className='relative z-10 px-5 pb-2 flex flex-col gap-3 shrink-0'
      >
        <div className='pr-12'>
          <h1 className='text-[40px] font-bold leading-none tracking-tight'>
            {product.productName}
          </h1>
          {product.productDescription && (
            <p className='text-white/70 text-sm leading-snug mt-2 max-w-70'>
              {product.productDescription}
            </p>
          )}
        </div>

        <SizePill
          options={product.modificators}
          selectedId={sizeId}
          onSelect={handleSelectSize}
        />

        {productDetails && (
          <button
            type='button'
            onClick={handleDetailOpen}
            className='text-sm pl-1 w-fit text-white underline underline-offset-[6px] decoration-white/50 decoration-1'
          >
            Подробнее
          </button>
        )}
      </div>

      {/* Сетка группы (пока группа закрыта — пространство занято видео) */}
      <div className='flex-1 flex flex-col'>
        <div className='relative flex-1 flex flex-col justify-end z-10 px-4 py-2'>
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

        {/* Нижний ряд чипов */}
        <div className=' justify-end'>
          {groups.length > 0 && (
            <div className='relative z-10 shrink-0'>
              <div className='flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1 items-end'>
                {/* Чип «Айс версия» — показывается только если у товара есть альтернатива */}
                {variantChip && iceMock && (
                  <>
                    <VariantChipButton
                      label={variantChip.label}
                      photo={variantChip.photo}
                      onOpen={() => { haptic(25); setIceOpen(true); }}
                    />
                    <div
                      className='w-px h-12 bg-white/25 shrink-0 self-center mx-0.5'
                      aria-hidden='true'
                    />
                  </>
                )}

                {/* Группы */}
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
          )}

          <BottomBar
            qnty={qnty}
            onQntyChange={(n) => {
              haptic(25);
              setQnty(n);
            }}
            totalPrice={totalPrice}
            onAdd={handleAdd}
          />
        </div>
      </div>

      {/* Листок «Подробнее» */}
      {productDetails && (
        <ProductDetailSheet
          open={detailOpen}
          details={productDetails}
          onClose={() => setDetailOpen(false)}
        />
      )}

      {/* Bottom sheet альтернативной версии (Айс / Горячая) */}
      <IceVersionSheet
        open={iceOpen}
        mock={iceMock}
        onClose={() => setIceOpen(false)}
      />
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Variant chip (Айс версия и т.п.) — локальный компонент, не экспортируется
// ---------------------------------------------------------------------------
function VariantChipButton({
  label,
  photo,
  onOpen,
}: {
  label: string;
  photo: string;
  onOpen: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type='button'
      onClick={onOpen}
      className='relative shrink-0 w-21 h-22 rounded-[20px] flex flex-col items-start justify-between p-2.5 active:scale-95 transition-all duration-150 bg-white/25 backdrop-blur-md ring-1 ring-white/30'
      aria-label={label}
    >
      <span className='text-[11px] font-semibold text-[#21201F] leading-tight'>
        {label}
      </span>
      <div className='w-full flex justify-center'>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=''
            onError={() => setImgError(true)}
            className='w-14 h-14 object-contain'
          />
        ) : (
          <div className='w-14 h-14 rounded-xl bg-white/20' />
        )}
      </div>
    </button>
  );
}
