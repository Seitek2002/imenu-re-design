// Хосты, разрешённые для next/image (см. remotePatterns в next.config.ts).
// next/image бросает синхронно на рендере, если hostname не в этом списке —
// onError такие ошибки НЕ ловит, поэтому плохой src нельзя пускать в компонент.
const ALLOWED_IMAGE_HOSTS = new Set(['imenu.kg', 'joinposter.com']);

/**
 * Возвращает безопасный src для next/image. Битые URL (например, бэкендный
 * `https://joinposter.comNone` — склейка хоста со строкой "None") роняли всю
 * страницу меню через `hostname ... is not configured`. Невалидный или
 * незаявленный хост заменяем на fallback.
 *
 * Локальные пути (`/...`) и StaticImageData пропускаем как есть.
 */
export function safeImageSrc<T>(
  src: string | T | null | undefined,
  fallback: T,
): string | T {
  if (src == null) return fallback;
  // StaticImageData / любой не-строковый источник — доверяем сборщику.
  if (typeof src !== 'string') return src;
  if (src === '') return fallback;
  // Локальные ассеты и data-URL не проходят через remotePatterns.
  if (src.startsWith('/') || src.startsWith('data:')) return src;

  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallback;
    if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) return fallback;
    return src;
  } catch {
    return fallback;
  }
}
