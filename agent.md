# iMenu — гид для агента

QR-меню для заведений Кыргызстана (рестораны, кафе, кофейни). Гость сканирует QR на столе/витрине, открывает меню заведения, оформляет заказ (на месте / самовывоз / доставка), оплачивает онлайн. Прод — `https://imenu.kg`.

---

## 🚧 Текущая задача: видео-витрина товара (drinkit-style)

**Цель.** Для отдельных «премиум»-товаров (пока — «Мокка» как мок) показывать full-screen карточку с зацикленным видео-фоном и floating-фото товара. На странице категорий такие товары будут иметь короткое 5-сек видео-превью; на детальной — 10–15-сек видео-фон. Без звука.

### Что уже сделано (этап вёрстки на моках)

- **Мок-данные:** [src/data/mock-video-products.ts](src/data/mock-video-products.ts) — товар «Мокка» с 4-мя `groupModifications` (Молоко, Сахар, Добавки, Дополнительные), 2-мя `flatModificators`-размерами (Большой 450 г / Стандарт 350 г). Цены, веса, картинки опций — внутри.
- **Компонент:** [src/app/[venue]/products/[slug]/components/VideoProductSheet/](src/app/[venue]/products/[slug]/components/VideoProductSheet/) — 7 файлов:
  - `index.tsx` — full-screen портал на `z-[110]`, триггер `?demo=<slug>`.
  - `VideoBackground.tsx` — `<video muted loop playsInline autoPlay preload="auto">` + постер. Уважает `prefers-reduced-motion`, Data Saver, `2g/slow-2g` — fallback на постер.
  - `SizePill.tsx` — top-level пилл «Большой / Стандарт» из `product.modificators`. Парсит вес из имени (`parseSizeModName`).
  - `GroupChip.tsx` — чип нижнего ряда. Если у группы есть иконка-картинка (`chipIcons[group.name]`) — большая картинка сверху, иначе кружок с «+». Бейдж количества справа.
  - `GroupGrid.tsx` + `GroupGridItem.tsx` — 3-колоночная сетка опций, +/− счётчик с уважением `selection.min/max/type`.
  - `BottomBar.tsx` — счётчик количества + оранжевая acent-кнопка с ценой.
- **Интеграция:** в [src/app/[venue]/layout.tsx](src/app/[venue]/layout.tsx) рядом со старым `ProductSheet` через `next/dynamic` + `<Suspense>`. **Старый `ProductSheet` НЕ ТРОНУТ** — работает параллельно для обычных товаров.
- **Ассеты:** `public/test/mokka.mp4` (4.7 MB, горизонтальное видео), `public/test/mokka-vertical.png` (750×1624 product-фото с подставкой), `public/test/mokka-horizontal.png` (2752×1536 wide-кадр для постера), `public/test/details/{1,2,3,4,milk}.png` для опций молока.
- **Fallback:** [public/splash-placeholder.svg](public/splash-placeholder.svg) — для опций без своей картинки (овсяное, соевое и т.д.).

### Как открыть

```
http://localhost:3000/<любой-venue-slug>?demo=mokka
```

Например `/ustukan?demo=mokka`. Закрытие — крестик, `ESC` или просто убрать `?demo=` из URL.

### Что НЕ подключено

- **Добавление в корзину** — `handleAdd` сейчас просто закрывает overlay. Когда дизайн утвердят, подключим через `useBasketStore.addToBasket` (как в старом `ProductSheet`, см. `buildGroupSelections` там же).
- **Реальный API** — все данные мок. Под продакшен бэк должен будет вернуть в `Product` поля `productVideo` (URL короткого 5-сек), `productVideoLarge` (URL 15-сек), `productVideoPoster` (URL постера первого кадра).
- **Триггер с FoodItem** — клик по обычной карточке товара пока открывает старую шторку. После согласования дизайна вкрутим логику «если у товара есть `productVideo` → открыть `VideoProductSheet` вместо `ProductSheet`».

### Известные проблемы / открытые вопросы

1. **Фото товара — не прозрачный cutout.** Сейчас `mokka-vertical.png` — это сцена с подставкой и тканью. На видео-фоне выглядит как «двойник» фона. Нужен **прозрачный PNG только со стаканом** от дизайнера. Когда придёт — просто заменим файл по пути `/public/test/mokka-vertical.png`, код не трогаем.
2. **Видео горизонтальное.** На вертикальном экране `object-cover` обрезает по краям. Когда дадут вертикальное — `cp new-vertical.mp4 public/test/mokka.mp4`.
3. **Чип «Молоко» иногда не виден на скриншоте.** Не подтверждено: либо horizontal-scroll увёл его за левый край, либо реальный баг рендера. Проверить при следующем заходе сразу после reload (без скроллов).
4. **Z-index и FloatingCartButton.** Старая нижняя кнопка корзины (`z-30`) и MainAction (`z-40`) перекрыты моим `z-[110]`. Если что-то всплыло сверху — это либо браузерное расширение, либо что-то новое, что нужно проверить отдельно.

### Архитектурные решения (на потом — рефакторинг)

- Старый и новый sheet пока **дублируют** часть логики (расчёт цены, селект группы, qty). Это сознательно — на этапе ревью дизайна не хочется ломать рабочий поток. **После принятия дизайна** план таков:
  - Вынести `GroupGrid` / `GroupGridItem` в shared `src/components/product/` для переиспользования.
  - `buildGroupSelections` / `sumGroupCount` тоже вынести в утилиту `src/lib/product-modifications.ts`.
  - Триггер открытия унифицировать: одна функция «openProductDetail(productId)» решает, какой sheet показать.
- Денежные суммы пока считаются локально. Когда подключим к корзине — на чек-аут пойдёт через `/orders/calculate/` (см. `useCheckoutCalculate`), это уже стоит на бэке.
- Мок-файлы (`mock-video-products.ts`, splash-placeholder) **удалить**, когда переключимся на API.

### Производительность — что заложено, что отложено

- Видео `preload="auto"` + `poster` — постер показывается мгновенно, видео догружается.
- Уважение Data Saver / `prefers-reduced-motion` / 2g — в этих случаях видео не запускается, остаётся постер.
- `disablePictureInPicture` — чтобы iOS не показывал PiP-кнопку.
- **Не заложено** (на стадии каталога, не детальной): IntersectionObserver + concurrent-cap (играет только самое видимое видео). На странице категории, когда там появятся видео-превью карточек, это критично. Сейчас — full-screen, одно видео, проблемы нет.
- **Не заложено**: byte-range CDN, AVIF-постер, multi-bitrate. Решается на этапе деплоя бэк-эндом / DevOps.

---

## Стек

- **Next.js 16 (App Router)** + React 19 + React Compiler (`babel-plugin-react-compiler`).
- **TypeScript strict**, alias `@/*` → `src/*`.
- **Tailwind v4** (через `@tailwindcss/postcss`), `globals.css` в `src/app/`.
- **next-intl 4** — i18n, локали `ru | ky | en`, сообщения в `messages/{locale}.json`, выбор хранится в куке `NEXT_LOCALE`. Запросы к API передают `Accept-Language`.
- **Zustand 5** для состояния клиента (`src/store/`), частично с `persist` (localStorage / sessionStorage).
- **TanStack Query 5** для серверных данных (`src/lib/api/queries.ts`), `refetchOnWindowFocus: false` глобально.
- **Swiper, react-leaflet (OSM), lucide-react, qrcode, @yudiel/react-qr-scanner, sharp**.
- **Standalone build** (`next.config.ts: output: 'standalone'`) → деплой через `Dockerfile`.

## Скрипты

```bash
npm run dev    # next dev -H 0.0.0.0
npm run build  # next build
npm run start
npm run lint   # eslint
```

Тестов нет.

## Структура

```
src/
  app/
    layout.tsx                      # корневой layout, шрифты Cruinn + Inter, NextIntl + QueryProvider, viewport user-scalable=no
    page.tsx                        # лендинг imenu.kg (/)
    scan/page.tsx                   # сканер QR
    api/prefetch-locale/            # роут для прогрева локали
    components/                     # общие компоненты лендинга/шапки
      Header.tsx, Footer.tsx, Nav.tsx, SearchOverlay.tsx, SearchResults.tsx,
      StoreClosedCard.tsx, ActiveLink.tsx, easterEggs.data.ts, useEasterEggs.ts, illustrations/
    [venue]/
      layout.tsx                    # SSR fetch венью, рендерит детей + глобальные оверлеи
                                    #  (ProductSheet, FloatingCartButton, MainAction, TableBillBanner, PaymentRedirector, Footer)
      [[...slug]]/page.tsx          # главная заведения; slug кодирует /spot/table или /d/spot/table (киоск) — см. url-parser.ts
      categories/[id]/              # старый роут категории
      products/[slug]/              # страница категории/меню по slug
        page.tsx                    # SSR: резолвит categoryName из main-buttons → Header + ProductContentFetcher
        components/                 # Category, Content, FoodItem, ProductSheet (модалка товара), SearchBar и т.д.
      cart/                         # /[venue]/cart — корзина и чекаут (Drawer)
      table-order/                  # вид заказа за столом (для гостя со столом)
      order-status/[orderId]/       # статус оплаченного заказа (новые, v2 — оплата онлайн)
      pos-order-status/[orderId]/   # статус заказа, созданного через POS (table-order)
      history/                      # история заказов клиента
      profile/                      # профиль + /points (программа лояльности)
      components/                   # компоненты, общие для всех страниц venue (MainHeader, SpotPicker, FloatingCartButton, MainAction, TableBillBanner, OrdersSheet, PaymentRedirector, Widgets, LanguageDropdown, HomeLinks*)
  components/
    providers/
      QueryProvider.tsx             # react-query клиент
      VenueInitializer.tsx          # пишет venue в zustand, скан корзины по slug, выставляет --brand-color, пишет spot-cookie
    modals/                         # EditProfile, Schedule, Wifi
    ui/                             # OtpModal, Toast, ImageSkeleton, CountryCodeSelect, CircularProgress, DevErrorModal
    BonusAccrualBadge.tsx
  services/
    venue.service.ts                # getVenue, getProducts, getMainButtons, getCategoriesBySection, getAllProducts
    menu.service.ts                 # пусто (заглушка)
  lib/
    config.ts                       # API_BASE_URL / API_URL / API_V2_URL, buildOrderRedirectUrl
    api-client.ts                   # обёртка над fetch: params → URLSearchParams (массивы → repeated keys), ISR кэш по умолчанию 60 с, locale → Accept-Language
    api/
      queries.ts                    # все react-query хуки: useOrdersV2, useOrderByIdV2, useClient, useUpdateClient, useClientBonus, useCreateOrderV2, useCalculateOrder, useVenueProducts, usePromotionsV2
      pos-orders.ts                 # работа с заказами стола (POS)
    order.ts                        # типы заказов и /orders/calculate/ (CalculateRequest, CalculateResponse, OrderV2, OrderCreateBody, BonusResponse, ClientGroup)
    promotions.ts                   # клиентская логика акций
    delivery.ts                     # canVenueDeliver, getDeliveryGeo (spot-level → venue-level fallback)
    osm-maps.ts, yandex-maps.ts     # карты, distanceKm
    venue-status.ts                 # getVenueStatus(schedules) → { isOpen, message }
    apiErrors.ts                    # parseApiError для тостов
    spot-cookie.{client,server,ts}  # кука spot per-venue (для SSR-цен)
    payment-link-store.ts           # хранение paymentUrl между редиректами
    url-parser.ts                   # parseUrlContext(slug) → { spotId, tableId, isKioskMode }
    locale.ts                       # LOCALES, DEFAULT_LOCALE, isLocale, getClientLocale
    helpers/
      countryCodes.ts, phone.ts (normalizePhoneForApi), progressHelper.ts
  store/
    venue.ts        # sessionStorage: данные заведения + контекст (tableId, spotId, isKioskMode, tableNumber, venueSlug)
    basket.ts       # localStorage: позиции корзины + venueSlug-скоуп; ключ строки = productId|flatModId|groupSelections (см. buildKey)
    checkout.ts     # localStorage: phone, countryId, address, deliveryLat/Lng, needUtensils, комментарии
    bonus.ts        # включение списания бонусов + сумма
    client.ts       # клиент Poster
    product.ts      # выбранный продукт для ProductSheet
    ui.ts / ui-floating.ts # UI-флаги, открытость шторок
  hooks/
    useCartLogic.ts             # вычисление orderType (если tableNumber → 'dinein'), доставка, цена, флаги canDeliver/canTakeout/canDinein
    useCheckoutCalculate.ts     # debounce + /orders/calculate/, источник истины для total/promo/delivery/bonus
    useOrderSummary.ts          # сводка для UI
    useTableOrderSocket.ts      # сокет для table-order
    useVenue.ts                 # доступ к venue-стору
    useMounted.ts
  types/
    api.ts          # Venue, Product, Category, Spot, WorkSchedule, OrderList, Promotion, ServiceMode (1 DineIn, 2 Takeaway, 3 Delivery), OrderStatus, ColorTheme и т.д.
    pos-order.ts
  i18n/request.ts                  # next-intl: читает куку NEXT_LOCALE, грузит messages/{locale}.json
  assets/, fonts/ (Cruinn), data/, css.d.ts
messages/{ru,ky,en}.json
public/                            # favicon, og-image, шрифты, иконки
Dockerfile                         # standalone образ
```

## Ключевые контракты

### URL-схема заведения

`/{venueSlug}` — главная.
`/{venueSlug}/{spotId}/{tableId}` — гость пришёл к столу (QR на столе).
`/{venueSlug}/d/{spotId}/{tableId}` — режим киоска (терминал в зале).
Парсинг — [src/lib/url-parser.ts](src/lib/url-parser.ts). Контекст пишется в `useVenueStore.setContext` через [VenueInitializer](src/components/providers/VenueInitializer.tsx).

Если есть `tableId` → корзина (`/cart`) редиректится на `/table-order`, `orderType` принудительно становится `'dinein'`.

### API

База: `NEXT_PUBLIC_API_URL` (или `https://imenu.kg`). Эндпоинты v2: `${API_BASE_URL}/api/v2/`.
SSR-фетчи через нативный `fetch` с `next: { revalidate: 60 }`. CSR-фетчи через `apiClient` (тоже ISR-кэш по умолчанию 60 с) или прямой `fetch` в queries.
Локаль всегда передаётся заголовком `Accept-Language`. Next кэширует ответы отдельно по URL + headers.

Главные ручки:
- `GET /venues/{slug}/` — данные заведения (v2).
- `GET /venues/{slug}/table/{tableId}/` — заведение + текущий стол (v1, для QR).
- `GET /v2/main-buttons/?venueSlug=` — главные кнопки/секции.
- `GET /v2/categories/?venueSlug=&sectionId=` — категории секции.
- `GET /v2/products/?venueSlug=&spotId=&categories=...` — товары. Массивы → repeated keys (`?categories=9&categories=7`).
- `GET /v2/promotions/?venueSlug=&spotId=` — акции.
- `GET /v2/orders/?phone=...` (с `includeUnpaid=true` чтобы видеть PendingPayment).
- `GET /v2/orders/{id}/` — статус.
- `POST /v2/orders/` — создать заказ.
- `POST /v2/orders/calculate/` — **источник истины** для total/discount/delivery/bonus в корзине (см. ниже).
- `GET /v2/clients/{phone}/`, `PATCH /v2/clients/{phone}/`.
- `GET /v2/client/bonus/?phone=&venueSlug=` — баланс бонусов + `clientGroup` (Poster).

### `serviceMode`

`1` = DineIn (за столом), `2` = Takeaway (самовывоз), `3` = Delivery. См. [src/types/api.ts](src/types/api.ts).

### Серверный расчёт корзины (контракт Kuma 2026-05-12)

`/orders/calculate/` — единственный источник истины для:
- `totalPrice`, `productsTotal`, `discountedProductsTotal`
- `promotion`, `promotionDiscount`, line-level `promotionDiscountAmount` / `promotionDiscountedCount`
- `servicePrice`, `containerTotal`
- `deliveryPrice` (включая бесплатную зону / freeFrom)
- `bonusAvailable`, `bonusApplied`, `bonusEarned`, `bonusAccrualPercent`

Все денежные поля — **decimal-строки** (`"134.00"`). Не округлять через float.

Бэкенд сам ограничивает `bonus` доступным балансом, добавляет контейнеры (для serviceMode 2/3), применяет промо. Хук [useCheckoutCalculate](src/hooks/useCheckoutCalculate.ts) дёргает ручку с debounce 400 мс и хранит последний успешный ответ, чтобы UI не моргал.

Локальный расчёт (`useCartLogic.totalPrice`, `deliveryPrice`) остаётся только как fallback до первого ответа сервера.

### Корзина

`basket-storage` (localStorage, version 2). Ключ строки — `productId|f{flatModId}|g:{groupSelections}`. При смене заведения (по `venueSlug` внутри стора) корзина чистится автоматически в `VenueInitializer`. Цена за единицу фиксируется в `lineUnitPrice` в момент добавления — пересчёт делается на сервере.

### i18n

- Сообщения: `messages/ru.json`, `ky.json`, `en.json`.
- Чтение: `useTranslations('Namespace')` в клиенте, `getTranslations('Namespace')` в серверных компонентах.
- Текущая локаль: `useLocale()` / `getLocale()`. Хранится в куке `NEXT_LOCALE`.
- Все API-вызовы передают `Accept-Language` (см. `apiClient` и `buildHeaders` в queries.ts) — кэширование SSR делится по локали автоматически.

### Брендинг

`venue.colorTheme` (hex) пишется в CSS-переменную `--brand-color` в `VenueInitializer`. В Tailwind используется как `bg-brand`, `text-brand` и т.п. (см. globals.css).

### Шрифты

- `Cruinn` (локальный, `src/fonts/`) — основной, веса 400/500/700/900.
- `Inter` (Google) — fallback.
Переменные `--font-cruinn`, `--font-geist-inter` подключены на `<body>`.

## Конвенции и подводные камни

- **Решения должны переживать SSR**. Любая работа со `window`, `localStorage`, `sessionStorage` — за `useMounted()` или внутри `useEffect`. Стор venue лежит в **sessionStorage** (не переживает закрытие вкладки), корзина и чекаут — в **localStorage**.
- **Сервер — источник истины для денег.** Не показывать локальные суммы как финальные; они допустимы только как fallback до первого ответа `/calculate/`.
- **Decimal-строки не складывать как числа.** Парсить через `parseFloat` непосредственно перед отображением, не для сравнений с центами.
- **`Accept-Language` обязателен** для всех API-вызовов, иначе Next отдаст закэшированный другой локалью ответ.
- **Массивы в query string** — repeated keys (`?categories=9&categories=7`), CSV ломает бекенд.
- **`paramsArray` через apiClient** уже делает это правильно. Прямой `fetch` — следить вручную.
- **Telegram/IG redirect:** `buildOrderRedirectUrl(venueSlug)` возвращает `undefined` на проде (бэк сам строит deep-link) и `${origin}/${slug}` на staging/local.
- **Не амендить опубликованные коммиты, не push --force, не пропускать pre-commit hook.** Обычные правила репозитория.
- **Эмодзи в коде/доках — только если попросили.**
- **next/image** настроен на `imenu.kg` и `joinposter.com` (см. `next.config.ts`). Новые хосты — добавлять в `remotePatterns`.
- **`pinch-zoom`** заблокирован inline-скриптом в `layout.tsx` (gesturestart/touchmove). Не убирать без причины.
- **Promotions:** `Promotion.benefit.type` может быть пустой строкой `""` — это «бэк не смог определить». Учитывать.
- **`spot-cookie`**: при QR-входе сохраняется в куке `imenu_spot_{slug}`, чтобы SSR отдавал цены этой точки. Сбрасывается при смене venue.

## Что лежит на проде / куда смотреть

- Прод-фронт: https://imenu.kg
- Промо-страница: `src/app/page.tsx` (`/`). Простая лендинг-вёрстка для лида с WhatsApp.
- Заведение демо: `https://imenu.kg/ustukan` (ссылка с лендинга).

## Памятка по веткам

- Основная — `main`. Прямо в неё льются мерж-коммиты из `Nursultan` и других веток.
- Текущий worktree: `claude/wonderful-wiles-588c5f` (изолированный воркер).
- PR создаются через `gh pr create` после ручного `git push -u`.
