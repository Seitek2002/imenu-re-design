'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

const DEMO_PARAM = 'demo';

/**
 * Full-screen витрина товара с видео-фоном.
 *
 * Триггер: `?demo=<slug>` в URL → ищем slug в MOCK_VIDEO_PRODUCTS. Если
 * найден — рендерим overlay. На этом этапе живёт параллельно со старым
 * `ProductSheet` (z-100 vs наш z-110) и его не трогает. Когда дизайн
 * примут, переключим триггер на основной поток открытия товара.
 */
export default function VideoProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const demoSlug = searchParams.get(DEMO_PARAM);
  const mock = demoSlug ? MOCK_VIDEO_PRODUCTS[demoSlug] ?? null : null;
  const isOpen = !!mock;

  // --- local state ------------------------------------------------------
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [qnty, setQnty] = useState(1);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  // Реинициализация при смене активного мока.
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
  }, [demoSlug, mock]);

  // Body lock + scroll lock на время открытого overlay.
  useEffect(() => {
    if (!mounted) return;
    if (!isOpen) return;
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

  // --- handlers ---------------------------------------------------------
  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(DEMO_PARAM);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  // ESC — Close (десктоп / клавиатура).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // --- derived ----------------------------------------------------------
  const groups = useMemo(
    () => mock?.product.groupModifications ?? [],
    [mock],
  );

  const expandedGroup = useMemo(
    () =>
      expandedGroupId == null
        ? null
        : groups.find((g) => g.id === expandedGroupId) ?? null,
    [expandedGroupId, groups],
  );

  // Цена: базовая (или цена выбранного размера) + сумма выбранных опций × их цена.
  const unitPrice = useMemo(() => {
    if (!mock) return 0;
    const selectedMod = mock.product.modificators.find((m) => m.id === sizeId);
    const base = selectedMod?.price ?? mock.product.productPrice;
    const adds = groups.reduce(
      (acc, g) =>
        acc +
        g.items.reduce(
          (s, i) => s + Number(i.price) * (counts[i.id] ?? 0),
          0,
        ),
      0,
    );
    return base + adds;
  }, [mock, sizeId, groups, counts]);

  const totalPrice = unitPrice * qnty;

  // Счётчики по группам — для бейджей на чипах.
  const groupCounts = useMemo(() => {
    const out: Record<number, number> = {};
    for (const g of groups) {
      out[g.id] = g.items.reduce(
        (s, i) => s + (counts[i.id] ?? 0),
        0,
      );
    }
    return out;
  }, [groups, counts]);

  const handleToggleGroup = useCallback((id: number) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  }, []);

  const handleAdd = useCallback(() => {
    // На этапе мока — просто закрываем overlay. Подключим к корзине после
    // согласования дизайна (логика уже есть в ProductSheet).
    if (navigator.vibrate) navigator.vibrate(40);
    handleClose();
  }, [handleClose]);

  // --- render -----------------------------------------------------------
  if (!mounted || !mock) return null;
  const { product, videoUrl, posterUrl, chipIcons } = mock;

  return createPortal(
    <div
      className='fixed inset-0 z-[110] flex flex-col text-white overflow-hidden'
      role='dialog'
      aria-modal='true'
      aria-label={product.productName}
    >
      <VideoBackground src={videoUrl} poster={product.productPhoto || posterUrl} />

      {/* Тёмный градиент сверху и снизу — для читаемости текста поверх видео */}
      <div
        className='absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/45 pointer-events-none'
        aria-hidden='true'
      />

      {/* Close */}
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

      {/* Title + description + size pill + «Подробнее» */}
      <div
        style={{
          paddingTop:
            'max(3.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
        }}
        className='relative z-10 px-5 pb-2 flex flex-col gap-3 shrink-0'
      >
        <div className='pr-12'>
          <h1 className='text-[40px] font-bold leading-none tracking-tight'>
            {product.productName}
          </h1>
          {product.productDescription && (
            <p className='text-white/70 text-sm leading-snug mt-2 max-w-[280px]'>
              {product.productDescription}
            </p>
          )}
        </div>

        <SizePill
          options={product.modificators}
          selectedId={sizeId}
          onSelect={setSizeId}
        />

        {groups.length > 0 && (
          <button
            type='button'
            onClick={() => handleToggleGroup(groups[0].id)}
            className={`text-sm pl-1 w-fit transition-colors ${
              expandedGroupId != null
                ? 'text-white/85'
                : 'text-white underline underline-offset-[6px] decoration-white/50 decoration-1'
            }`}
          >
            Подробнее
          </button>
        )}
      </div>

      {/* Expanded group grid — пока группа закрыта, пространство занято видео/постером */}
      <div className='relative z-10 flex-1 min-h-0 px-4 py-1'>
        {expandedGroup && (
          <GroupGrid
            group={expandedGroup}
            counts={counts}
            onChange={setCounts}
          />
        )}
      </div>

      {/* Chips row */}
      {groups.length > 0 && (
        <div className='relative z-10 shrink-0'>
          <div className='flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1'>
            {groups.map((g) => (
              <GroupChip
                key={g.id}
                group={g}
                icon={chipIcons[g.name]}
                active={expandedGroupId === g.id}
                selectedCount={groupCounts[g.id] ?? 0}
                onClick={() => handleToggleGroup(g.id)}
              />
            ))}
          </div>
        </div>
      )}

      <BottomBar
        qnty={qnty}
        onQntyChange={setQnty}
        totalPrice={totalPrice}
        onAdd={handleAdd}
      />
    </div>,
    document.body,
  );
}
