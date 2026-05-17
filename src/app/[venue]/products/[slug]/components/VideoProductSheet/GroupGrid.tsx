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
  /**
   * Пары взаимоисключающих вариантов [id1, id2] для сегментного рендера.
   * Если задано — группа рендерится как стопка пилл-переключателей (как выбор размера).
   */
  segmentPairs?: [number, number][];
}

const haptic = (ms = 25) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
};

export default function GroupGrid({
  group,
  counts,
  onChange,
  columns = 3,
  darkSelected = false,
  segmentPairs,
}: Props) {
  const { type, max, min } = useMemo(
    () => ({ type: group.selection.type, max: group.selection.max, min: group.selection.min }),
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

  /** Выбор одного варианта в паре (сегмент): сброс другого */
  const handleSegmentSelect = useCallback(
    (pair: [number, number], selectedId: number) => {
      haptic();
      const next = { ...counts };
      for (const id of pair) next[id] = 0;
      next[selectedId] = next[selectedId] > 0 ? 0 : 1; // toggle
      onChange(next);
    },
    [counts, onChange],
  );

  // ── Сегментный рендер ─────────────────────────────────────────────────────
  if (segmentPairs && segmentPairs.length > 0) {
    const itemById = Object.fromEntries(group.items.map((i) => [i.id, i]));
    return (
      <div className='w-full h-full overflow-y-auto overscroll-contain'>
        <div className='bg-white/15 backdrop-blur-2xl rounded-3xl p-3 space-y-2'>
          {segmentPairs.map(([id1, id2], rowIdx) => {
            const a = itemById[id1];
            const b = itemById[id2];
            if (!a || !b) return null;
            const aSelected = (counts[id1] ?? 0) > 0;
            const bSelected = (counts[id2] ?? 0) > 0;
            return (
              <div
                key={rowIdx}
                className='flex bg-white/20 backdrop-blur-md rounded-2xl p-1 gap-1'
              >
                <SegmentOption
                  label={a.name}
                  photo={a.photo}
                  selected={aSelected}
                  onSelect={() => handleSegmentSelect([id1, id2], id1)}
                />
                <SegmentOption
                  label={b.name}
                  photo={b.photo}
                  selected={bSelected}
                  onSelect={() => handleSegmentSelect([id1, id2], id2)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Обычный grid-рендер ──────────────────────────────────────────────────
  const itemCount = group.items.length;

  // 1–2 элемента — флекс с центровкой; 3+ — сетка
  if (itemCount <= 2) {
    return (
      <div className='w-full h-full overflow-y-auto overscroll-contain'>
        <div className='bg-white/15 backdrop-blur-2xl rounded-3xl p-2.5 flex justify-center gap-2'>
          {group.items.map((it) => {
            const count = counts[it.id] ?? 0;
            const canIncrement = type === 'single' ? count === 0 : canIncrementGlobal;
            return (
              <div key={it.id} className='w-1/3'>
                <GroupGridItem
                  item={it}
                  count={count}
                  canIncrement={canIncrement}
                  darkSelected={darkSelected}
                  onInc={() => handleInc(it.id)}
                  onDec={() => handleDec(it.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const cols = columns === 4 ? 'grid-cols-4' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className='w-full h-full overflow-y-auto overscroll-contain'>
      <div className={`bg-white/15 backdrop-blur-2xl rounded-3xl p-2.5 grid ${cols} gap-2`}>
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

// ── Кнопка одного варианта внутри сегментного ряда ────────────────────────
function SegmentOption({
  label,
  photo,
  selected,
  onSelect,
}: {
  label: string;
  photo?: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`
        flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5
        text-[13px] font-semibold text-[#21201F] text-center leading-tight
        transition-all duration-150 active:scale-95
        ${selected ? 'bg-white shadow-sm' : 'bg-transparent'}
      `}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt='' className='w-5 h-5 object-contain shrink-0' />
      )}
      {label}
    </button>
  );
}
