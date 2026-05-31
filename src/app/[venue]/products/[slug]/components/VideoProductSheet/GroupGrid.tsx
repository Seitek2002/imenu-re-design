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

  /** Выбор одного варианта в паре (сегмент): сброс другого, активный не снимается */
  const handleSegmentSelect = useCallback(
    (pair: [number, number], selectedId: number) => {
      if ((counts[selectedId] ?? 0) > 0) return; // уже активен — ничего не делаем
      haptic();
      const next = { ...counts };
      for (const id of pair) next[id] = 0;
      next[selectedId] = 1;
      onChange(next);
    },
    [counts, onChange],
  );

  // ── Сегментный рендер: пары сгруппированы, 2 группы в строке ────────────
  if (segmentPairs && segmentPairs.length > 0) {
    const itemById = Object.fromEntries(group.items.map((i) => [i.id, i]));

    return (
      <div className='overflow-y-auto overscroll-contain min-h-0'>
        <div
          className='rounded-3xl p-2.5 grid grid-cols-2 gap-2.5'
          style={{ background: 'linear-gradient(145deg, rgba(196,149,106,0.88), rgba(139,94,60,0.88))', backdropFilter: 'blur(20px)' }}
        >
          {segmentPairs.map(([id1, id2]) => {
            const a = itemById[id1];
            const b = itemById[id2];
            if (!a || !b) return null;
            const aSelected = (counts[id1] ?? 0) > 0;
            const bSelected = (counts[id2] ?? 0) > 0;
            return (
              <div
                key={`${id1}-${id2}`}
                className='flex gap-1 rounded-2xl p-1 overflow-hidden'
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <SegmentCard
                  item={a}
                  selected={aSelected}
                  onSelect={() => handleSegmentSelect([id1, id2], id1)}
                />
                <SegmentCard
                  item={b}
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
      className='relative flex-1 rounded-2xl pt-2.5 pb-2 px-1.5 flex flex-col items-center justify-between overflow-hidden h-25 transition-all duration-200 active:scale-95'
      style={{ backgroundColor: selected ? '#4B2E15' : 'rgba(212, 165, 116, 0.55)' }}
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt='' className='w-14.5 h-14.5 object-contain drop-shadow-sm' />
        ) : (
          <div className='w-14.5 h-14.5 rounded-xl' style={{ backgroundColor: 'rgba(0,0,0,0.05)' }} />
        )}
      </div>
      <span
        className='text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full mt-1'
        style={{ color: selected ? '#fff' : '#3D2B1F' }}
      >
        {item.name}
      </span>
    </button>
  );
}
