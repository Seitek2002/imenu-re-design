import Image from 'next/image';
import Header from '../_components/Header';

import logo from '@/assets/History/logo.png';

const History = () => {
  return (
    <>
      <Header title='История заказов' />
      <main className='min-h-svh bg-[#F8F6F7] pt-[20px] pb-[80px]'>
        <div className='flex flex-col gap-2'>
          <div className='bg-[#FFFFFF] p-4 rounded-3xl'>
            <h2 className='font-medium text-2xl mb-3'>Октябрь</h2>
            <div className='flex flex-col gap-3'>
              <div className='p-2.5 rounded-xl flex items-center w-full gap-2 bg-[#F8F8FA]'>
                <div>
                  <Image src={logo} width={76} height={76} alt='logo' />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between text-[#21201F] text-lg font-semibold'>
                    <span>Заказ №12354</span>
                    <span>360 с</span>
                  </div>
                  <span className='text-[#8D8D8D] text-xs'>
                    ул. Юнусалиева, 173/4
                  </span>
                  <div className='text-[#8D8D8D] text-xs'>06.11.2025</div>
                  <span className='text-[#21201F] text-xs'>Доставлен</span>
                </div>
              </div>
              <div className='p-2.5 rounded-xl flex items-center w-full gap-2 bg-[#F8F8FA]'>
                <div>
                  <Image src={logo} width={76} height={76} alt='logo' />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between text-[#21201F] text-lg font-semibold'>
                    <span>Заказ №12354</span>
                    <span>360 с</span>
                  </div>
                  <span className='text-[#8D8D8D] text-xs'>
                    ул. Юнусалиева, 173/4
                  </span>
                  <div className='text-[#8D8D8D] text-xs'>06.11.2025</div>
                  <span className='text-[#21201F] text-xs'>Доставлен</span>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-[#FFFFFF] p-4 rounded-3xl'>
            <h2 className='font-medium text-2xl mb-3'>Сентябрь</h2>
            <div className='flex flex-col gap-3'>
              <div className='p-2.5 rounded-xl flex items-center w-full gap-2 bg-[#F8F8FA]'>
                <div>
                  <Image src={logo} width={76} height={76} alt='logo' />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between text-[#21201F] text-lg font-semibold'>
                    <span>Заказ №12354</span>
                    <span>360 с</span>
                  </div>
                  <span className='text-[#8D8D8D] text-xs'>
                    ул. Юнусалиева, 173/4
                  </span>
                  <div className='text-[#8D8D8D] text-xs'>06.11.2025</div>
                  <span className='text-[#21201F] text-xs'>Доставлен</span>
                </div>
              </div>
              <div className='p-2.5 rounded-xl flex items-center w-full gap-2 bg-[#F8F8FA]'>
                <div>
                  <Image src={logo} width={76} height={76} alt='logo' />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between text-[#21201F] text-lg font-semibold'>
                    <span>Заказ №12354</span>
                    <span>360 с</span>
                  </div>
                  <span className='text-[#8D8D8D] text-xs'>
                    ул. Юнусалиева, 173/4
                  </span>
                  <div className='text-[#8D8D8D] text-xs'>06.11.2025</div>
                  <span className='text-[#21201F] text-xs'>Доставлен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default History;
