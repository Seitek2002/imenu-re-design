'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';

import { useMounted } from '@/hooks/useMounted';
import { MOCK_VIDEO_PRODUCTS } from '@/data/mock-video-products';
import { useVideoProductStore } from '@/store/videoProduct';
import { useVenueStore } from '@/store/venue';
import { useVenueProducts } from '@/lib/api/queries';

import VideoSheetLayout from './VideoSheetLayout';
import IceVersionSheet from './IceVersionSheet';
import { VariantChip } from './VariantChip';
import { haptic } from './useVideoSheet';

const DEMO_PARAM = 'demo';
const VIDEO_PARAM = 'video';

export default function VideoProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const demoSlug = searchParams.get(DEMO_PARAM);
  const mock = demoSlug ? (MOCK_VIDEO_PRODUCTS[demoSlug] ?? null) : null;

  const videoId = searchParams.get(VIDEO_PARAM);
  const videoProductFromStore = useVideoProductStore((s) => s.selectedProduct);
  const clearVideoProduct = useVideoProductStore((s) => s.setProduct);

  // Fallback: if ?video= in URL but store is empty (direct navigation),
  // look for the product in already-loaded catalog data (React Query cache).
  const venueSlug = useVenueStore((s) => s.data?.slug ?? null);
  const spotId = useVenueStore((s) => s.spotId);
  const { data: allProducts } = useVenueProducts(
    !videoId || videoProductFromStore ? null : venueSlug,
    spotId,
  );
  const productFromCache = videoId && !videoProductFromStore
    ? (allProducts?.find((p) => p.id === Number(videoId)) ?? null)
    : null;

  const realProduct = videoId ? (videoProductFromStore ?? productFromCache) : null;
  const isOpen = !!(mock || realProduct);

  const product = realProduct ?? mock?.product ?? null;
  const videoUrl = realProduct?.productVideoLarge ?? mock?.videoUrl ?? '';
  const poster = realProduct
    ? (realProduct.productVideoPoster ?? realProduct.productPhoto ?? undefined)
    : (mock?.product.productPhoto ?? mock?.posterUrl ?? undefined);
  const productDetails = realProduct?.productDetails ?? mock?.productDetails ?? null;
  const variantChip = realProduct?.iceVersionChip ?? mock?.variantChip ?? null;
  const chipIcons: Record<string, string> = mock?.chipIcons ?? {};
  const groupMeta = mock?.groupMeta ?? null;

  const iceProduct = realProduct?.iceVersion ?? null;
  const iceMock = useMemo(
    () => (mock?.variantSlug ? (MOCK_VIDEO_PRODUCTS[mock.variantSlug] ?? null) : null),
    [mock],
  );
  const hasVariant = !!(iceProduct || iceMock);

  const [iceOpen, setIceOpen] = useState(false);
  const activeKey = realProduct ? `v:${realProduct.id}` : demoSlug;

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
    clearVideoProduct(null);
    setIceOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(DEMO_PARAM);
    params.delete(VIDEO_PARAM);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams, clearVideoProduct]);

  if (!mounted || !product) return null;

  return createPortal(
    <VideoSheetLayout
      rootClassName='fixed inset-0 z-110 flex flex-col text-white overflow-hidden pb-6'
      product={product}
      videoUrl={videoUrl}
      poster={poster}
      productDetails={productDetails}
      groupMeta={groupMeta}
      chipIcons={chipIcons}
      open={isOpen}
      resetKey={activeKey}
      onClose={handleClose}
      onAdd={handleClose}
      variantChipSlot={
        variantChip && hasVariant ? (
          <VariantChip
            variantType={iceProduct?.variantType ?? iceMock?.variantType ?? null}
            label={variantChip.label}
            onClick={() => { haptic(25); setIceOpen(true); }}
          />
        ) : null
      }
    >
      <IceVersionSheet
        open={iceOpen}
        mock={iceMock}
        iceProduct={iceProduct}
        onClose={() => setIceOpen(false)}
      />
    </VideoSheetLayout>,
    document.body,
  );
}
