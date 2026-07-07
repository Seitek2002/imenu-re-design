'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMounted } from '@/hooks/useMounted';
import { useVideoProductStore } from '@/store/videoProduct';
import { useVenueStore } from '@/store/venue';
import { useVenueProducts } from '@/lib/api/queries';
import type { GroupModification, Product } from '@/types/api';

import VideoSheetLayout from './VideoSheetLayout';
import { VariantChip, DecafChip } from './VariantChip';

// Demo-режим (`?demo=<slug>`, дизайн-ревью на моках) вынесен в отдельный
// компонент со своим next/dynamic и рендерится только когда demoSlug реально
// есть в URL. Next.js прелоадит в SSR-HTML любой import(), до которого можно
// дотянуться из модуля постоянно смонтированного dynamic()-компонента,
// независимо от рантайм-условий внутри него — если бы мок-данные жили прямо
// здесь (в always-mounted VideoProductSheet), их чанк (~30 КБ gzip) грузился
// бы на каждой странице заведения, даже без единого видео-товара.
const DemoVideoSheet = dynamic(() => import('./DemoVideoSheet'), { ssr: false });

const DEMO_PARAM = 'demo';
const VIDEO_PARAM = 'video';

const VARIANT_TYPE_ORDER = ['decaf', 'hot', 'ice', 'lactose_free'];

function buildChipIconsFromGroups(
  groups: GroupModification[] | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of groups ?? []) {
    if (g.icon) out[g.name] = g.icon;
  }
  return out;
}

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

  const chipIcons: Record<string, string> = buildChipIconsFromGroups(
    realProduct?.groupModifications,
  );

  const activeKey = realProduct ? `v:${realProduct.id}` : null;

  // Scroll lock — только для реального товара; demo-версия лочит скролл сама.
  useEffect(() => {
    if (!mounted || !realProduct) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevTouch = body.style.touchAction;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouch;
    };
  }, [realProduct, mounted]);

  const handleClose = useCallback(() => {
    setVideoProduct(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(DEMO_PARAM);
    params.delete(VIDEO_PARAM);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams, setVideoProduct]);

  // ── Variant chip slot (только для реального товара) ─────────────────────────
  const realAlternates = useMemo(() => realProduct?.alternateVersions ?? [], [realProduct]);
  const hasRealVariants = realProduct?.variantType != null && realAlternates.length > 0;

  const chipSlot = useMemo(() => {
    if (!realProduct || !hasRealVariants) return null;
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
  }, [realProduct, hasRealVariants, realAlternates, searchParams, pathname, router, setVideoProduct]);

  // Demo-режим приоритета не имеет над реальным товаром: если оба параметра
  // почему-то оказались в URL одновременно, реальный товар важнее.
  if (!realProduct && demoSlug) {
    return <DemoVideoSheet demoSlug={demoSlug} onClose={handleClose} />;
  }

  if (!mounted || !realProduct) return null;

  return createPortal(
    <VideoSheetLayout
      rootClassName='fixed inset-0 z-110 flex flex-col text-white overflow-hidden pb-6'
      product={realProduct}
      videoUrl={realProduct.productVideoLarge ?? ''}
      poster={realProduct.productVideoPoster ?? realProduct.productPhoto ?? undefined}
      productDetails={realProduct.productDetails ?? null}
      groupMeta={null}
      chipIcons={chipIcons}
      open
      resetKey={activeKey}
      isDemo={false}
      onClose={handleClose}
      onAdd={handleClose}
      variantChipSlot={chipSlot}
    />,
    document.body,
  );
}
