'use client';

import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMounted } from '@/hooks/useMounted';
import { MOCK_VIDEO_PRODUCTS, VARIANT_GROUPS } from '@/data/mock-video-products';

import VideoSheetLayout from './VideoSheetLayout';
import { VariantChip, DecafChip } from './VariantChip';

const DEMO_PARAM = 'demo';

interface Props {
  demoSlug: string;
  onClose: () => void;
}

/**
 * Витрина для дизайн-ревью на моках (`?demo=<slug>`), вынесена из index.tsx
 * в отдельный компонент, монтируемый через next/dynamic только когда
 * demoSlug реально есть в URL. Next.js прелоадит в SSR-HTML любой `import()`,
 * до которого можно дотянуться из модуля постоянно смонтированного
 * dynamic()-компонента, независимо от рантайм-условий внутри него — поэтому
 * держать мок-данные в index.tsx (который всегда смонтирован в лэйауте
 * заведения) означало тянуть их на каждую страницу заведения, даже без
 * единого видео-товара. Условный рендер + свой dynamic() здесь чинит это:
 * чанк с моками грузится только когда demoSlug реально есть.
 */
export default function DemoVideoSheet({ demoSlug, onClose }: Props) {
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mock = MOCK_VIDEO_PRODUCTS[demoSlug] ?? null;

  useEffect(() => {
    if (!mounted || !mock) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevTouch = body.style.touchAction;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouch;
    };
  }, [mounted, mock]);

  const chipSlot = useMemo(() => {
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
  }, [demoSlug, searchParams, pathname, router]);

  if (!mounted || !mock) return null;

  return createPortal(
    <VideoSheetLayout
      rootClassName='fixed inset-0 z-110 flex flex-col text-white overflow-hidden pb-6'
      product={mock.product}
      videoUrl={mock.videoUrl}
      poster={mock.product.productPhoto ?? mock.posterUrl}
      productDetails={mock.productDetails ?? null}
      groupMeta={mock.groupMeta ?? null}
      chipIcons={mock.chipIcons}
      open={true}
      resetKey={demoSlug}
      isDemo
      onClose={onClose}
      onAdd={onClose}
      variantChipSlot={chipSlot}
    />,
    document.body,
  );
}
