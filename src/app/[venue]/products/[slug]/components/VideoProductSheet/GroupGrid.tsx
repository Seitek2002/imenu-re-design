'use client';

import { useCallback, useMemo } from 'react';
import type { GroupModification } from '@/types/api';
import GroupGridItem from './GroupGridItem';

interface Props {
  group: GroupModification;
  counts: Record<number, number>;
  onChange: (next: Record<number, number>) => void;
  columns?: number;
  darkSelected?: boolean;
}

export default function GroupGrid({
  group,
  counts,
  onChange,
  columns = 3,
  darkSelected = false,
}: Props) {
  const { type, max, min } = useMemo(
    () => ({
      type: group.selection.type,
      max: group.selection.max,
      min: group.selection.min,
    }),
    [group.selection],
  );

  const sumInGroup = useMemo(
    () => group.items.reduce((s, i) => s + (counts[i.id] ?? 0), 0),
    [group.items, counts],
  );

  const canIncrementGlobal = max <= 0 || sumInGroup < max;

  const handleInc = useCallback(
    (itemId: number) => {
      if (type === 'single') {
        const next: Record<number, number> = { ...counts };
        for (const it of group.items) next[it.id] = 0;
        next[itemId] = 1;
        onChange(next);
        return;
      }
      if (!canIncrementGlobal) return;
      onChange({ ...counts, [itemId]: (counts[itemId] ?? 0) + 1 });
    },
    [type, counts, group.items, canIncrementGlobal, onChange],
  );

  const handleDec = useCallback(
    (itemId: number) => {
      const current = counts[itemId] ?? 0;
      if (current <= 0) return;
      if (type === 'single' && min === 0) {
        onChange({ ...counts, [itemId]: 0 });
        return;
      }
      onChange({ ...counts, [itemId]: current - 1 });
    },
    [counts, type, min, onChange],
  );

  const gridCols =
    columns === 4
      ? 'grid-cols-4'
      : columns === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

  return (
    <div className='w-full h-full overflow-y-auto overscroll-contain'>
      <div className={`bg-white/15 backdrop-blur-2xl rounded-3xl p-2.5 grid ${gridCols} gap-2`}>
        {group.items.map((it) => {
          const count = counts[it.id] ?? 0;
          const canIncrement = type === 'single' ? count === 0 : canIncrementGlobal;
          return (
            <GroupGridItem
              key={it.id}
              item={it}
              count={count}
              canIncrement={canIncrement}
              darkSelected={darkSelected}
              onInc={() => handleInc(it.id)}
              onDec={() => handleDec(it.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
