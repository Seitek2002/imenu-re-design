import { Metadata } from 'next';
import { Suspense } from 'react';

import Header from '@/app/components/Header'; // Твой обновленный Header с лупой
import ContentSkeleton from './components/ContentSkeleton';
import ProductContentFetcher from './components/ProductContentFetcher';
import ProductsContentWrapper from './ProductsContentWrapper';

interface Props {
  params: Promise<{ venue: string; slug: string }>;
  searchParams: Promise<{ title?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { venue } = await params;
  const { title } = await searchParams;

  const pageTitle = title
    ? `${decodeURIComponent(title)} - Меню ${venue}`
    : `Меню ${venue}`;

  return {
    title: pageTitle,
    description: `Заказывайте вкусную еду в ${venue}.`,
  };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { venue, slug } = await params;

  // Получаем заголовок для Хедера (например, ?title=Завтраки)
  const { title } = await searchParams;
  const displayTitle = title ? decodeURIComponent(title) : 'Меню';

  return (
    <main className='px-2.5 min-h-svh pb-32 bg-[#F8F6F7]'>
      {/* 1. Header всегда виден.
         Передаем showSearch={true}, чтобы появилась лупа.
      */}
      <Header title={displayTitle} showSearch={true} />

      {/* Модалка товара теперь живет в [venue]/layout.tsx */}

      {/* 3. А вот контент теперь "умный".
         Обертка решит: показать Skeleton/Fetcher или Поиск.
      */}
      <ProductsContentWrapper>
        <Suspense fallback={<ContentSkeleton />}>
          <ProductContentFetcher venue={venue} slug={slug} />
        </Suspense>
      </ProductsContentWrapper>
    </main>
  );
}
