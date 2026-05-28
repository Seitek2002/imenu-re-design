'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMounted } from '@/hooks/useMounted';
import { MOCK_VIDEO_PRODUCTS, VARIANT_GROUPS } from '@/data/mock-video-products';
import { useVideoProductStore } from '@/store/videoProduct';
import { useVenueStore } from '@/store/venue';
import { useVenueProducts } from '@/lib/api/queries';
import type { Product } from '@/types/api';

import VideoSheetLayout from './VideoSheetLayout';
import { VariantChip, DecafChip } from './VariantChip';

const DEMO_PARAM = 'demo';
const VIDEO_PARAM = 'video';

const VARIANT_TYPE_ORDER = ['decaf', 'hot', 'ice', 'lactose_free'];

function sortVariants(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const ai = VARIANT_TYPE_ORDER.indexOf(a.variantType ?? '');
    const bi = VARIANT_TYPE_ORDER.indexOf(b.variantType ?? '');
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export default function VideoProductSheet() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const demoSlug = searchParams.get(DEMO_PARAM);
  const mock = demoSlug ? (MOCK_VIDEO_PRODUCTS[demoSlug] ?? null) : null;

  const videoId = searchParams.get(VIDEO_PARAM);
  const videoProductFromStore = useVideoProductStore((s) => s.selectedProduct);
  const setVideoProduct = useVideoProductStore((s) => s.setProduct);

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
  const chipIcons: Record<string, string> = mock?.chipIcons ?? {};
  const groupMeta = mock?.groupMeta ?? null;

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
    setVideoProduct(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(DEMO_PARAM);
    params.delete(VIDEO_PARAM);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams, setVideoProduct]);

  // ── Variant chip slot ───────────────────────────────────────────────────────
  const realAlternates = useMemo(() => realProduct?.alternateVersions ?? [], [realProduct]);
  const hasRealVariants = realProduct?.variantType != null && realAlternates.length > 0;

  const chipSlot = useMemo(() => {
    // Demo mode: show only alternates (not the current product)
    if (mock && demoSlug) {
      const group = VARIANT_GROUPS[demoSlug];
      if (!group) return null;
      const alternates = group.filter((slug) => slug !== demoSlug);
      if (alternates.length === 0) return null;
      return (
        <>
          {alternates.map((slug) => {
            const m = MOCK_VIDEO_PRODUCTS[slug];
            if (!m) return null;
            const navigate = () => {
              const params = new URLSearchParams(searchParams.toString());
              params.set(DEMO_PARAM, slug);
              router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            };
            if (m.product.variantType === 'decaf') {
              return (
                <DecafChip
                  key={slug}
                  label={m.product.variantChip?.label ?? m.product.productName}
                  onClick={navigate}
                />
              );
            }
            return (
              <VariantChip
                key={slug}
                variantType={m.product.variantType ?? null}
                label={m.product.variantChip?.label ?? m.product.productName}
                active={false}
                onClick={navigate}
              />
            );
          })}
        </>
      );
    }
    // Real product mode: show only alternates (not the current product)
    if (realProduct && hasRealVariants) {
      const alternates = sortVariants(realAlternates);
      return (
        <>
          {alternates.map((p) => {
            const navigate = () => {
              setVideoProduct(p);
              const params = new URLSearchParams(searchParams.toString());
              params.set(VIDEO_PARAM, String(p.id));
              router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            };
            if (p.variantType === 'decaf') {
              return (
                <DecafChip
                  key={p.id}
                  label={p.variantChip?.label ?? p.productName}
                  onClick={navigate}
                />
              );
            }
            return (
              <VariantChip
                key={p.id}
                variantType={p.variantType ?? null}
                label={p.variantChip?.label ?? p.productName}
                active={false}
                onClick={navigate}
              />
            );
          })}
        </>
      );
    }
    return null;
  }, [mock, demoSlug, realProduct, hasRealVariants, realAlternates, searchParams, pathname, router, setVideoProduct]);

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
      variantChipSlot={chipSlot}
    />,
    document.body,
  );
}
