import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import warningIcon from '@/assets/Basket/warning.svg';
import { useCheckout } from '@/store/checkout';

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

  // Shake on demand (from store signal) — only after button press AND if invalid
  const shakeKey = useCheckout((s) => s.shakeKey);
  const [shaking, setShaking] = useState(false);
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true; // skip initial render to avoid shaking on reload
      return;
    }
    const requireAddress = orderType === 'delivery';
    const invalid = !isPhoneValid || (requireAddress && !isAddressValid);
    if (!invalid) return; // shake only when something is missing
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 500);
    return () => clearTimeout(t);
  }, [shakeKey, isPhoneValid, isAddressValid, orderType]);

  return (
    <div
      id='contacts-card'
      className={`bg-[#FAFAFA] p-3 rounded-[12px] mt-3 ${
        shaking ? 'shake-animate' : ''
      }`}
    >
      <div className='flex justify-between items-center mb-3'>
        <h4 className='text-base font-semibold'>Ваши данные к заказу</h4>
        <Image
          src={warningIcon}
          alt='warningIcon'
          style={{
            display: !!isPhoneValid && !!isAddressValid ? 'none' : 'inline',
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
            className='w-full h-11 rounded-xl p-4 outline-none focus:border-brand bg-[#F5F5F5]'
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
