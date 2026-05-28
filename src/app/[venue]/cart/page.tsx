import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import { API_URL } from '@/lib/config';
import type { Locale } from '@/lib/locale';
import type { Product } from '@/types/api';
import CartPageClient from './CartPageClient';

interface CartPageProps {
  params: Promise<{ venue: string }>;
}

// При пустой корзине EmptyBasket показывает рекомендованные товары через
// useVenueProducts(venueSlug). Без prefetch цепочка такая: HTML → JS → React →
// fetch /products → next/image → LCP, что даёт ~5.5s на mobile.
// Prefetch на сервере сразу кладёт продукты в QueryClient, клиент читает их из
// dehydrated-кэша без сетевого round-trip.
async function fetchVenueProductsSSR(
  venueSlug: string,
  locale: Locale,
): Promise<Product[]> {
  const res = await fetch(
    `${API_URL}/v2/products/?venueSlug=${encodeURIComponent(venueSlug)}`,
    { headers: { 'Accept-Language': locale }, next: { revalidate: 60 } },
  );
  if (!res.ok) throw new Error('Failed to prefetch products');
  return res.json();
}

export default async function CartPage({ params }: CartPageProps) {
  const { venue } = await params;
  const locale = (await getLocale()) as Locale;

  const queryClient = new QueryClient();

  // queryKey должен 1-в-1 совпадать с useVenueProducts(venueSlug) в EmptyBasket —
  // spotId на сервере неизвестен, поэтому prefetch валиден только для вызова
  // без spotId; клиент с spotId сделает свой запрос.
  await queryClient
    .prefetchQuery({
      queryKey: ['venue-products', venue, null, locale],
      queryFn: () => fetchVenueProductsSSR(venue, locale),
      staleTime: 1000 * 60 * 5,
    })
    .catch(() => {
      // Не валим страницу, если бэк недоступен — клиент сделает повторный запрос.
    });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CartPageClient />
    </HydrationBoundary>
  );
}
