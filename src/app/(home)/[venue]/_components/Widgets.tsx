import Image from 'next/image';

import widget1 from '@/assets/Widgets/widget-1.png';
import widget2 from '@/assets/Widgets/widget-2.png';
import widget3 from '@/assets/Widgets/widget-3.png';

const Widgets = () => {
  return (
    <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-x-auto'>
      <div className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'>
        <h3 className='text-[#0404138C]'>Мои заказы</h3>
        <div className='w-[95px] h-[58px]'>
            <Image src={widget1} alt='widget 1' />
        </div>
      </div>
      {/* <div className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'>
        <h3 className='text-[#0404138C] text-nowrap'>Бонусные баллы</h3>
        <div className='flex items-center mt-2.5'>
            <Image src={widget2} alt='widget 2' width={24} />
            <span className='text-2xl font-extrabold'>2 450</span>
        </div>
      </div> */}
      <div className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'>
        <h3 className='text-[#0404138C] text-nowrap'>График работы</h3>
        <div className='h-[50px]'>
            <Image src={widget3} alt='widget 3' />
        </div>
      </div>
    </div>
  );
};

export default Widgets;
