import { useEffect, useState } from 'react';
import { useBasket } from '@/store/basket';

import Item from './Item';
import Image from 'next/image';
import emptyIllustration from '@/assets/Basket/empty.svg';
import { useTranslation } from 'react-i18next';

const Items = () => {
  const [hydrated, setHydrated] = useState(false);
  const { getItemsArray } = useBasket();
  const items = getItemsArray();
  const { t } = useTranslation();

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className='bg-white p-3 rounded-[12px]'>
      {/* <h4 className='text-base font-semibold mb-3'>Товары</h4> */}

      {!hydrated ? (
        <div className='py-8' aria-hidden />
      ) : items.length === 0 ? (
        <div className='flex flex-col items-center text-center py-8'>
          <Image src={emptyIllustration} alt='' width={160} height={160} className='mb-4' />
          <div className='text-base font-semibold text-[#111111]'>{t('basketEmptyTitle')}</div>
          <div className='text-sm text-[#80868B] mt-1'>{t('basketEmptySubtitle')}</div>
        </div>
      ) : (
        <ul className='divide-y divide-[#E7E7E7]'>
          {items.map((it) => (
            <Item key={it.key} it={it} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Items;
