'use client';

import type { VideoProductMock } from '@/data/mock-video-products';
import type { Product } from '@/types/api';

import VideoSheetLayout from './VideoSheetLayout';
import { VariantChip } from './VariantChip';

interface Props {
  open: boolean;
  mock: VideoProductMock | null;
  iceProduct?: Product | null;
  onClose: () => void;
}

export default function IceVersionSheet({ open, mock, iceProduct, onClose }: Props) {
  const product = iceProduct ?? mock?.product ?? null;
  if (!product) return null;

  const videoUrl = iceProduct?.productVideoLarge ?? mock?.videoUrl ?? '';
  const poster = iceProduct
    ? (iceProduct.productVideoPoster ?? iceProduct.productPhoto ?? undefined)
    : (mock?.product.productPhoto ?? mock?.posterUrl ?? undefined);
  const productDetails = iceProduct?.productDetails ?? mock?.productDetails ?? null;
  const variantChip = iceProduct?.iceVersionChip ?? mock?.variantChip ?? null;
  const chipIcons: Record<string, string> = mock?.chipIcons ?? {};
  const groupMeta = mock?.groupMeta ?? null;

  return (
    <VideoSheetLayout
      rootClassName={`
        absolute inset-0 z-40 flex flex-col text-white overflow-hidden pb-6
        transition-transform duration-500
        ${open ? 'translate-y-0' : 'translate-y-full'}
      `}
      rootStyle={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      product={product}
      videoUrl={videoUrl}
      poster={poster}
      productDetails={productDetails}
      groupMeta={groupMeta}
      chipIcons={chipIcons}
      open={open}
      resetKey={String(product.id)}
      onClose={onClose}
      onAdd={onClose}
      variantChipSlot={
        <VariantChip
          variantType={iceProduct?.variantType ?? null}
          label={variantChip?.label ?? 'Назад'}
          inverted
          onClick={onClose}
        />
      }
    />
  );
}
