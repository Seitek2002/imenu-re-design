'use client';

import { FC, ReactNode } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProductStore } from '@/store/product';
import { useVideoProductStore } from '@/store/videoProduct';
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
  const setVideoProduct = useVideoProductStore((state) => state.setProduct);
  const t = useTranslations('Product');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (product.isVideoProduct) {
      setVideoProduct(product);
      params.set('video', product.id.toString());
    } else {
      setProduct(product);
      params.set('product', product.id.toString());
    }

    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
  };

  const href = product.isVideoProduct
    ? `?video=${product.id}`
    : `?product=${product.id}`;

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={t('ariaOpen', { name: product.productName })}
    />
  );
};

export default ProductLink;
