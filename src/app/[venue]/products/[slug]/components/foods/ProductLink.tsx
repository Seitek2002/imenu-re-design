'use client';

import { FC, ReactNode } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useProductStore } from '@/store/product';
import { Product } from '@/types/api';

interface Props {
  product: Product;
  children?: ReactNode;
  className?: string;
}

const ProductLink: FC<Props> = ({ product, className }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setProduct = useProductStore((state) => state.setProduct);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // 1. МГНОВЕННО записываем данные в стор (это триггерит анимацию модалки)
    setProduct(product);

    // 2. Меняем URL без запроса к серверу
    const params = new URLSearchParams(searchParams.toString());
    params.set('product', product.id.toString());
    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
  };

  return (
    <a
      href={`?product=${product.id}`}
      onClick={handleClick}
      className={className}
      aria-label={`Открыть ${product.productName}`}
    />
  );
};

export default ProductLink;
