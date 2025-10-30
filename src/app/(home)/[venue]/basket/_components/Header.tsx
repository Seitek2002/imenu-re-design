'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBasket } from '@/store/basket';

import arrowIcon from '@/assets/Header/arrow.svg';
import trashIcon from '@/assets/Basket/trash.svg';
import { useVenueQuery } from '@/store/venue';
import tableIcon from '@/assets/Basket/table.svg';

const Header = () => {
  const router = useRouter();
  const { clear } = useBasket();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { tableNum, tableId } = useVenueQuery();
  const displayTable = tableNum ?? tableId;

  function handleClearConfirm() {
    clear();
    setConfirmOpen(false);
  }

  return (
    <header className='sticky top-0 z-10 bg-white rounded-b-4xl'>
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
          onClick={() => setConfirmOpen(true)}
          aria-label='Очистить корзину'
        >
          <Image src={trashIcon} alt='trashIcon' />
        </button>
      </div>

      {displayTable != null && (
        <div className='flex justify-center pb-3'>
          <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-md'>
            <Image src={tableIcon} alt='table icon' width={16} height={16} />
            <span className='text-[#FF7A00] font-semibold'>Стол №{displayTable}</span>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-xl'>
            <div className='text-xl font-semibold text-center mb-4'>
              Очистить корзину?
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={handleClearConfirm}
                className='py-3 px-6 rounded-[10px] bg-[#F5F5F5] text-[#111111] font-semibold'
              >
                Да
              </button>
              <button
                type='button'
                onClick={() => setConfirmOpen(false)}
                className='py-3 px-6 rounded-[10px] text-white font-semibold'
                style={{ backgroundColor: '#FF7A00' }}
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
