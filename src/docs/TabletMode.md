# Tablet Mode (Планшетный режим) — route-based

Требования (обновлено):
- Планшетный режим включается, если роут заведения оканчивается на букву `d`, например: `/ustukan` — обычный режим, `/ustukand` — планшетный режим.
- В планшетном режиме:
  - Доступна только версия «со столом» (dine-in).
  - UI «Доставка» и «Самовывоз» скрыты; тип заказа всегда `dinein`.
  - Не сохранять данные при заполнении формы: телефон, адрес, слоты времени (pickupMode/pickupTime).
  - При отсутствии `tableId` блокировать интерфейс оверлеем «Сканируйте QR на столе».

Важное изменение:
- Определение по ширине экрана более не используется и удалено из логики планшетного режима.

## Детали реализации

1) Route-based режим
- Файл: `src/lib/utils/slug.ts`
- Экспорт:
  - `isTabletVenueSlug(slug)` — признак режима, если slug оканчивается на `d`.
  - `canonicalizeVenueSlug(slug)` — удаляет завершающую `d` для обращения к backend.
  - `isTabletRoutePath(pathname)` — определяет планшетный режим по первому сегменту пути.
  - `getCanonicalVenueFromPath(pathname)` — извлекает канонический slug из пути.

2) Канонический slug для API и метаданных
- Файл: `src/app/(home)/[venue]/layout.tsx`
- Для `generateMetadata` используется `canonicalizeVenueSlug(slug)` перед запросом `/api/v2/venues/{slug}/`.
- UI продолжает работать с route-slug (включая `d`), но backend всегда получает канонический.

3) Блокировка UI без стола в планшетном режиме
- Файл: `src/app/(home)/[venue]/TabletGate.tsx`
- Теперь использует `usePathname()` и `isTabletRoutePath(pathname)`, а не ширину экрана.
- Если включён планшетный режим и нет `tableId`, показывает полноэкранный оверлей «Сканируйте QR‑код…».

4) Принудительные ограничения (форс dine-in и очистка полей)
- Файл: `src/app/(home)/[venue]/TabletModeEnforcer.tsx`
- Опирается на `isTabletRoutePath(pathname)`. В планшетном режиме:
  - `orderType = 'dinein'`
  - `phone = '+996'`, `address = ''`, `pickupMode = 'asap'`, `pickupTime = null`
  - Удаляет `localStorage('address')` на клиенте (best-effort)

5) Отключение персиста чувствительных полей в планшетном режиме
- Файл: `src/store/checkout.ts`
- В `persist.partialize` исключаются `phone`, `address`, `pickupMode`, `pickupTime`, если активен планшетный режим (проверка по `window.location.pathname` через `isTabletRoutePath`).
- В `onRehydrateStorage` при планшете — форс `dinein`, сброс чувствительных полей.

6) UI: скрыть Доставка/Самовывоз
- Файл: `src/app/(home)/[venue]/basket/BasketView.tsx`
- Скрывает компонент `OrderType`, если `isTabletRoutePath(pathname)`.
- Запрет префилла `phone/address` из `localStorage` в планшетном режиме.
- Прежняя ширинная логика удалена.

7) Канонизация slug/venueRoot
- `src/app/(home)/[venue]/_components/MainHeader.tsx` — для API-хуков (`useVenue`, `useVenueTableV2`) используется канонический slug. В `localStorage('venueRoot')` сохраняется каноническое значение (без `d`).
- `src/app/(home)/[venue]/[tableId]/VenueGate.tsx` и `src/app/(home)/[venue]/[tableId]/[spotId]/VenueGate.tsx` — сохраняют в `venueRoot` канонический slug (без `d`) и пушат роут с исходным slug (в том числе с `d`, если пришёл).

8) OrientationGuard (не про планшетный режим)
- Файл: `src/app/(home)/[venue]/OrientationGuard.tsx`
- Возвращён фиксированный порог «мобильный» `(max-width: 1024px)`. С планшетным режимом не связан.

## Изменённые файлы
- Добавлен: `src/lib/utils/slug.ts`
- Обновлены:
  - `src/app/(home)/[venue]/layout.tsx` — канонизация slug для API
  - `src/app/(home)/[venue]/TabletGate.tsx` — route-based
  - `src/app/(home)/[venue]/TabletModeEnforcer.tsx` — route-based
  - `src/app/(home)/[venue]/basket/BasketView.tsx` — скрытие OrderType и запрет префиллов по route-based
  - `src/store/checkout.ts` — персист/гидратация по route-based
  - `src/app/(home)/[venue]/_components/MainHeader.tsx` — канонизация slug+venueRoot
  - `src/app/(home)/[venue]/[tableId]/VenueGate.tsx` — канонизация venueRoot
  - `src/app/(home)/[venue]/[tableId]/[spotId]/VenueGate.tsx` — канонизация venueRoot
  - `src/app/(home)/[venue]/OrientationGuard.tsx` — фиксированный порог 1024px, без responsive utils

Примечание:
- Старый файл `src/lib/utils/responsive.ts` больше не используется в планшетной логике. Оставлен в репозитории для совместимости (если нужен — можно удалить в будущем).

## Поведение
- ВКЛ планшетного режима: по роуту `/{venue}d` (например, `/ustukand`).
- Без `tableId` в планшете: показывается оверлей «Сканируйте QR».
- Тип заказа: всегда `dinein`, переключатель скрыт.
- Персист: в планшете не сохраняются телефон, адрес, слоты времени. Корзина, язык, бренд‑цвет, venue — сохраняются.

## Тест‑план (локально)
1) `npm run dev`, открыть `/ustukan` — обычный режим:
   - OrderType виден, префилл телефона/адреса работает.
2) Открыть `/ustukand` — планшетный режим:
   - Если нет `tableId` — полноэкранный оверлей «Сканируйте QR».
   - Если `tableId` присутствует — OrderType скрыт, заказы только dine‑in.
   - Телефон/адрес/слоты не сохраняются между перезагрузками.
3) Проверить, что навигация внизу работает с route-slug, а backend получает канонический slug.
