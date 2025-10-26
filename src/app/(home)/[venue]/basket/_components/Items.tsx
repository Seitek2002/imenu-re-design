import { useEffect, useState } from 'react';
import { useBasket } from '@/store/basket';

import Item from './Item';

const Items = () => {
  const [hydrated, setHydrated] = useState(false);
  const { getItemsArray } = useBasket();
  const items = getItemsArray();

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className='bg-white p-3 rounded-[12px] mt-3'>
      {/* <h4 className='text-base font-semibold mb-3'>Товары</h4> */}

      {!hydrated ? (
        <div className='text-sm text-[#80868B]'>Корзина пуста</div>
      ) : items.length === 0 ? (
        <div className='text-sm text-[#80868B]'>Корзина пуста</div>
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
