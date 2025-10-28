import Image from 'next/image';

import clockIcon from '@/assets/Basket/Drawer/clock.svg';
import geoIcon from '@/assets/Basket/Drawer/geo.svg';
import selectArrow from '@/assets/Basket/Drawer/select-arrow.svg';

const TakeOut = () => {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-3'>
        <Image src={clockIcon} alt='clockIcon' />
        <div className='bg-[#F5F5F5] flex items-center justify-between p-4 rounded-lg flex-1'>
          <span className='text-[#A4A4A4]'>Время выдачи</span>
          <Image src={selectArrow} alt='selectArrow' />
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <Image src={geoIcon} alt='geoIcon' />
        <div className='bg-[#F5F5F5] flex items-center justify-between p-4 rounded-lg flex-1'>
          <span className='text-[#A4A4A4]'>Выбрать филиал</span>
          <Image src={selectArrow} alt='selectArrow' />
        </div>
      </div>
    </div>
  );
};

export default TakeOut;
