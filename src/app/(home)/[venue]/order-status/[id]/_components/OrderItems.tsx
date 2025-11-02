import { FC } from 'react';
import Item from '../../../basket/_components/Item';
import { CartItem } from '@/store/basket';

interface IProps {
  isNotFound: boolean;
  orderItemsCount: number;
  itemsFromOrder: CartItem[];
}

const OrderItems: FC<IProps> = ({
  isNotFound,
  orderItemsCount,
  itemsFromOrder,
}) => {
  return (
    <div className='px-4 pt-3'>
      <div className='bg-white rounded-[30px] p-3'>
        <div className='flex justify-between items-center'>
          <span className='font-semibold text-lg'>Мои заказы</span>
          <span className='text-[#727272] text-sm'>
            {orderItemsCount} позиций
          </span>
        </div>
        <div className='content'>
          {isNotFound ? (
            <div className='py-10 text-center text-[#80868B]'>
              <div className='text-base font-semibold text-[#111111]'>
                Заказ не найден
              </div>
              <div className='text-sm mt-1'>
                Такой заказ отсутствует или был удален.
              </div>
            </div>
          ) : (
            <ul className='divide-y mt-3 divide-[#E7E7E7]'>
              {itemsFromOrder.map((it) => (
                <Item key={it.key} it={it} statusMode />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
