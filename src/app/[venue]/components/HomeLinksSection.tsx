import { VenueService } from '@/services/venue.service';
import HomeLinks from './HomeLinks';

interface Props {
  venueSlug: string;
}

export default async function HomeLinksSection({ venueSlug }: Props) {
  const mainButtons = await VenueService.getMainButtons(venueSlug);

  return <HomeLinks venueSlug={venueSlug} buttons={mainButtons} />;
}
