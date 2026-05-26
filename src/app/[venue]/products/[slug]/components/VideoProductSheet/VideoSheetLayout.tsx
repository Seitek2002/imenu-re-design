'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product, ProductDetails } from '@/types/api';

import type { GroupMeta } from '@/data/mock-video-products';
import { useVideoSheet, haptic } from './useVideoSheet';
import VideoBackground from './VideoBackground';
import SizePill from './SizePill';
import GroupChip from './GroupChip';
import GroupGrid from './GroupGrid';
import BottomBar from './BottomBar';
import ProductDetailSheet from './ProductDetailSheet';
import {
  PREFERENCE_CHIPS,
  PreferenceChipButton,
  PreferenceGrid,
} from './PreferenceChips';

interface Props {
  rootClassName: string;
  rootStyle?: React.CSSProperties;

  product: Product;
  videoUrl: string;
  poster?: string;
  productDetails: ProductDetails | null;
  groupMeta?: Record<number, GroupMeta> | null;
  chipIcons?: Record<string, string>;

  open: boolean;
  resetKey: string | null;

  onClose: () => void;
  onAdd: () => void;

  /** First chip slot — VariantChip (open or return). null = not shown. */
  variantChipSlot?: React.ReactNode;
  /** IceVersionSheet or nothing */
  children?: React.ReactNode;
}

export default function VideoSheetLayout({
  rootClassName,
  rootStyle,
  product,
  videoUrl,
  poster,
  productDetails,
  groupMeta,
  chipIcons = {},
  open,
  resetKey,
  onClose,
  onAdd,
  variantChipSlot,
  children,
}: Props) {
  const {
    sizeId,
    counts,
    setCounts,
    qnty,
    setQnty,
    prefSelections,
    setPrefSelections,
    detailOpen,
    setDetailOpen,
    groups,
    expandedGroup,
    expandedPref,
    totalPrice,
    groupCounts,
    groupSelectedItems,
    handleToggleGroup,
    handleTogglePref,
    handleSelectSize,
  } = useVideoSheet({ product, open, resetKey });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !detailOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, detailOpen, onClose]);

  return (
    <div
      className={rootClassName}
      style={rootStyle}
      role='dialog'
      aria-modal='true'
      aria-label={product.productName}
    >
      <VideoBackground src={videoUrl} poster={poster} />

      <div
        className='absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/50 pointer-events-none'
        aria-hidden='true'
      />

      <button
        type='button'
        onClick={() => {
          haptic(25);
          onClose();
        }}
        style={{
          top: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        }}
        className='absolute right-4 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ring-1 ring-white/20'
        aria-label='Закрыть'
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      <div
        style={{
          paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
        }}
        className='relative z-10 px-5 pb-2 flex flex-col gap-3 shrink-0'
      >
        <div className='pr-12'>
          <h1 className='text-[40px] font-medium leading-none tracking-tight'>
            {product.productName}
          </h1>
          {product.productDescription && (
            <p className='text-white/70 text-sm mt-2 max-w-full line-clamp-2 flex justify-between'>
              {product.productDescription}
              {productDetails && (
                <button
                  type='button'
                  onClick={() => {
                    haptic(25);
                    setDetailOpen(true);
                  }}
                  className='text-sm mt-1 pl-1 w-fit text-white underline underline-offset-[6px] decoration-white/50 decoration-1'
                >
                  Подробнее
                </button>
              )}
            </p>
          )}
        </div>

        <SizePill
          options={product.modificators}
          selectedId={sizeId}
          onSelect={handleSelectSize}
        />
      </div>

      <div className='flex-1 flex flex-col min-h-0'>
        <div className='relative flex-1 flex flex-col justify-end z-10 px-4 py-2 min-h-0'>
          {expandedGroup ? (
            <GroupGrid
              group={expandedGroup}
              counts={counts}
              onChange={setCounts}
              columns={groupMeta?.[expandedGroup.id]?.columns}
              darkSelected={groupMeta?.[expandedGroup.id]?.darkSelected}
              segmentPairs={groupMeta?.[expandedGroup.id]?.segmentPairs}
            />
          ) : expandedPref ? (
            <PreferenceGrid
              chip={expandedPref}
              selectedId={prefSelections[expandedPref.id] ?? null}
              onSelect={(optId) => {
                haptic(15);
                setPrefSelections((prev) => ({
                  ...prev,
                  [expandedPref.id]: optId,
                }));
              }}
            />
          ) : null}
        </div>

        <div className='justify-end'>
          <div className='relative z-10 shrink-0'>
            <div className='flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1 items-end'>
              {variantChipSlot}
              {variantChipSlot && (
                <div
                  className='w-px h-12 bg-white/25 shrink-0 self-center mx-0.5'
                  aria-hidden='true'
                />
              )}

              {PREFERENCE_CHIPS.map((pref) => (
                <PreferenceChipButton
                  key={pref.id}
                  chip={pref}
                  active={expandedPref?.id === pref.id}
                  selectedOptionLabel={
                    prefSelections[pref.id]
                      ? pref.options.find(
                          (o) => o.id === prefSelections[pref.id],
                        )?.label
                      : undefined
                  }
                  onClick={() => handleTogglePref(pref.id)}
                />
              ))}

              {groups.length > 0 && (
                <div
                  className='w-px h-12 bg-white/25 shrink-0 self-center mx-0.5'
                  aria-hidden='true'
                />
              )}

              {groups.map((g) => (
                <GroupChip
                  key={g.id}
                  group={g}
                  icon={chipIcons[g.name]}
                  active={expandedGroup?.id === g.id}
                  selectedCount={groupCounts[g.id] ?? 0}
                  selectedItem={groupSelectedItems[g.id]}
                  onClick={() => handleToggleGroup(g.id)}
                />
              ))}
            </div>
          </div>

          <BottomBar
            qnty={qnty}
            onQntyChange={(n) => {
              haptic(25);
              setQnty(n);
            }}
            totalPrice={totalPrice}
            onAdd={() => {
              haptic(60);
              onAdd();
            }}
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

      {children}
    </div>
  );
}
