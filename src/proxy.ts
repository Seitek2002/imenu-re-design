import { NextRequest, NextResponse } from 'next/server';

// CSP nonce на запрос — Next.js сам находит его в заголовке Content-Security-Policy
// запроса и проставляет во все свои скрипты (framework chunks, RSC-payload,
// next/script), см. https://nextjs.org/docs/app/guides/content-security-policy.
//
// CSP_ENFORCE=1 переключает с Report-Only (только пишет в консоль браузера,
// ничего не блокирует) на реальную блокировку — включать только после того,
// как в проде не останется чужих (не наших) варнингов в консоли/DevTools.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const enforce = process.env.CSP_ENFORCE === '1';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://api-maps.yandex.ru${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://imenu.kg https://joinposter.com https://tile.openstreetmap.org https://*.maps.yandex.net https://yastatic.net;
    font-src 'self' data:;
    media-src 'self' https://imenu.kg;
    connect-src 'self' https://imenu.kg wss://imenu.kg https://api-maps.yandex.ru https://geocode-maps.yandex.ru;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `;
  const policy = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Всегда некорректирующий заголовок в запросе — Next.js парсит именно
  // это имя для извлечения nonce при рендере, независимо от enforce/report-only.
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    policy,
  );
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
