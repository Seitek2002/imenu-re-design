import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next'; // 1. Импортируем тип
import { getLocale, getTranslations } from 'next-intl/server';
import Footer from '../components/Footer';
import MainAction from './components/MainAction';
import FloatingCartButton from './components/FloatingCartButton';
import VenueInitializer from '@/components/providers/VenueInitializer';
import { API_V2_URL } from '@/lib/config';
import type { Locale } from '@/lib/locale';

const ProductSheet = dynamic(
  () => import('./products/[slug]/components/ProductSheet'),
);

async function getVenueData(slug: string, locale: Locale) {
  try {
    const res = await fetch(`${API_V2_URL}/venues/${slug}/`, {
      next: { revalidate: 60 },
      headers: { 'Accept-Language': locale },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: venueSlug } = await params;
  const locale = (await getLocale()) as Locale;
  const [data, t] = await Promise.all([
    getVenueData(venueSlug, locale),
    getTranslations('Meta'),
  ]);

  if (!data) {
    return {
      title: t('venueNotFound'),
    };
  }

  return {
    title: data.companyName,
    description: data.description || t('venueMenuFallback', { name: data.companyName }),
    icons: data.logo
      ? {
          icon: [{ url: data.logo, type: 'image/png' }],
          apple: [
            { url: data.logo, type: 'image/png' }, // Добавит красивую иконку при сохранении на экран iPhone
          ],
        }
      : undefined,
    openGraph: {
      title: data.companyName,
      description: data.description || t('venueOgFallback', { name: data.companyName }),
      images: [data.logo || '/default-venue-logo.png'],
    },
  };
}

export default async function VenueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ venue: string }>;
}) {
  const { venue: venueSlug } = await params;
  const locale = (await getLocale()) as Locale;
  const venueData = await getVenueData(venueSlug, locale);

  if (!venueData) {
    notFound();
  }

  return (
    <div className='relative min-h-svh bg-[#F8F6F7]'>
      <div>{children}</div>

      <Suspense fallback={null}>
        <ProductSheet />
      </Suspense>

      <VenueInitializer venue={venueData} />
      <FloatingCartButton venueSlug={venueSlug} />
      <MainAction venueSlug={venueSlug} />
      <Footer venueSlug={venueSlug} />
    </div>
  );
}
