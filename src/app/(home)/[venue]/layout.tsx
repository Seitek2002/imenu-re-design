import type { Metadata } from 'next';

import Footer from './_components/Footer/Footer';
import Prefetcher from './Prefetcher';
import ThemeColor from './ThemeColor';
import TabletGate from './TabletGate';
import TabletModeEnforcer from './TabletModeEnforcer';
import { canonicalizeVenueSlug } from '@/lib/utils/slug';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: slug } = await params;
  const canonical = canonicalizeVenueSlug(slug);

  try {
    const res = await fetch(
      `https://imenu.kg/api/v2/venues/${encodeURIComponent(canonical)}/`,
      {
        // ISR: обновление метаданных раз в 5 минут
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch venue: ${res.status}`);
    }

    const venue = await res.json();

    const title = venue?.companyName || 'iMenu.kg';
    const description: string | undefined = venue?.description || undefined;
    const logo: string | undefined = venue?.logo || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: logo ? [{ url: logo }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: logo ? [logo] : undefined,
      },
      icons: { icon: logo },
    };
  } catch {
    return {
      title: 'QR menu',
    };
  }
}

export default async function VenueLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ venue: string }> }>) {
  const { venue } = await params;

  return (
    <div className='max-w-[700px] mx-auto relative'>
      <ThemeColor />
      <TabletGate />
      <TabletModeEnforcer />
      {children}
      <Prefetcher />
      <Footer />
    </div>
  );
}
