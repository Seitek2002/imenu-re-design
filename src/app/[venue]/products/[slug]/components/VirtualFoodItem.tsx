'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { Product } from '@/types/api';
import { useInView } from '@/hooks/useInView';
import FoodItem from './FoodItem';

interface Props {
  product: Product;
  index: number;
}

const VirtualFoodItem: FC<Props> = ({ product, index }) => {
  const { ref, inView } = useInView('300px');
  const heightRef = useRef<number>(0);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);
  // Монтируем лениво (ниже первого экрана карточки не рендерятся для быстрого
  // первого пейнта), но НЕ размонтируем после первого показа: иначе при скролле
  // вверх FoodItem пересоздаётся, isLoaded сбрасывается в false и картинка
  // перемигивает через opacity 0→1 даже из кеша.
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (inView && !hasRendered) setHasRendered(true);
  }, [inView, hasRendered]);

  useEffect(() => {
    if (inView && ref.current && heightRef.current === 0) {
      const h = ref.current.getBoundingClientRect().height;
      if (h > 0) {
        heightRef.current = h;
        setMeasuredHeight(h);
      }
    }
  });

  return (
    <div
      ref={ref}
      style={!hasRendered && measuredHeight ? { height: measuredHeight } : undefined}
    >
      {hasRendered ? <FoodItem product={product} index={index} /> : null}
    </div>
  );
};

export default VirtualFoodItem;
