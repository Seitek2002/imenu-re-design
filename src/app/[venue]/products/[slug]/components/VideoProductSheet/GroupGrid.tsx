'use client';

import { useCallback, useMemo } from 'react';
import type { GroupItem, GroupModification } from '@/types/api';
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

  // ── Сегментный рендер (4-col grid, dark selected) ────────────────────────
  if (segmentPairs && segmentPairs.length > 0) {
    const itemById = Object.fromEntries(group.items.map((i) => [i.id, i]));
    const totalItems = segmentPairs.length * 2;
    const cols = totalItems <= 4 ? 'grid-cols-2' : 'grid-cols-4';

    return (
      <div className='overflow-y-auto overscroll-contain min-h-0'>
        <div className={`bg-white/15 backdrop-blur-2xl rounded-3xl p-2.5 grid ${cols} gap-2`}>
          {segmentPairs.flatMap(([id1, id2]) => {
            const a = itemById[id1];
            const b = itemById[id2];
            if (!a || !b) return [];
            const aSelected = (counts[id1] ?? 0) > 0;
            const bSelected = (counts[id2] ?? 0) > 0;
            return [
              <SegmentCard
                key={id1}
                item={a}
                selected={aSelected}
                onSelect={() => handleSegmentSelect([id1, id2], id1)}
              />,
              <SegmentCard
                key={id2}
                item={b}
                selected={bSelected}
                onSelect={() => handleSegmentSelect([id1, id2], id2)}
              />,
            ];
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
      <div className='overflow-y-auto overscroll-contain min-h-0'>
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
    <div className='overflow-y-auto overscroll-contain min-h-0'>
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

// ── Карточка одного варианта сегментной группы (4-col grid, dark selected) ──
function SegmentCard({
  item,
  selected,
  onSelect,
}: {
  item: GroupItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={`
        relative rounded-2xl p-2 flex flex-col items-center overflow-hidden h-25
        transition-all duration-150 active:scale-95
        ${selected ? 'bg-[#7D6150]' : 'bg-white/60'}
      `}
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        {item.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt='' className='w-14 h-14 object-contain' />
        )}
      </div>
      <span className={`text-[11px] font-semibold text-center leading-tight line-clamp-2 ${
        selected ? 'text-white' : 'text-[#21201F]'
      }`}>
        {item.name}
      </span>
    </button>
  );
}
