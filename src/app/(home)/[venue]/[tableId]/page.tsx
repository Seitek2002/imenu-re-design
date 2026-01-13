import VenueGate from './VenueGate';
import VenueView from '../VenueView';
import { canonicalizeVenueSlug } from '@/lib/utils/slug';

export default async function VenueWithTableId({
  params,
}: {
  params: Promise<{ venue: string; tableId: string }>;
}) {
  const { venue, tableId } = await params;
  if (tableId?.toLowerCase() === 'd') {
    // Kiosk route: render venue home without redirect
    return <VenueView venueSlug={canonicalizeVenueSlug(venue)} />;
  }
  return <VenueGate />;
}
