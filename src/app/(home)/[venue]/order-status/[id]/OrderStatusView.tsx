'use client';

import CurrentStatus from './_components/CurrentStatus';
import Header from './_components/Header';
import type { CartItem } from '@/store/basket';
import { useParams } from 'next/navigation';
import { useOrderByIdV2 } from '@/lib/api/queries';
import OrderItems from './_components/OrderItems';
import OrderDetails from '@/components/OrderDetails';

const OrderStatusView = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useOrderByIdV2(id);
  const isNotFound = !data;

  const itemsFromOrder: CartItem[] = (() => {
    if (!data) return [];
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

  // Суммы для блока "Детали заказа"
  const subtotalFromOrder = data
    ? data.orderProducts.reduce(
        (acc, op) => acc + (Number(op.price) || 0) * op.count,
        0
      )
    : 0;

  // Для доставки показываем доставку как разницу между total и суммой товаров
  const deliveryFee =
    data && data.serviceMode === 3
      ? Math.max(0, (Number(data.totalPrice) || 0) - subtotalFromOrder)
      : 0;

  return (
    <div className='bg-[#F8F6F7] min-h-svh pb-40'>
      <Header />
      <CurrentStatus serviceMode={data?.serviceMode} status={data?.status} />
      <div className='mx-4 mt-4 px-4 py-3 bg-[#fff] rounded-[30px]'>
        {data ? (
          <OrderDetails
            orderType={
              data.serviceMode === 1
                ? 'dinein'
                : data.serviceMode === 3
                ? 'delivery'
                : 'takeout'
            }
            subtotal={subtotalFromOrder}
            deliveryFee={deliveryFee}
            hydrated={true}
          />
        ) : null}
      </div>
      <OrderItems
        isNotFound={isNotFound}
        orderItemsCount={orderItemsCount}
        itemsFromOrder={itemsFromOrder}
      />
    </div>
  );
};

export default OrderStatusView;
