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
  return <Header title={title} />;
}

export default async function CategoriesPage({ params }: PageProps) {
  const { venue, id } = await params;
  const locale = (await getLocale()) as Locale;
  const tc = await getTranslations('Categories');
  const fallbackTitle = tc('defaultTitle');
  const sectionId = Number(id);

  return (
    <main className='px-2.5 min-h-svh pb-40 bg-[#F8F6F7]'>
      <Suspense fallback={<Header title={fallbackTitle} />}>
        <ResolvedHeader
          venue={venue}
          sectionId={sectionId}
          locale={locale}
          fallback={fallbackTitle}
        />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoryFetcher venue={venue} id={id} />
      </Suspense>
    </main>
  );
}
