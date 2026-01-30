import HomeLinks from './HomeLinks';
import { MainButton } from '@/types/api';

interface Props {
  venueSlug: string;
  buttonsPromise: Promise<MainButton[][]>;
}

export default async function HomeLinksSection({ venueSlug, buttonsPromise }: Props) {
  const mainButtons = await buttonsPromise;

  return <HomeLinks venueSlug={venueSlug} buttons={mainButtons} />;
}
