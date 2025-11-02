# imenu-next — Project Notes

Purpose
- QR menu for venues with basket, checkout flow, order status, and history
- This file captures architecture, key decisions, and how to work in new tasks quickly

Tech Stack
- Framework: Next.js (App Router), React 18
- State: Zustand stores in src/store
- Data fetching: TanStack Query (React Query) with custom fetchJSON wrapper
- Styling: Tailwind CSS
- i18n: react-i18next with JSON locales
- Assets: /src/assets, SVG and PNG

Key Runtime/Build Info
- Dev: npm run dev (Next.js)
- Deployed targets: netlify/vercel files exist (netlify.toml, vercel.json)
- TypeScript enabled

Paths and Structure (selected)
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

API Layer (src/lib/api/queries.ts)
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

Checkout Flow (Basket)
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

Order Status (src/app/(home)/[venue]/order-status/_components/CurrentStatus.tsx)
- Horizontal 4-step status with icons and baseline/dots
- Active icon: white on orange circle, others: black on grey
- Dots exactly aligned under icons via grid overlay
- Progress bar starts at 25% and increments by +25% each click: 25 → 50 → 75 → 100
- Bottom button “Изменить статус”, disabled on last step

Footer (src/app/(home)/[venue]/_components/Footer/Footer.tsx)
- Shows “Перейти в корзину” (goToBasket) with total when itemCount > 0 on menu/foods
- Shows “Позвать официанта” with table info; uses useCallWaiterV2; disabled while pending
- On basket page:
  - Total + “К оформлению” button
  - Implemented hiding when basket empty (hydrated && itemCount > 0)

Zustand Stores (src/store)
- basket.ts
  - items: Record<productId, { quantity, ... }>
  - used to compute itemCount and totals
- checkout.ts
  - phone, address, UI signals (openSheet), orderType, time preferences, etc.
- venue.ts
  - tableId/tableNum and venue data wiring
- cart.ts (if separate from basket) — legacy / additional cart features

i18n (src/locales)
- locales/ru, kg, en with common.json
- Keys used around footer and order status:
  - goToBasket
  - checkoutProceed
  - total
  - callWaiter (template with {table})
  - loading
  - asap, notSpecified, street, floor, entrance, apartment, comment etc.
- Also Accept-Language header is sent from localStorage('lang') in fetchJSON

UX specifics
- DrawerCheckout validates phone/address per order type; shakes inputs and may vibrate on invalid
- “Изменить статус” (status page) only advances status; does not hit API
- For icons: active step uses CSS invert() to make provided black SVGs appear white over orange circle

Styling and UI
- Tailwind CSS utility classes
- Fixed Footer, responsive grids for icons/dots
- Loading states (aria-busy) for network actions

Dev Notes
- Error logging includes raw backend text where available for 4xx to speed debugging
- Console logging of payload and server response in create order flow (remove in production)
- Content-Type: pay attention when creating orders (form-urlencoded, not JSON)
- orderProducts must be a JSON string field in form to satisfy backend

Where to change common behaviors quickly
- Show/hide footer “go to basket”: Footer.tsx showNext formula
- Hide “К оформлению”: Footer.tsx in isBasketPage section (hydrated && itemCount > 0)
- Order creation fields encoding: src/lib/api/queries.ts useCreateOrderV2 mutationFn
- Order status step content / colors: CurrentStatus.tsx steps array and styles
- Progress step increments: CurrentStatus.tsx ((active + 1)/steps.length)*100

Potential Improvements / TODO
- Centralized error notifications (toast) instead of console
- Extract address formatting to util with tests
- Add SSR-friendly i18n (cookie) if needed
- Replace console logs with dev-only guards
- Add e2e tests for order creation and footer behavior

Quick Start (local)
- npm install
- npm run dev
- Open /[venue] route (as used in app directory). Ensure localStorage('lang') is set appropriately for Accept-Language.

OpenAPI endpoints summary (short)
- GET /api/v2/banners, products, categories, venues(+table)
- GET /api/v2/orders, orders/{id}
- POST /api/v2/orders — form-urlencoded; see creation notes above
- GET/POST hooks wired in src/lib/api/queries.ts
