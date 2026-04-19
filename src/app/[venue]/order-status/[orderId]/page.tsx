import StatusProgressBar from './components/StatusProgressBar';
import OrderItemsList from './components/OrderItemsList';
import { OrderV2 } from '@/lib/order';
import StatusHeader from './components/StatusHeader';
import OrderNotFound from './components/OrderNotFound';
import OrderSaver from './components/OrderSaver';
import { API_V2_URL } from '@/lib/config';

// Функция получения заказа (Серверная)
async function fetchOrder(id: string): Promise<OrderV2 | null> {
  try {
    const res = await fetch(`${API_V2_URL}/orders/${id}/`, {
      cache: 'no-store', // Всегда свежие данные, чтобы статус обновлялся
      headers: { 'Accept-Language': 'ru' },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

interface Props {
  params: Promise<{ venue: string; orderId: string }>;
}

export default async function OrderStatusPage({ params }: Props) {
  const { venue, orderId } = await params;
  const order = await fetchOrder(orderId);

  if (!order) {
    return <OrderNotFound venueSlug={venue} />;
  }

  return (
    <main className='min-h-svh bg-[#F8F6F7] pb-10'>
      {/* Хедер страницы */}
      <StatusHeader venueSlug={venue} orderId={order.id} />
      <OrderSaver orderId={order.id} />

      <div className='px-4 pt-2'>
        {/* 1. Статус бар */}
        <StatusProgressBar
          serviceMode={order.serviceMode}
          status={order.status}
        />

        {/* 2. Список товаров */}
        <OrderItemsList items={order.orderProducts} />

        {/* 3. Итого (простая карточка) */}
        <div className='bg-white rounded-[20px] p-5 mt-4 shadow-sm flex justify-between items-center'>
          <span className='text-gray-500 font-medium'>Итого к оплате:</span>
          <span className='text-2xl font-bold text-brand'>
            {order.totalPrice} с.
          </span>
        </div>
      </div>
    </main>
  );
}
