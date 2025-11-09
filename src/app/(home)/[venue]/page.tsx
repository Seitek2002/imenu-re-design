import VenueView from './VenueView';

export default async function VenuePage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue } = await params;
  return <VenueView venueSlug={venue} />;
}
