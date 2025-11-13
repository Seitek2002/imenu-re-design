# imenu-next — Project Notes (Onboarding Guide)

This document is the single source of truth to understand, debug, and extend the project quickly.

## Purpose
- QR menu for venues with basket, checkout flow, order status, and history.
- This file captures architecture, key decisions, and how to work on new tasks quickly.

## Tech Stack
- Framework: Next.js (App Router), React 18/19 APIs (React 19.1.0 in package.json)
- State: Zustand (v5) stores in `src/store`
- Data fetching: TanStack Query (React Query v5) with custom `fetchJSON` wrapper
- Styling: Tailwind CSS
- i18n: `react-i18next` with JSON locales in `src/locales`
- Assets: `/src/assets`, SVG and PNG
- Build/Dev:
  - Next.js 15.5.4
  - Dev server uses Turbopack (`next dev --turbopack`)
  - Deployed targets: Netlify (plugin present) and Vercel (config present)
  - TypeScript enabled
  - Package manager: `bun@1.2.22` listed; npm works fine too

## Scripts / Tooling
- Dev: `npm run dev` (Next dev with Turbopack)
- Build: `npm run build`
- Start: `npm start`
- With Bun:
  - Dev: `bun run dev`
  - Build: `bun run build`
  - Start: `bun run start`

## Project Structure (selected)
- `src/app/(home)/[venue]/` — Venue-specific public area
  - `page.tsx` — venue home
  - `menu/page.tsx` — menu listing
  - `foods/[sectionId]/page.tsx` — foods by section
  - `basket/page.tsx` — basket; `basket/_components/Drawer` contains checkout flow
  - `order-status/[id]/page.tsx` — order status screen
  - `_components` — shared UI blocks for the venue scope (Header, Footer, Widgets, etc.)
  - `OrientationGuard.tsx` — UX helper for device orientation
  - `ThemeColor.tsx` — dynamic theme color handling
- `src/components` — global components
- `src/lib/api` — API layer: `queries.ts` (React Query hooks), `types.ts`
- `src/lib/server` — small server-side helpers (e.g., `getMainButtons.ts`)
- `src/store` — Zustand stores (`basket.ts`, `checkout.ts`, `venue.ts`, `cart.ts`)
- `src/locales` — i18n JSON dictionaries (`ru`, `kg`, `en`)
- `src/assets` — SVG/PNGs for UI (Header, Footer, Widgets, Goods, OrderStatus, etc.)
- `tailwind.config.ts` — Tailwind configuration

## Routing Overview (App Router)
- `/(home)/[venue]` — Venue home
- `/(home)/[venue]/menu` — Categories and items
- `/(home)/[venue]/foods/[sectionId]` — Items by section
- `/(home)/[venue]/basket` — Basket + checkout drawer
- `/(home)/[venue]/order-status/[id]` — Order status by order ID
- `/(home)/[venue]/profile` — User profile (basic)
- Table/spot routes (where applicable): `[tableId]`, `[spotId]`

## Data Layer (src/lib/api/queries.ts)
- Global API base: `https://imenu.kg`
- `fetchJSON`:
  - Handles query params
  - Sends `Accept-Language` from `localStorage('lang')`
  - Parses JSON and falls back to raw text for non-JSON responses
- Endpoints (OpenAPI v2 highlights):
  - `GET /api/v2/...` for banners, products, categories, venues, orders
  - `POST /api/v2/orders/` — CREATE ORDER (see below)
- Order creation (v2):
  - Content-Type: `application/x-www-form-urlencoded`
  - `orderProducts`: sent as a single JSON string field:
    - `form.set('orderProducts', JSON.stringify(body.orderProducts))`
  - Other fields encoded individually; booleans must be `'true' | 'false'` strings
  - `venue_slug` not required by Swagger for v2 create
  - On success: response contains `paymentUrl`, opened in new tab by UI

Example (conceptual) of how mutation is formed:
```ts
// Pseudocode for illustration only
const form = new URLSearchParams();
form.set('orderProducts', JSON.stringify(body.orderProducts));
form.set('isDelivery', String(body.isDelivery)); // 'true' | 'false'
form.set('phone', body.phone);
...
await fetch(`${API}/api/v2/orders`, { method: 'POST', body: form });
```

Utilities:
- `useCallWaiterV2()` for call-waiter action (Footer)

## State Management (Zustand, src/store)
- `basket.ts`
  - `items: Record<productId, { quantity, ... }>`
  - Derived totals and `itemCount` used across Footer and Basket
- `checkout.ts`
  - `phone`, `address`, `orderType`, time preferences
  - UI signals: `openSheet` for Drawer
- `venue.ts`
  - `tableId`/`tableNum`, venue data
- `cart.ts`
  - Legacy/additional cart features (if used alongside basket)

## i18n
- Locales: `src/locales/{ru,kg,en}/common.json`
- Common keys used in Footer and Order Status:
  - `goToBasket`, `checkoutProceed`, `total`, `callWaiter` (with `{table}`), `loading`
  - `asap`, `notSpecified`, `street`, `floor`, `entrance`, `apartment`, `comment`, etc.
- `Accept-Language` header is set via `localStorage('lang')` in `fetchJSON`.

## UI/UX Conventions
- Styling: Tailwind CSS utility-first classes
- Footer is fixed; responsive grids (e.g., icons/dots in order status)
- Loading states: `aria-busy` and explicit spinners on actions
- Haptics: may vibrate on invalid inputs; shake effects (`src/app/shake.css`)
- Icons: often black SVGs inverted in active state (e.g., order status active step shows white on orange via CSS filters)

## Key Screens and Behaviors

### Basket and Checkout
- Entry: `src/app/(home)/[venue]/basket/page.tsx`
- Drawer checkout: `basket/_components/Drawer/DrawerCheckout.tsx`
  - Uses `useCreateOrderV2`
  - On success: logs server response and opens `paymentUrl` in new tab
  - Loading state: “Идет загрузка” + spinner
  - Validations for phone/address per order type; shakes/vibrates on invalid

### Footer (src/app/(home)/[venue]/_components/Footer/Footer.tsx)
- On menu/foods pages:
  - Shows “Перейти в корзину” with total when `itemCount > 0`
  - Shows “Позвать официанта” with table info; uses `useCallWaiterV2`; disabled while pending
- On basket page:
  - Total + “К оформлению” button
  - Button hidden when basket is empty: `hydrated && itemCount > 0`

### Order Status (`order-status/[id]`)
- 4-step horizontal status with icons and baseline/dots
- Active icon: white on orange circle; others: black on grey
- Dots aligned under icons via grid overlay
- Progress bar increments by 25% per step: 25 → 50 → 75 → 100
- Bottom button “Изменить статус” advances step; disabled on last step
- Implementation note (from earlier context): `CurrentStatus.tsx` in `_components` may host this logic

## Common “Where to change X quickly”
- Show/hide Footer “go to basket”: `Footer.tsx` → `showNext` formula
- Hide “К оформлению”: `Footer.tsx` (basket section) → `hydrated && itemCount > 0`
- Order creation fields and encoding: `src/lib/api/queries.ts` → `useCreateOrderV2` `mutationFn`
- Order status step content/colors: look in `order-status/[id]/_components` and `OrderStatusView.tsx`
- Progress calc: `(active + 1)/steps.length * 100`

## Cookbook

### Add a new query with React Query
1. Define endpoint typing in `src/lib/api/types.ts` (if needed).
2. Add a fetcher using `fetchJSON` (handles lang/header).
3. Create a React Query hook in `src/lib/api/queries.ts`.
4. Use the hook in a component; guard loading/error states.
5. Keys: prefer tuple-style keys like `['products', { sectionId, lang }]`.

### Add a translation
1. Add key/value to `src/locales/{ru,kg,en}/common.json`.
2. Use in component: `const { t } = useTranslation();` → `t('key')`.
3. For placeholders (`{table}`), provide `t('callWaiter', { table: tableNum })`.

### Modify Footer behavior
- Open `src/app/(home)/[venue]/_components/Footer/Footer.tsx`.
- Update `showNext` condition or Basket-page button visibility.

### Create order payload tips
- Ensure all booleans are `'true' | 'false'` strings.
- `orderProducts` must be JSON-stringified into a single form field.
- The server may return raw text for errors—surface helpful messages to users (TODO).

## Troubleshooting & Pitfalls
- 4xx errors may return raw text: we log raw backend text (dev) to speed debugging.
- Do not send JSON body for order creation—must be `form-urlencoded`.
- When `localStorage('lang')` is missing, the `Accept-Language` header may default—verify localized content.
- If “К оформлению” shows unexpectedly, check `hydrated` and `itemCount` conditions.

## Deployment Notes
- Vercel: `vercel.json` present; defaults should work with Next 15.
- Netlify: `@netlify/plugin-nextjs` configured via `netlify.toml`.
- Image optimization uses `sharp`.
- Verify environment vars (if any) in platform dashboards; API base is static (`https://imenu.kg`).

## Quick Start (local)
- `npm install`
- `npm run dev`
- Open `/[venue]` route used in the app directory.
- Ensure `localStorage('lang')` is set appropriately (`'ru' | 'kg' | 'en'`) for `Accept-Language`.

With Bun:
- `bun install`
- `bun run dev`

## Potential Improvements / TODO
- Centralized error notifications (toast) instead of console
- Extract address formatting to util with tests
- Add SSR-friendly i18n (cookie) if needed
- Replace console logs with dev-only guards
- Add e2e tests for order creation and Footer behavior

## Reference: OpenAPI endpoints (short)
- `GET /api/v2/banners`, `products`, `categories`, `venues(+table)`
- `GET /api/v2/orders`, `orders/{id}`
- `POST /api/v2/orders` — form-urlencoded; see creation notes above
- GET/POST hooks wired in `src/lib/api/queries.ts`

---

Below is the original condensed content this guide was based on (kept for provenance and parity):

- Purpose
  - QR menu for venues with basket, checkout flow, order status, and history
  - This file captures architecture, key decisions, and how to work in new tasks quickly

- Tech Stack
  - Framework: Next.js (App Router), React 18
  - State: Zustand stores in src/store
  - Data fetching: TanStack Query (React Query) with custom fetchJSON wrapper
  - Styling: Tailwind CSS
  - i18n: react-i18next with JSON locales
  - Assets: /src/assets, SVG and PNG

- Key Runtime/Build Info
  - Dev: npm run dev (Next.js)
  - Deployed targets: netlify/vercel files exist (netlify.toml, vercel.json)
  - TypeScript enabled

- Paths and Structure (selected)
  - src/app/(home)/[venue]/ — Venue-specific public area
    - page.tsx — home
    - menu/page.tsx — menu listing
    - foods/[sectionId]/page.tsx — foods by section
    - basket/page.tsx — basket; Drawer contains checkout flow
    - order-status — order status screen
    - _components — shared UI blocks for the venue scope
  - src/components — global components
  - src/lib/api — API layer: queries.ts (React Query hooks), types.ts
  - src/store — Zustand stores (basket, checkout, venue, etc.)
  - src/locales — i18n JSON dictionaries (ru, kg, en)

- API Layer (src/lib/api/queries.ts)
  - Global API base: https://imenu.kg
  - fetchJSON handles query params, Accept-Language, JSON or non-JSON responses
  - Endpoints follow OpenAPI provided in earlier context; highlights:
    - GET /api/v2/... for most entities (banners, products, categories, venues, orders)
    - POST /api/v2/orders/ — CREATE ORDER
      - Form Content-Type: application/x-www-form-urlencoded
      - orderProducts: sent as a single JSON string field (form.set('orderProducts', JSON.stringify(body.orderProducts)))
      - Other fields encoded individually; booleans as 'true'/'false'
      - venue_slug not required by Swagger for v2 create; request body is form-urlencoded
  - Utilities:
    - useCallWaiterV2() for call-waiter action

- Checkout Flow (Basket)
  - Entry: src/app/(home)/[venue]/basket/page.tsx
  - Footer Next button (go to basket):
    - Appears when itemCount > 0 on menu/foods pages
    - Path: Footer.tsx showNext = hydrated && itemCount > 0 && !isBasket && allowNext
  - “К оформлению” button (in Basket page footer):
    - Now hidden when basket is empty (hydrated && itemCount > 0)
    - Opens shared checkout drawer (openSheet from checkout store)
  - Create order:
    - Logic in Drawer/DrawerCheckout.tsx uses useCreateOrderV2
    - On success logs server response and opens paymentUrl in new tab
    - Loading state on Pay button (“Идет загрузка” + spinner)
  - Address string formatting and validations are handled in DrawerCheckout (phone/address, etc.)

- Order Status (src/app/(home)/[venue]/order-status/_components/CurrentStatus.tsx)
  - Horizontal 4-step status with icons and baseline/dots
  - Active icon: white on orange circle, others: black on grey
  - Dots exactly aligned under icons via grid overlay
  - Progress bar starts at 25% and increments by +25% each click: 25 → 50 → 75 → 100
  - Bottom button “Изменить статус”, disabled on last step

- Footer (src/app/(home)/[venue]/_components/Footer/Footer.tsx)
  - Shows “Перейти в корзину” (goToBasket) with total when itemCount > 0 on menu/foods
  - Shows “Позвать официанта” with table info; uses useCallWaiterV2; disabled while pending
  - On basket page:
    - Total + “К оформлению” button
    - Implemented hiding when basket empty (hydrated && itemCount > 0)

- Zustand Stores (src/store)
  - basket.ts
    - items: Record<productId, { quantity, ... }>
    - used to compute itemCount and totals
  - checkout.ts
    - phone, address, UI signals (openSheet), orderType, time preferences, etc.
  - venue.ts
    - tableId/tableNum and venue data wiring
  - cart.ts (if separate from basket) — legacy / additional cart features

- i18n (src/locales)
  - locales/ru, kg, en with common.json
  - Keys used around footer and order status:
    - goToBasket
    - checkoutProceed
    - total
    - callWaiter (template with {table})
    - loading
    - asap, notSpecified, street, floor, entrance, apartment, comment etc.
  - Also Accept-Language header is sent from localStorage('lang') in fetchJSON

- UX specifics
  - DrawerCheckout validates phone/address per order type; shakes inputs and may vibrate on invalid
  - “Изменить статус” (status page) only advances status; does not hit API
  - For icons: active step uses CSS invert() to make provided black SVGs appear white over orange circle

- Styling and UI
  - Tailwind CSS utility classes
  - Fixed Footer, responsive grids for icons/dots
  - Loading states (aria-busy) for network actions

- Dev Notes
  - Error logging includes raw backend text where available for 4xx to speed debugging
  - Console logging of payload and server response in create order flow (remove in production)
  - Content-Type: pay attention when creating orders (form-urlencoded, not JSON)
  - orderProducts must be a JSON string field in form to satisfy backend

- Where to change common behaviors quickly
  - Show/hide footer “go to basket”: Footer.tsx showNext formula
  - Hide “К оформлению”: Footer.tsx in isBasketPage section (hydrated && itemCount > 0)
  - Order creation fields encoding: src/lib/api/queries.ts useCreateOrderV2 mutationFn
  - Order status step content / colors: CurrentStatus.tsx steps array and styles
  - Progress step increments: CurrentStatus.tsx ((active + 1)/steps.length)*100

- Potential Improvements / TODO
  - Centralized error notifications (toast) instead of console
  - Extract address formatting to util with tests
  - Add SSR-friendly i18n (cookie) if needed
  - Replace console logs with dev-only guards
  - Add e2e tests for order creation and footer behavior

- Quick Start (local)
  - npm install
  - npm run dev
  - Open /[venue] route (as used in app directory). Ensure localStorage('lang') is set appropriately for Accept-Language.

- OpenAPI endpoints summary (short)
  - GET /api/v2/banners, products, categories, venues(+table)
  - GET /api/v2/orders, orders/{id}
  - POST /api/v2/orders — form-urlencoded; see creation notes above
  - GET/POST hooks wired in src/lib/api/queries.ts
