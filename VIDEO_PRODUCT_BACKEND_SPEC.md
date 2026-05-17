# Video Product — Backend Spec

> Документ для бэкенд-разработчика. Описывает новый тип блюда «с видео-витриной»  
> и изменения в API/модели данных, необходимые для его поддержки.

---

## Контекст

Сейчас в iMenu существуют **обычные товары** (Product). Мы добавляем **видео-товары** — премиум-позиции, у которых в карточке проигрывается фоновое видео, расширенные модификаторы отображаются красивой full-screen витриной, и есть дополнительный контент (описание разделами, «Айс версия» и т.п.).

**Видео-товар — это тот же Product**, только с дополнительными полями.  
В обычном меню он отображается карточкой как все, только в ней дополнительно проигрывается короткое видео-превью.  
При клике открывается VideoProductSheet вместо обычного ProductSheet.

---

## Как определить «видео-товар»

В **админке** при создании/редактировании блюда добавляется **тоггл «Витрина с видео»** (например, флаг `isVideoProduct: bool`).

Когда тоггл **включён**, в форме появляются дополнительные поля:
- Видео (короткое, ~5 сек — для превью в каталоге)
- Видео (длинное, ~10–15 сек — для full-screen витрины)
- Расширенное описание (несколько разделов)
- Варианты (например, «Айс версия» — ссылка на другой Product)

---

## Изменения в модели Product

### Новые поля (добавить в `Product`)

```typescript
interface Product {
  // ... существующие поля без изменений ...

  // ── Видео-витрина ─────────────────────────────────────────────
  /** Включена ли видео-витрина для этого блюда */
  isVideoProduct?: boolean;

  /** Короткое видео (~5 сек) — проигрывается в карточке каталога (muted, loop) */
  productVideo?: string | null;         // URL

  /** Длинное видео (~10–15 сек) — фон full-screen листинга */
  productVideoLarge?: string | null;    // URL

  /** Постер первого кадра для `productVideoLarge` — показывается пока видео грузится */
  productVideoPoster?: string | null;   // URL

  /** Расширенный контент для листка «Подробнее» */
  productDetails?: ProductDetails | null;

  /**
   * ID товара-альтернативы для кнопки «Айс версия» / «Горячая версия».
   * Если задан — в витрине показывается чип со ссылкой на альтернативную версию.
   * Чип называется «Айс версия» если текущий товар — горячий, и «Горячая версия» наоборот.
   * Фронт определяет название из поля `iceVersionChip.label` (см. ниже).
   * Если поле отсутствует — чип не показывается.
   */
  iceVersionId?: number | null;

  /**
   * Визуальные данные чипа «Айс/Горячая версия».
   * Не генерировать автоматически — задаётся в админке.
   */
  iceVersionChip?: {
    label: string;        // «Айс версия» или «Горячая версия»
    photo?: string | null; // фото для чипа
  } | null;

  /**
   * Полные данные альтернативного товара — встраиваются в ответ,
   * чтобы фронт не делал второй запрос при открытии bottom sheet.
   * Заполняется автоматически бэком на основе iceVersionId.
   */
  iceVersion?: Product | null;
}
```

### Новые связанные типы

```typescript
/** Контент листка «Подробнее» */
interface ProductDetails {
  fullTitle: string;
  description: string;
  sections: ProductDetailSection[];
}

interface ProductDetailSection {
  heading: string;
  body: string;
}
```

---

## Как это работает на фронте

| Поле | Где используется |
|------|-----------------|
| `isVideoProduct` | Флаг выбора: открывать VideoProductSheet или обычный ProductSheet |
| `productVideo` | Короткий цикл в карточке FoodItem на странице категории |
| `productVideoLarge` | Фоновое видео внутри VideoProductSheet |
| `productVideoPoster` | `<img poster>` — мгновенный показ пока видео грузится |
| `productPhoto` | Уже есть — используется как запасной постер (если `productVideoPoster` null) |
| `productDetails` | Наполнение листка «Подробнее» |
| `iceVersionId` | Есть ли альтернативная версия; фронт показывает чип если поле задано |
| `iceVersionChip` | Текст и фото чипа «Айс версия» / «Горячая версия» |
| `iceVersion` | Полные данные альтернативного товара — встроены в ответ, не нужен второй запрос |

---

## Изменения в GroupModification (модификаторы)

Текущая модель `GroupModification` **остаётся без изменений**.  
Единственное что нужно — чтобы все `GroupItem` имели `photo` (URL картинки опции).  
Это уже есть в схеме (`photo?: string | null`), надо просто убедиться что в админке  
можно загружать фото для каждой опции.

---

## Что НЕ меняется

- Структура заказа (`/orders/`) — без изменений. Видео-товар добавляется в корзину  
  точно так же как обычный: `productId + modificatorId + groupSelections`.
- Механика модификаторов (`GroupModification`, `Modificator`) — без изменений.
- Существующие эндпоинты — без изменений.

---

## Эндпоинты

Никаких новых эндпоинтов **не нужно**.  
Новые поля просто добавляются в ответ существующего:

```
GET /v2/products/?venueSlug=&spotId=&categories=...
```

Фронт сам проверяет `product.isVideoProduct` и выбирает нужный компонент.

---

## Пример ответа API для видео-товара

```json
{
  "id": 42,
  "productName": "Мокка",
  "productDescription": "Нежный мокка с шоколадным вкусом",
  "productPrice": 220,
  "productPhoto": "https://cdn.imenu.kg/products/mokka.png",
  "modificators": [
    { "id": 1, "name": "Большой 450 г",   "price": 270 },
    { "id": 2, "name": "Стандарт 350 г",  "price": 220 },
    { "id": 3, "name": "Маленький 250 г", "price": 180 }
  ],
  "groupModifications": [
    {
      "id": 10,
      "name": "Молоко",
      "selection": { "type": "multiple", "min": 0, "max": 1, "title": "Молоко", "description": "" },
      "items": [
        { "id": 101, "name": "Кокосовое",  "price": "15", "brutto": "30", "photo": "https://cdn.imenu.kg/items/coconut.png" },
        { "id": 102, "name": "Банановое",  "price": "15", "brutto": "30", "photo": "https://cdn.imenu.kg/items/banana.png" }
      ]
    }
  ],

  "isVideoProduct": true,
  "productVideo":       "https://cdn.imenu.kg/videos/mokka-5s.mp4",
  "productVideoLarge":  "https://cdn.imenu.kg/videos/mokka-15s.mp4",
  "productVideoPoster": "https://cdn.imenu.kg/videos/mokka-poster.jpg",

  "productDetails": {
    "fullTitle": "Мокка с шоколадным вкусом и мягкой сливочной пенкой",
    "description": "Мокко — это кофейный напиток на основе эспрессо...",
    "sections": [
      { "heading": "Состав",  "body": "Двойной эспрессо + шоколад + молоко" },
      { "heading": "Вкус",    "body": "Насыщенный, сладкий, с шоколадными нотками" },
      { "heading": "Подача",  "body": "В высоком айриш-бокале" }
    ]
  },

  "iceVersionId": 43,
  "iceVersionChip": {
    "label": "Айс версия",
    "photo": "https://cdn.imenu.kg/products/mokka-ice-chip.png"
  },
  "iceVersion": {
    "id": 43,
    "productName": "Мокка Айс",
    "productDescription": "Освежающий холодный мокка со льдом",
    "productPrice": 210,
    "productPhoto": "https://cdn.imenu.kg/products/mokka-ice.png",
    "isVideoProduct": true,
    "productVideoLarge": "https://cdn.imenu.kg/videos/mokka-ice-15s.mp4",
    "iceVersionId": 42,
    "iceVersionChip": {
      "label": "Горячая версия",
      "photo": "https://cdn.imenu.kg/products/mokka-hot-chip.png"
    },
    "modificators": [
      { "id": 4, "name": "Макси 480 мл",    "price": 260 },
      { "id": 5, "name": "Стандарт 380 мл", "price": 210 },
      { "id": 6, "name": "Мини 280 мл",     "price": 170 }
    ],
    "groupModifications": [
      {
        "id": 20,
        "name": "Молоко",
        "selection": { "type": "multiple", "min": 0, "max": 1, "title": "Молоко", "description": "" },
        "items": [
          { "id": 201, "name": "Кокосовое", "price": "15", "brutto": "30", "photo": "https://cdn.imenu.kg/items/coconut.png" }
        ]
      }
    ]
  }
}
```

---

## Приоритет полей для постера видео (на фронте)

```
productVideoPoster  →  productPhoto  →  productPhotoLarge
```

---

## Айс версия — как работает на фронте

1. Основной товар (Мокка горячий) приходит с `iceVersionId: 43` и `iceVersion: { ... }`.
2. Фронт видит `iceVersionId` → показывает чип «Айс версия» в нижнем ряду.
3. Пользователь нажимает чип → открывается bottom sheet поверх основной витрины.
4. В bottom sheet отображается `iceVersion` — полностью другой товар со своими группами, размерами, ценами и видео.
5. Внутри bottom sheet есть чип «Горячая версия» (из `iceVersion.iceVersionChip`) — нажатие закрывает sheet и возвращает к основному товару.
6. Если у товара нет `iceVersionId` — чип не показывается вообще.

**Ключевое решение**: `iceVersion` встраивается прямо в ответ основного товара.  
Это позволяет открыть ice sheet мгновенно без второго сетевого запроса.

---

## Вопросы к бэку

1. Где хранить видео-файлы? CDN или тот же сервер что и фото?
2. Нужна ли валидация формата видео (mp4/webm) или просто URL?
3. `iceVersionId` — FK на Product в той же таблице?
4. `iceVersion` встраивать всегда или только если `isVideoProduct: true`?
5. Нужна ли отдельная пагинация/фильтрация для видео-товаров (`?isVideoProduct=true`)?
