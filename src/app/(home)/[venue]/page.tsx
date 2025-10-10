import VenueView from './VenueView';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { venue: string };
}): Promise<Metadata> {
  const paramsRest = await params;
  const slug = paramsRest.venue;

  try {
    const res = await fetch(
      `https://imenu.kg/api/v2/venues/${encodeURIComponent(slug)}/`,
      {
        // ISR: обновление метаданных раз в 5 минут
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch venue: ${res.status}`);
    }

    const venue = await res.json();

    const title = venue?.companyName || 'QR menu';
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
      icons: logo ? { icon: logo } : undefined,
    };
  } catch {
    return {
      title: 'QR menu',
    };
  }
}

const VenuePage = () => <VenueView />;

export default VenuePage;
