'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GroupItem, Product } from '@/types/api';
import { useVenueStore } from '@/store/venue';
import { variantPrice } from '@/lib/pricing';

export const haptic = (ms = 30) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate)
    navigator.vibrate(ms);
};

export function useVideoSheet({
  product,
  open,
  resetKey,
}: {
  product: Product | null;
  open: boolean;
  resetKey: string | null;
}) {
  const spotId = useVenueStore((s) => s.spotId);

  const [sizeId, setSizeId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [qnty, setQnty] = useState(1);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [prefSelections, setPrefSelections] = useState<
    Record<string, string | null>
  >({});
  const [detailOpen, setDetailOpen] = useState(false);

  const lastResetKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open || !product) {
      if (!open) lastResetKeyRef.current = null;
      return;
    }
    if (lastResetKeyRef.current === resetKey) return;
    lastResetKeyRef.current = resetKey;
    setSizeId(product.modificators[0]?.id ?? null);
    setCounts({});
    setQnty(1);
    setExpandedGroupId(null);
    setPrefSelections({});
    setDetailOpen(false);
  }, [open, product, resetKey]);

  const groups = useMemo(() => product?.groupModifications ?? [], [product]);

  const expandedGroup = useMemo(
    () =>
      expandedGroupId == null
        ? null
        : (groups.find((g) => g.id === expandedGroupId) ?? null),
    [expandedGroupId, groups],
  );

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const mod = product.modificators.find((m) => m.id === sizeId);
    const base = mod ? variantPrice(mod, spotId) : product.productPrice;
    const adds = groups.reduce(
      (acc, g) =>
        acc +
        g.items.reduce((s, i) => s + Number(i.price) * (counts[i.id] ?? 0), 0),
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
    const out: Record<number, GroupItem | undefined> = {};
    for (const g of groups) {
      out[g.id] = g.items.find((i) => (counts[i.id] ?? 0) > 0);
    }
    return out;
  }, [groups, counts]);

  const handleToggleGroup = useCallback((id: number) => {
    haptic(25);
    setExpandedGroupId((prev) => (prev === id ? null : id));
  }, []);

  const handleTogglePref = useCallback(() => {
    haptic(25);
    setExpandedGroupId(null);
  }, []);

  const handleSelectSize = useCallback((id: number) => {
    haptic(25);
    setSizeId(id);
  }, []);

  return {
    spotId,
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
    unitPrice,
    totalPrice: unitPrice * qnty,
    groupCounts,
    groupSelectedItems,
    handleToggleGroup,
    handleTogglePref,
    handleSelectSize,
  };
}
