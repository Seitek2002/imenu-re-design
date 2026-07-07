/**
 * Разбивает название размерного модификатора на заголовок и подпись,
 * например "Большой 450 г" → { label: "Большой", sub: "450 г" }.
 * Используется в SizePill для обычных и демо-товаров видео-витрины —
 * вынесено из mock-video-products.ts, чтобы SizePill не тянул мок-данные
 * в основной бандл видео-витрины.
 */
export function parseSizeModName(name: string): {
  label: string;
  sub: string | null;
} {
  const m = name.match(/^(.+?)\s+(\d+\s*[а-яa-z]+)\s*$/i);
  if (m) return { label: m[1].trim(), sub: m[2].trim() };
  return { label: name, sub: null };
}
