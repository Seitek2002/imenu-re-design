import { notFound } from 'next/navigation';
import type { Metadata } from 'next'; // 1. Импортируем тип
import Footer from '../components/Footer';
import MainAction from './components/MainAction';
import FloatingCartButton from './components/FloatingCartButton';
import VenueInitializer from '@/components/providers/VenueInitializer';

async function getVenueData(slug: string) {
  try {
    const res = await fetch(`https://imenu.kg/api/v2/venues/${slug}/`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// 2. 🔥 ГЕНЕРАЦИЯ МЕТАДАННЫХ (SEO)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: venueSlug } = await params;
  const data = await getVenueData(venueSlug);

  if (!data) {
    return {
      title: 'Заведение не найдено',
    };
  }

  return {
    title: data.companyName,
    description: data.description || `Меню ресторана ${data.companyName}`,
    openGraph: {
      title: data.companyName,
      description: data.description || `Вкусные блюда в ${data.companyName}`,
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
  const venueData = await getVenueData(venueSlug);

  if (!venueData) {
    notFound();
  }

  return (
    <div className='relative min-h-svh bg-[#F8F6F7]'>
      <div>{children}</div>

      <VenueInitializer venue={venueData} />
      <FloatingCartButton venueSlug={venueSlug} />
      <MainAction venueSlug={venueSlug} />
      <Footer venueSlug={venueSlug} />
    </div>
  );
}
