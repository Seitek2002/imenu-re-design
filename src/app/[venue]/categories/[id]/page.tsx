import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/app/components/Header';
import SearchOverlay from '@/app/components/SearchOverlay';
import CategoriesSkeleton from './components/CategoriesSkeleton';
import CategoryFetcher from './components/CategoryFetcher';
import { VenueService } from '@/services/venue.service';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

type PageProps = {
  params: Promise<{ venue: string; id: string }>;
};

async function ResolvedHeader({
  venue,
  sectionId,
  locale,
  fallback,
}: {
  venue: string;
  sectionId: number;
  locale: Locale;
  fallback: string;
}) {
  let title = fallback;
  try {
    const buttons = await VenueService.getMainButtons(venue, locale);
    outer: for (const row of buttons) {
      for (const b of row) {
        if (b.section?.id === sectionId) {
          title = b.name;
          break outer;
        }
      }
    }
  } catch {
    /* fallback */
  }
  return <Header title={title} showSearch={true} />;
}

export default async function CategoriesPage({ params }: PageProps) {
  const { venue, id } = await params;
  const locale = (await getLocale()) as Locale;
  const tc = await getTranslations('Categories');
  const fallbackTitle = tc('defaultTitle');
  const sectionId = Number(id);
  if (!Number.isFinite(sectionId)) notFound();

  return (
    <main className='px-2.5 min-h-svh pb-28 bg-[#F8F6F7]'>
      <Suspense fallback={<Header title={fallbackTitle} showSearch={true} />}>
        <ResolvedHeader
          venue={venue}
          sectionId={sectionId}
          locale={locale}
          fallback={fallbackTitle}
        />
      </Suspense>

      <SearchOverlay>
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoryFetcher venue={venue} id={id} />
        </Suspense>
      </SearchOverlay>
    </main>
  );
}
