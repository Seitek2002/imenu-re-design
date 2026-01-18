import { Suspense } from 'react';
import Header from '@/app/components/Header'; // Или MainHeader
import CategoriesSkeleton from './components/CategoriesSkeleton';
import CategoryFetcher from './components/CategoryFetcher';

type PageProps = {
  params: Promise<{ venue: string; id: string }>;
  searchParams: Promise<{ title?: string }>;
};

export default async function CategoriesPage({
  params,
  searchParams,
}: PageProps) {
  const { venue, id } = await params;
  const sp = (await searchParams) ?? {};
  const title = (sp.title ?? 'Меню') as string;

  return (
    <main className='px-2.5 min-h-svh pb-40 bg-[#F8F6F7]'>
      <Header title={title} />

      {/* Пока CategoryFetcher грузит данные, виден CategoriesSkeleton */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoryFetcher venue={venue} id={id} />
      </Suspense>
    </main>
  );
}
