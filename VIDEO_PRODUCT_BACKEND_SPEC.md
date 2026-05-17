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

  /** Ссылки на chip-варианты товара (например: «Айс версия» → другой product_id) */
  productVariants?: ProductVariant[] | null;
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

/**
 * Вариант товара — чип в нижнем ряду (напр. «Айс версия»).
 * Ссылается на другой Product и показывается перед разделителем.
 */
interface ProductVariant {
  label: string;
  productId: number;   // id связанного Product
  photo?: string | null; // отдельное фото для чипа (если нужно отличить от productPhoto)
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
| `productVariants` | Специальный первый чип в нижнем ряду + разделитель перед группами |

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

  "productVariants": [
    {
      "label": "Айс версия",
      "productId": 43,
      "photo": "https://cdn.imenu.kg/products/mokka-ice-chip.png"
    }
  ]
}
```

---

## Приоритет полей для постера видео (на фронте)

```
productVideoPoster  →  productPhoto  →  productPhotoLarge
```

---

## Вопросы к бэку

1. Где хранить видео-файлы? CDN или тот же сервер что и фото?
2. Нужна ли валидация формата видео (mp4/webm) или просто URL?
3. `productVariants` — это отдельная таблица с FK на Product, или JSON-поле?
4. Нужна ли отдельная пагинация/фильтрация для видео-товаров (`?isVideoProduct=true`)?
