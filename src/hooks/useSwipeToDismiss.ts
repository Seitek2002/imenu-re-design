import { useState, useRef } from 'react';

interface Options {
  /** px — закрыть если утащил ручку дальше этого */
  handleThreshold?: number;
  /** px/ms — закрыть при быстром флике за ручку */
  velocityThreshold?: number;
  /** минимальный px для velocity-dismiss по ручке */
  minVelocityDistance?: number;
  /** px — закрыть тихим свайпом по контенту (только при scrollTop=0) */
  contentThreshold?: number;
}

export function useSwipeToDismiss(
  onDismiss: () => void,
  {
    handleThreshold = 120,
    velocityThreshold = 0.4,
    minVelocityDistance = 40,
    contentThreshold = 80,
  }: Options = {},
) {
  const [dragY, setDragY] = useState(0);

  // --- ручка: полный drag с визуальным смещением ---
  const handleStartY = useRef<number | null>(null);
  const handleStartTime = useRef<number>(0);

  const onHandleTouchStart = (e: React.TouchEvent) => {
    handleStartY.current = e.touches[0].clientY;
    handleStartTime.current = Date.now();
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (handleStartY.current == null) return;
    const dy = e.touches[0].clientY - handleStartY.current;
    setDragY(dy > 0 ? dy : dy * 0.15);
  };

  const onHandleTouchEnd = (e: React.TouchEvent) => {
    if (handleStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - handleStartY.current;
    const elapsed = Date.now() - handleStartTime.current;
    const velocity = elapsed > 0 ? dy / elapsed : 0;

    const shouldDismiss =
      dy > handleThreshold ||
      (dy > minVelocityDistance && velocity > velocityThreshold);

    if (shouldDismiss) onDismiss();
    setDragY(0);
    handleStartY.current = null;
  };

  const onHandleTouchCancel = () => {
    setDragY(0);
    handleStartY.current = null;
  };

  // --- контент: тихое закрытие только если в самом верху ---
  const contentStartY = useRef<number | null>(null);

  const onContentTouchStart = (e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop > 0) return;
    contentStartY.current = e.touches[0].clientY;
  };

  const onContentTouchEnd = (e: React.TouchEvent) => {
    if (contentStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - contentStartY.current;
    if (dy > contentThreshold) onDismiss();
    contentStartY.current = null;
  };

  const onContentTouchCancel = () => {
    contentStartY.current = null;
  };

  /** opacity для backdrop: плавно уходит вместе с drag по ручке */
  const backdropOpacity = (baseOpacity: number, fadeOverPx = 300) =>
    Math.max(0, baseOpacity * (1 - dragY / fadeOverPx));

  /** style для шита — transition только при snap-back */
  const sheetStyle = (): React.CSSProperties => ({
    transform: `translateY(${dragY}px)`,
    transition: dragY === 0
      ? 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
      : 'none',
  });

  return {
    dragY,
    /** вешать на ручку (pill) */
    handleProps: {
      onTouchStart: onHandleTouchStart,
      onTouchMove: onHandleTouchMove,
      onTouchEnd: onHandleTouchEnd,
      onTouchCancel: onHandleTouchCancel,
    },
    /** вешать на скролл-контейнер контента */
    contentProps: {
      onTouchStart: onContentTouchStart,
      onTouchEnd: onContentTouchEnd,
      onTouchCancel: onContentTouchCancel,
    },
    backdropOpacity,
    sheetStyle,
  };
}
