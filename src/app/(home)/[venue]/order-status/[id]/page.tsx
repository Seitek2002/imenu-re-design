import OrderStatusView from './OrderStatusView';
import type { OrderByIdResponse, OrderV2 } from '@/lib/api/types';

const API_BASE = 'https://imenu.kg';

async function fetchOrderByIdV2Server(id: string): Promise<OrderV2 | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v2/orders/${encodeURIComponent(id)}/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'ru',
        },
        cache: 'no-store',
      }
    );

    const ct = res.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');

    if (!res.ok) {
      if (isJson) {
        const data: any = await res.json().catch(() => null);
        if (data && typeof data.detail === 'string') return undefined;
      }
      return undefined;
    }

    if (!isJson) return undefined;

    const data = (await res.json()) as OrderByIdResponse;
    if (data && typeof (data as any).detail === 'string') return undefined;
    return data as OrderV2;
  } catch {
    return undefined;
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

const OrderStatusPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const order = await fetchOrderByIdV2Server(id);
  return <OrderStatusView order={order} />;
};

export default OrderStatusPage;
