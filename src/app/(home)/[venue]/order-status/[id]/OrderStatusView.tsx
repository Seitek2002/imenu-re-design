'use client';

import CurrentStatus from './_components/CurrentStatus';
import Header from './_components/Header';
import Item from '@/app/(home)/[venue]/basket/_components/Item';
import type { CartItem } from '@/store/basket';
import { useParams } from 'next/navigation';
import { useOrderByIdV2 } from '@/lib/api/queries';
import { isApiErrorDetail } from '@/lib/api/types';

const OrderStatusView = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useOrderByIdV2(id as unknown as any);
  const isNotFound = !!data && isApiErrorDetail(data);

  const itemsFromOrder: CartItem[] = (() => {
    if (!data || isApiErrorDetail(data)) return [];
    return data.orderProducts.map((op) => {
      const p = op.product;
      const image =
        p.productPhotoSmall ||
        p.productPhoto ||
        p.productPhotoLarge ||
        undefined;
      return {
        key: `${p.id},${op.modificator ?? 0}`,
        productId: p.id,
        modifierId: op.modificator ?? null,
        name: p.productName,
        modifierName: undefined,
        unitPrice: Number(op.price) || 0,
        quantity: op.count,
        image,
      };
    });
  })();

  const orderItemsCount = itemsFromOrder.reduce(
    (acc, it) => acc + it.quantity,
    0
  );

  return (
    <div className='bg-[#F8F6F7] min-h-svh pb-40'>
      <Header />
      <CurrentStatus />
      <div className=' px-4 pt-3'>
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
    </div>
  );
};

export default OrderStatusView;
