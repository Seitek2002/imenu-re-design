interface ParsedContext {
  spotId?: number;
  tableId?: number;
  isKioskMode: boolean;
}

export function parseUrlContext(slug: string[] | undefined): ParsedContext {
  const result: ParsedContext = {
    isKioskMode: false,
    spotId: undefined,
    tableId: undefined,
  };

  if (!slug || slug.length === 0) return result;

  // 1. ПРОВЕРКА НА КИОСК (/d/19/84)
  if (slug[0] === 'd') {
    result.isKioskMode = true;

    // Сдвигаем индексы на 1, так как 'd' занимает нулевое место
    if (slug[1]) result.spotId = Number(slug[1]); // 19 - это Спот
    if (slug[2]) result.tableId = Number(slug[2]); // 84 - это Стол (нужен для API)

    return result;
  }

  // 2. ОБЫЧНЫЙ РЕЖИМ (/19/84)
  // slug[0] = 19 (Спот)
  // slug[1] = 84 (Стол)

  if (slug[0]) result.spotId = Number(slug[0]); // <-- Первая цифра в Spot
  if (slug[1]) result.tableId = Number(slug[1]); // <-- Вторая цифра в Table

  return result;
}
