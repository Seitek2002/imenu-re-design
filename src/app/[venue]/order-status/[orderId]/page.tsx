import OrderStatusLive from './components/OrderStatusLive';
import { OrderV2 } from '@/lib/order';
import StatusHeader from './components/StatusHeader';
import OrderNotFound from './components/OrderNotFound';
import OrderSaver from './components/OrderSaver';
import { API_V2_URL } from '@/lib/config';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/locale';

// Функция получения заказа (Серверная)
async function fetchOrder(id: string, locale: Locale): Promise<OrderV2 | null> {
  try {
    const res = await fetch(`${API_V2_URL}/orders/${id}/`, {
      cache: 'no-store', // Всегда свежие данные, чтобы статус обновлялся
      headers: { 'Accept-Language': locale },
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
  const locale = (await getLocale()) as Locale;
  const order = await fetchOrder(orderId, locale);

  if (!order) {
    return <OrderNotFound venueSlug={venue} />;
  }

  return (
    <main className='min-h-svh bg-[#F8F6F7] pb-10'>
      <StatusHeader venueSlug={venue} orderId={order.id} />
      <OrderSaver orderId={order.id} />

      <div className='px-4 pt-2'>
        <OrderStatusLive initialOrder={order} />
      </div>
    </main>
  );
}
