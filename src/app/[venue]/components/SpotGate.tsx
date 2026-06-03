'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { useVenueStore, type Venue } from '@/store/venue';
import { useMounted } from '@/hooks/useMounted';
import { readSpotCookieClient, writeSpotCookie } from '@/lib/spot-cookie.client';

/**
 * Обязательный выбор точки для многоточечных заведений.
 *
 * Зачем: цены и наличие модификаторов считаются per-spot (см. lib/pricing). Без
 * выбранной точки `/v2/products/` отдаёт все точки сразу, и витрина показывает
 * неоднозначную цену (карточка «от min», лист — произвольную первую точку). Гейт
 * блокирует меню, пока точка не выбрана, чтобы цена всегда была однозначной.
 *
 * Не показывается при QR/киоск/стол-контексте (точка уже зафиксирована) и для
 * заведений с одной точкой. Заодно гидратирует `spotId` в стор из куки —
 * нужно для deep-link/новой вкладки, где sessionStorage пуст.
 */
export default function SpotGate({ venue }: { venue: Venue }) {
  const t = useTranslations('Spot');
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();

  const spotId = useVenueStore((s) => s.spotId);
  const tableId = useVenueStore((s) => s.tableId);
  const isKioskMode = useVenueStore((s) => s.isKioskMode);
  const setContext = useVenueStore((s) => s.setContext);

  const spots = useMemo(() => venue.spots ?? [], [venue.spots]);

  // Гидратация из куки: если в сторе точки нет, но кука с прошлого выбора жива —
  // подхватываем её, чтобы клиентские цены совпали с SSR и гейт не всплывал.
  // Единственную точку выбираем автоматически: гейт для неё не всплывает
  // (spots.length < 2), но без spotId запрос уходит «по всем точкам» и бэк
  // считает priceFrom по скрытым точкам тоже (см. sierra-group-llc — одна
  // видимая точка, но priceFrom приходит с другой). Фиксируем точку, пишем куку
  // и перечитываем SSR, чтобы цена была честной по ней.
  useEffect(() => {
    if (spotId != null) return;
    const fromCookie = readSpotCookieClient(venue.slug);
    if (fromCookie != null && spots.some((s) => s.id === fromCookie)) {
      setContext({ spotId: fromCookie, venueSlug: venue.slug });
      return;
    }
    if (spots.length === 1) {
      const only = spots[0].id;
      setContext({ spotId: only, venueSlug: venue.slug });
      writeSpotCookie(venue.slug, only);
      router.refresh();
    }
  }, [spotId, venue.slug, spots, setContext, router]);

  if (!mounted) return null;
  // Гейтим только витринные маршруты (где видны per-spot цены): home, products,
  // categories. /cart, /profile, /history, /order-status и пр. не блокируем —
  // напр. ссылка на статус заказа из SMS должна открываться без выбора точки.
  const sub = pathname.split('/').filter(Boolean);
  const after = sub[sub.indexOf(venue.slug) + 1];
  const isMenuRoute =
    after === undefined ||
    after === 'products' ||
    after === 'categories' ||
    /^\d+$/.test(after); // /{venue}/{spotId}[/{tableId}] — главная
  if (!isMenuRoute) return null;
  // Точка уже зафиксирована контекстом QR/стола/киоска — гейт не нужен.
  if (isKioskMode || tableId) return null;
  // Одна точка — цена однозначна и так.
  if (spots.length < 2) return null;
  if (spotId != null) return null;
  // Кука есть — её подхватит эффект на следующем тике; модалку не мигаем.
  const fromCookie = readSpotCookieClient(venue.slug);
  if (fromCookie != null && spots.some((s) => s.id === fromCookie)) return null;

  const handlePick = (id: number) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setContext({ spotId: id, venueSlug: venue.slug });
    writeSpotCookie(venue.slug, id);
    // Перечитываем серверные компоненты текущего URL с новой spot-кукой —
    // SSR-цены и открытый ?product=… лист пересоберутся под выбранную точку.
    router.refresh();
  };

  return (
    <div
      className='fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm'
      role='dialog'
      aria-modal='true'
      aria-label={t('chooseTitle')}
    >
      <div className='w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl animate-fadeIn'>
        <div className='flex items-center gap-2 mb-1'>
          <MapPin size={20} className='text-brand' strokeWidth={2.5} />
          <h2 className='text-[#111111] text-lg font-bold'>
            {t('chooseTitle')}
          </h2>
        </div>
        <p className='text-[#A4A4A4] text-sm mb-4'>{t('chooseSubtitle')}</p>

        <div className='flex flex-col gap-2 max-h-[60svh] overflow-y-auto'>
          {spots.map((spot) => (
            <button
              key={spot.id}
              type='button'
              onClick={() => handlePick(spot.id)}
              className='w-full flex flex-col items-start text-left rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 active:scale-[0.99] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all cursor-pointer'
            >
              <span className='text-[#111111] font-semibold text-sm'>
                {spot.name}
              </span>
              {spot.address && (
                <span className='text-[#A4A4A4] text-xs mt-0.5'>
                  {spot.address}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
