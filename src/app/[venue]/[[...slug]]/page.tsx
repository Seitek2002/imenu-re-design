import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { parseUrlContext } from '@/lib/url-parser';
import VenueInitializer from '@/components/providers/VenueInitializer';
import MainHeader from '../components/MainHeader';
import HomeLinksSkeleton from '../components/HomeLinksSkeleton';
import HomeLinksSection from '../components/HomeLinksSection';
import Widgets from '../components/Widgets';
import { VenueService } from '@/services/venue.service';

async function getVenueData(slug: string, tableId?: number) {
  // По дефолту обычный URL
  let url = `https://imenu.kg/api/v2/venues/${slug}/`;

  // Если есть ID стола — меняем URL на специальный (получаем и меню, и номер стола)
  if (tableId) {
    url = `https://imenu.kg/api/venues/${slug}/table/${tableId}/`;
  }

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.log(tableId);
    // Можно логировать, но не обязательно ронять всё
    console.error('Fetch error');
    return null;
  }

  return res.json();
}

interface Props {
  params: Promise<{ venue: string; slug?: string[] }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function VenuePage({ params }: Props) {
  const { venue: venueSlug, slug } = await params;
  const { tableId, spotId, isKioskMode } = parseUrlContext(slug);
  const buttonsPromise = VenueService.getMainButtons(venueSlug);

  const venueData = await getVenueData(venueSlug, tableId);

  if (!venueData) {
    notFound();
  }

  return (
    <main className='home px-2.5 bg-[#F8F6F7] min-h-svh pb-32'>
      <VenueInitializer
        venue={venueData}
        tableId={tableId}
        spotId={spotId}
        isKioskMode={isKioskMode}
      />

      <MainHeader />

      <Suspense fallback={<HomeLinksSkeleton />}>
        <HomeLinksSection
          venueSlug={venueSlug}
          buttonsPromise={buttonsPromise}
        />
      </Suspense>

      <Widgets venueSlug={venueSlug} />
    </main>
  );
}
