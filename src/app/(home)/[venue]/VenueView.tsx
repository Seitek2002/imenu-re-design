import HomeLinks from './_components/HomeLinks';
import MainHeader from './_components/MainHeader';
import Widgets from './_components/Widgets';

import './style.css';

const VenueView = () => {
  return (
    <main className='home px-2.5 bg-[#F8F6F7] min-h-svh pb-70'>
      <MainHeader />
      <HomeLinks />
      <Widgets />
    </main>
  );
};

export default VenueView;
