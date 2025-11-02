'use client';

import CurrentStatus from './_components/CurrentStatus';
import Header from './_components/Header';
import type { CartItem } from '@/store/basket';
import { useParams } from 'next/navigation';
import { useOrderByIdV2 } from '@/lib/api/queries';
import { isApiErrorDetail } from '@/lib/api/types';
import OrderItems from './_components/OrderItems';

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
      <OrderItems
        isNotFound={isNotFound}
        orderItemsCount={orderItemsCount}
        itemsFromOrder={itemsFromOrder}
      />
    </div>
  );
};

export default OrderStatusView;
