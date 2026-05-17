import { useState, useRef } from 'react';

interface Options {
  /** px — закрыть если утащил дальше этого */
  threshold?: number;
  /** px/ms — закрыть при быстром флике даже на малом расстоянии */
  velocityThreshold?: number;
  /** минимальный px для velocity-dismiss */
  minVelocityDistance?: number;
}

export function useSwipeToDismiss(
  onDismiss: () => void,
  {
    threshold = 120,
    velocityThreshold = 0.4,
    minVelocityDistance = 40,
  }: Options = {},
) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  const onTouchStart = (e: React.TouchEvent) => {
    // начинаем drag только если контент не прокручен
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    // rubber-band при свайпе вверх
    setDragY(dy > 0 ? dy : dy * 0.15);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = elapsed > 0 ? dy / elapsed : 0;

    const shouldDismiss =
      dy > threshold ||
      (dy > minVelocityDistance && velocity > velocityThreshold);

    if (shouldDismiss) {
      onDismiss();
    }
    setDragY(0);
    startY.current = null;
  };

  const onTouchCancel = () => {
    setDragY(0);
    startY.current = null;
  };

  /** opacity для backdrop: 1 → 0 по мере drag */
  const backdropOpacity = (baseOpacity: number, fadeOverPx = 300) =>
    Math.max(0, baseOpacity * (1 - dragY / fadeOverPx));

  /** inline style для шита */
  const sheetStyle = (isDragging: boolean): React.CSSProperties => ({
    transform: `translateY(${dragY}px)`,
    transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
  });

  return {
    dragY,
    isDragging: startY.current !== null,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    backdropOpacity,
    sheetStyle,
  };
}
