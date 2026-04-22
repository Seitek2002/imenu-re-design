import { Suspense } from 'react';
import Header from '@/app/components/Header';
import CategoriesSkeleton from './components/CategoriesSkeleton';
import CategoryFetcher from './components/CategoryFetcher';
import { VenueService } from '@/services/venue.service';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

type PageProps = {
  params: Promise<{ venue: string; id: string }>;
};

async function resolveSectionName(
  venue: string,
  sectionId: number,
  locale: Locale,
): Promise<string | null> {
  try {
    const buttons = await VenueService.getMainButtons(venue, locale);
    for (const row of buttons) {
      for (const b of row) {
        if (b.section?.id === sectionId) return b.name;
      }
    }
  } catch {
    /* fallback на дефолт */
  }
  return null;
}

export default async function CategoriesPage({ params }: PageProps) {
  const { venue, id } = await params;
  const locale = (await getLocale()) as Locale;
  const tc = await getTranslations('Categories');
  const title = (await resolveSectionName(venue, Number(id), locale)) ?? tc('defaultTitle');

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
