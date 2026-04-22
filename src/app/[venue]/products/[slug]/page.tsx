import { Metadata } from 'next';
import { Suspense } from 'react';

import Header from '@/app/components/Header'; // Твой обновленный Header с лупой
import ContentSkeleton from './components/ContentSkeleton';
import ProductContentFetcher from './components/ProductContentFetcher';
import ProductsContentWrapper from './ProductsContentWrapper';
import { VenueService } from '@/services/venue.service';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

interface Props {
  params: Promise<{ venue: string; slug: string }>;
  searchParams: Promise<{ title?: string }>;
}

// Находит категорию по slug во всех main-buttons (учитывая children).
// Запрос кешируется в apiClient, поэтому повторный вызов не бьёт по сети.
async function resolveCategoryName(
  venue: string,
  slug: string,
  locale: Locale,
): Promise<string | null> {
  try {
    const buttons = await VenueService.getMainButtons(venue, locale);
    for (const row of buttons) {
      for (const b of row) {
        for (const c of b.categories ?? []) {
          if (c.slug === slug) return c.categoryName;
          for (const child of c.children ?? []) {
            if (child.slug === slug) return child.categoryName;
          }
        }
      }
    }
  } catch {
    /* при ошибке падаем на дефолт */
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue, slug } = await params;
  const locale = (await getLocale()) as Locale;
  const [name, t] = await Promise.all([
    resolveCategoryName(venue, slug, locale),
    getTranslations('Meta'),
  ]);

  const pageTitle = name
    ? t('categoryPageTitle', { name, venue })
    : t('menuPageTitle', { venue });

  return {
    title: pageTitle,
    description: t('categoryDesc', { venue }),
  };
}

export default async function ProductsPage({ params }: Props) {
  const { venue, slug } = await params;
  const locale = (await getLocale()) as Locale;
  const tc = await getTranslations('Categories');

  const displayTitle = (await resolveCategoryName(venue, slug, locale)) ?? tc('defaultTitle');

  return (
    <main className='px-2.5 min-h-svh pb-32 bg-[#F8F6F7]'>
      <Header title={displayTitle} showSearch={true} />

      {/* Модалка товара теперь живет в [venue]/layout.tsx */}

      <ProductsContentWrapper>
        <Suspense fallback={<ContentSkeleton />}>
          <ProductContentFetcher venue={venue} slug={slug} />
        </Suspense>
      </ProductsContentWrapper>
    </main>
  );
}
