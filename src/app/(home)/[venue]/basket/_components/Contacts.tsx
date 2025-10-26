import { FC } from 'react';
import Image from 'next/image';

import warningIcon from '@/assets/Basket/warning.svg';

interface IProps {
  setPhone: (phone: string) => void;
  setAddress: (address: string) => void;
  orderType: 'takeout' | 'dinein' | 'delivery';
  phone: string;
  address: string;
}

const Contacts: FC<IProps> = ({
  setPhone,
  setAddress,
  orderType,
  phone,
  address,
}) => {
  const isPhoneValid = phone.trim().length >= 5;
  const isAddressValid =
    orderType === 'delivery' ? address.trim().length > 0 : true;

  return (
    <div className='bg-[#FAFAFA] p-3 rounded-[12px] mt-3'>
      <div className='flex justify-between items-center mb-3'>
        <h4 className='text-base font-semibold'>Ваши данные к заказу</h4>
        <Image
          src={warningIcon}
          alt='warningIcon'
          style={{
            display: !isPhoneValid ? 'inline' : 'none',
          }}
        />
      </div>
      <label htmlFor='phone' className='block space-y-1 mb-3'>
        <input
          id='phone'
          type='text'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='+996'
          className='w-full h-11 rounded-xl p-4 outline-none border border-[transparent] bg-[#F5F5F5]'
          style={{
            borderColor: isPhoneValid ? '' : 'red',
          }}
        />
      </label>

      {/* Адрес только для "Доставка" */}
      {orderType === 'delivery' && (
        <label htmlFor='address' className='block space-y-1 mb-3'>
          <input
            id='address'
            type='text'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder='Укажите адрес'
            className='w-full h-11 rounded-xl p-4 outline-none focus:border-[#FF7A00] bg-[#F5F5F5]'
            style={{
              border:
                orderType === 'delivery' && !isAddressValid
                  ? '1px solid red'
                  : undefined,
            }}
          />
        </label>
      )}
    </div>
  );
};

export default Contacts;
