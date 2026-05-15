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
    <div ref={ref} style={!inView && measuredHeight ? { height: measuredHeight } : undefined}>
      {inView ? <FoodItem product={product} index={index} /> : null}
    </div>
  );
};

export default VirtualFoodItem;
