import Image from 'next/image';
import { useRouter } from 'next/navigation';

import arrowIcon from '@/assets/Header/arrow.svg';
import trashIcon from '@/assets/Basket/trash.svg';

const Header = () => {
  const router = useRouter();

  return (
    <header className='sticky top-0 z-20 bg-white rounded-b-4xl'>
      <div className='flex items-center justify-between px-5 pt-2.5 pb-4'>
        <Image
          src={arrowIcon}
          width={24}
          height={24}
          alt='Назад'
          className='cursor-pointer'
          onClick={() => router.back()}
        />
        <h2 className='text-2xl font-semibold'>Корзина</h2>
        {/* Placeholder for "очистить корзину" (только UI) */}
        <button
          type='button'
          className='text-[#FF7A00] text-sm font-medium'
          onClick={() => {
            // UI-only: нет действий
          }}
        >
          <Image src={trashIcon} alt='trashIcon' />
        </button>
      </div>
    </header>
  );
};

export default Header;
