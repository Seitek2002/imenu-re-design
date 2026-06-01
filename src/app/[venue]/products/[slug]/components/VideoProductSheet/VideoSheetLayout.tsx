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

  /** Variant chip slot — rendered before preference chips in the scroll row. */
  variantChipSlot?: React.ReactNode;
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
    detailOpen,
    setDetailOpen,
    groups,
    expandedGroup,
    totalPrice,
    groupCounts,
    groupSelectedItems,
    handleToggleGroup,
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
            <p className='text-white/70 text-sm mt-2 max-w-full line-clamp-2 flex flex-col'>
              {product.productDescription}
              {productDetails && (
                <button
                  type='button'
                  onClick={() => {
                    haptic(25);
                    setDetailOpen(true);
                  }}
                  className='text-sm mt-1 w-fit text-white underline underline-offset-[6px] decoration-white/50 decoration-1'
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
        <div className={`relative flex-1 flex flex-col justify-end px-4 py-2 min-h-0 ${expandedGroup ? 'z-20' : 'z-10'}`}>
          {expandedGroup ? (
            <GroupGrid
              group={expandedGroup}
              counts={counts}
              onChange={setCounts}
              columns={groupMeta?.[expandedGroup.id]?.columns}
              darkSelected={groupMeta?.[expandedGroup.id]?.darkSelected}
              segmentPairs={groupMeta?.[expandedGroup.id]?.segmentPairs}
            />
          ) : null}
        </div>

        <div className='justify-end'>
          <div className='relative z-10 shrink-0'>
            <div className='flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2 pt-1 items-end'>
              {variantChipSlot && (
                <div
                  className='flex items-end gap-2 shrink-0 overflow-hidden'
                  style={{
                    maxHeight: expandedGroup ? '68px' : '300px',
                    transition: 'max-height 0.25s ease',
                  }}
                >
                  <div className='flex flex-col gap-2 shrink-0'>
                    {variantChipSlot}
                  </div>
                  <div
                    className='w-px h-12 bg-white/25 shrink-0 mb-6 mx-0.5'
                    aria-hidden='true'
                  />
                </div>
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
