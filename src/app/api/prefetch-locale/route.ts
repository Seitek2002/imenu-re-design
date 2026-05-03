import { NextRequest, NextResponse } from 'next/server';
import { API_V2_URL } from '@/lib/config';
import { isLocale } from '@/lib/locale';
import { VenueService } from '@/services/venue.service';

// Прогревает Next Data Cache для заданной локали: серверные fetch'и
// уходят с Accept-Language того языка, и Next кладёт ответы в кэш по
// ключу URL+headers. Когда пользователь реально переключит язык,
// router.refresh() отрисует страницу из памяти без сетевых походов.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venue = searchParams.get('venue');
  const locale = searchParams.get('locale');

  if (!venue || !isLocale(locale)) {
    return new NextResponse('bad request', { status: 400 });
  }

  await Promise.allSettled([
    fetch(`${API_V2_URL}/venues/${venue}/`, {
      next: { revalidate: 60 },
      headers: { 'Accept-Language': locale },
    }).then((r) => r.text()),
    VenueService.getMainButtons(venue, locale),
  ]);

  return new NextResponse(null, { status: 204 });
}
