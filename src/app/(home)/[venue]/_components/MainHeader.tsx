import Image from 'next/image';

import LanguageDropdown from './LanguageDropdown';

import venueLogo from '@/assets/Header/venue-logo.png';
import venueName from '@/assets/Header/venue-name.png';
import wifiIcon from '@/assets/Header/wifi-icon.svg';
import searchIcon from '@/assets/Header/search.svg';

const MainHeader = () => {
  return (
    <header className='header-main flex justify-between items-center px-4 py-4 rounded-b-4xl bg-white'>
      <div className='header-left flex items-center'>
        <Image width={40} src={venueLogo} alt='venue logo' />
        <div className='flex flex-col'>
          <Image width={90} src={venueName} alt='venue name' />
          <span className='font-cruinn-tw font-bold text-[10px]'>
            Работает на iMenu.kg
          </span>
        </div>
      </div>
      <div className='header-btns flex gap-[4px]'>
        <div className='header-icon'>
          <Image src={wifiIcon} alt='wifi icon' />
        </div>
        <div className='header-icon'>
          <Image src={searchIcon} alt='search icon' />
        </div>
        <LanguageDropdown />
      </div>
    </header>
  );
};

export default MainHeader;
