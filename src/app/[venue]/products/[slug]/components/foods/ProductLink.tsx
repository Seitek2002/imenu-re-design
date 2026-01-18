'use client';

import { FC, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useProductStore } from '@/store/product';
import { Product } from '@/types/api';

interface Props {
  product: Product;
  children?: ReactNode;
  className?: string;
}

const ProductLink: FC<Props> = ({ product, className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setProduct = useProductStore((state) => state.setProduct);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Отменяем стандартный переход, чтобы сделать всё самим

    // 1. МГНОВЕННО записываем данные в стор
    setProduct(product);

    // 2. Меняем URL (открываем модалку)
    const params = new URLSearchParams(searchParams.toString());
    params.set('product', product.id.toString());

    // scroll: false — чтобы не прыгало вверх
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <a
      href={`?product=${product.id}`} // Для SEO и открытии в новой вкладке
      onClick={handleClick}
      className={className}
      aria-label={`Открыть ${product.productName}`}
    />
  );
};

export default ProductLink;
