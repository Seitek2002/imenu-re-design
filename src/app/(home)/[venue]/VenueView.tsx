// Apply dynamic brand color based on venue.colorTheme
import ThemeColor from './ThemeColor';
import HomeLinks from './_components/HomeLinks';
import MainHeader from './_components/MainHeader';
import Widgets from './_components/Widgets';

import './style.css';

const VenueView = ({ venueSlug }: { venueSlug: string }) => {
  return (
    <main className='home px-2.5 bg-[#F8F6F7] min-h-svh pb-60'>
      <ThemeColor />
      <MainHeader />
      <HomeLinks venueSlug={venueSlug} />
      <Widgets />
    </main>
  );
};

export default VenueView;
