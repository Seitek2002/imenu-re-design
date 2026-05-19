/**
 * Выбранный group-модификатор в исторической позиции заказа.
 * Снимок из OrderProductSerializer.group_modifications — сверено по реальному
 * прод-ответу 2026-05-20. Содержит всё нужное для рендера и rebuild basket'а
 * без обращения к каталогу.
 */
export interface OrderProductGroupModSelection {
  /** GroupItem.id */
  id: number;
  name: string;
  count: number;
  /** decimal-string, цена варианта (абсолютная, не доплата) */
  price: string;
  /** Group.id — к какой группе относится вариант. */
  groupId: number;
  /** Название группы для отображения (например, «Размер»). */
  groupName: string;
  /** Внешний ID из Poster — фронту не нужен, оставлен для отладки. */
  externalId?: string;
}

export interface OrderProduct {
  id?: number;
  price: string;
  count: number;
  /** Общая цена строки = price * count (до скидки). */
  totalPrice?: string;
  promotionDiscountAmount?: string;
  discountedPrice?: string;
  discountedTotalPrice?: string;
  modificator: number | null;
  modificatorName?: string | null;
  groupModifications?: OrderProductGroupModSelection[];
  product: {
    id: number;
    productName: string;
    weight?: number;
    productPhoto?: string;
    productPhotoSmall?: string;
    productPhotoLarge?: string;
  };
}

/**
 * Контракт Kuma 2026-05-19 (frontend-api-changes-2026-05-19.md §1).
 * Enum закреплён на 4 значениях. Фронт просил ещё processing/expired/refunded/cancelled —
 * Kuma не добавил, см. KUMA_REQUEST_FOLLOWUP §1.3.
 */
export type PaymentStatus = 'not_required' | 'pending' | 'paid' | 'failed';

export interface OrderV2 {
  id: number;
  status: number;
  statusText?: string;
  serviceMode: number; // 1=DineIn, 2=Takeout, 3=Delivery
  totalPrice: string;
  orderProducts: OrderProduct[];
  /** Поле плоское в свагере (OrderList.tableNum). Старый код может смотреть в `table.tableNum` — оставлено для совместимости. */
  tableNum?: string;
  table?: {
    id: number;
    tableNum: string;
  };
  /**
   * Филиал заказа. Swagger даёт `venue: string` (read-only) — обычно slug,
   * иногда __str__ модели. Просто строка для отображения и сравнения с
   * текущим venue из URL. Не пытаемся структурировать.
   */
  venue?: string;
  address?: string | null;
  deliveryLatitude?: string | null;
  deliveryLongitude?: string | null;
  comment?: string | null;
  needsCutlery?: boolean;
  phone?: string;
  paymentStatus?: PaymentStatus;
  promotion?: string;
  source?: string;
  created_at?: string;
  paymentExpiresAt?: string | null;
  paymentUrl?: string | null;
  /**
   * Разложение суммы (Kuma 2026-05-20 §1.2). Все decimal-строки, не округлять.
   * `bonus` — сколько бонусов списано с клиента (НЕ путать с `bonusEarned`).
   *
   * Бэк зовёт поля snake_case (items_total и т.п.) — фронт читает оба варианта
   * через accessor на случай миграции на camelCase в будущем.
   */
  itemsTotal?: string;
  items_total?: string;
  containerTotal?: string;
  container_total?: string;
  deliveryPrice?: string;
  delivery_price?: string;
  bonus?: number;
  bonusEarned?: number;
  bonus_earned?: number;
}

/** Аксессоры для смешанной snake/camel сериализации /v2/orders/. */
export const orderItemsTotal = (o: OrderV2) => o.itemsTotal ?? o.items_total;
export const orderContainerTotal = (o: OrderV2) => o.containerTotal ?? o.container_total;
export const orderDeliveryPrice = (o: OrderV2) => o.deliveryPrice ?? o.delivery_price;
export const orderBonusEarned = (o: OrderV2) => o.bonusEarned ?? o.bonus_earned;

export interface OrdersResponse {
  count: number;
  results: OrderV2[];
}

/**
 * Группа клиента из Poster.
 * loyaltyType:
 *  - "bonus"    — discountPercent = процент НАЧИСЛЕНИЯ бонусов
 *  - "discount" — discountPercent = процент скидки; бонусы НЕ начисляются
 *  - ""         — Poster не вернул тип
 */
export interface ClientGroup {
  id: string;
  name: string;
  discountPercent: number;
  loyaltyType: 'bonus' | 'discount' | '';
}

export interface BonusResponse {
  phoneNumber: string;
  venue: string;
  bonus: number;
  /** Появилось 2026-05-12 (контракт Kuma). Может отсутствовать у не-Poster заведений. */
  clientGroup?: ClientGroup | null;
}

export interface OrderProductGroupModInput {
  id: number; // GroupItem.id (не GroupModification.id)
  count: number;
}

export interface OrderProductInput {
  product: number; // ID продукта
  count: number;
  modificator?: number | null;
  groupModifications?: OrderProductGroupModInput[];
}

export interface OrderCreateBody {
  phone: string;
  serviceMode: 1 | 2 | 3;
  address?: string | null;
  comment?: string | null;
  spot?: number | null;
  table?: number | null;
  needsCutlery?: boolean;
  deliveryLatitude?: string | null;
  deliveryLongitude?: string | null;
  /**
   * ID сохранённого адреса клиента из /clients/me/addresses/ (если пользователь
   * выбрал из picker'а). Опциональное поле телеметрии — на поведение заказа не
   * влияет (Kuma 2026-05-19 §3). Не передавать при ручном вводе адреса.
   */
  clientAddressId?: number | null;
  orderProducts: OrderProductInput[];
  paymentMethod?: 1 | 2; // 1=Наличные, 2=Безналичная (ELQR/карта; провайдер настроен на бекенде per-venue)
  paymentMethods?: 'cash' | 'elqr' | 'card'; // legacy: прод-бекенд пока читает строковое поле

  isTgBot?: boolean;

  useBonus?: boolean;
  bonus?: number;
  code?: string;
  hash?: string;
}

export interface PhoneVerificationHash {
  venueSlug: string;
  phone: string;
  hash: string;
}

export interface OrderCreateResponse {
  id: number;
  paymentUrl?: string;
  status?: string;
  message?: string;
  phoneVerificationHash?: string;
}

// --- /api/v2/orders/calculate/ (контракт Kuma 2026-05-12) ---

/**
 * Тело запроса серверного расчёта. Очень похоже на OrderCreateBody,
 * но `useBonus`/`code`/`hash` НЕ нужны: для расчёта достаточно `bonus`
 * (сколько пользователь хочет списать). venueSlug обязателен.
 */
export interface CalculateRequest {
  venueSlug: string;
  phone?: string;
  comment?: string | null;
  paymentMethod?: 1 | 2;
  serviceMode: 1 | 2 | 3;
  spot?: number | null;
  table?: number | null;
  address?: string | null;
  deliveryLatitude?: string | null;
  deliveryLongitude?: string | null;
  needsCutlery?: boolean;
  tipsPrice?: number;
  /** Сколько бонусов клиент хочет списать. Backend ограничит реально доступной суммой. */
  bonus?: number;
  orderProducts: Array<{
    product: number;
    count: number;
    modificator?: number | null;
    groupModifications?: OrderProductGroupModInput[];
  }>;
}

/** Строка результата расчёта (включая авто-добавленные контейнеры). */
export interface CalculateOrderProduct {
  /** Временный id строки в ответе расчёта. Не id заказа в БД. */
  lineId: number;
  product: number;
  productName: string;
  productExternalId: string;
  count: number;
  /** Цена за единицу с учётом выбранных groupModifications. */
  price: string;
  /** Цена строки до промо-скидки. */
  totalPrice: string;
  promotionDiscountAmount: string;
  promotionDiscountBase: string;
  promotionDiscountedCount: number;
  /** Цена за единицу после распределения скидки. */
  discountedPrice: string;
  /** Сумма строки после скидки. */
  discountedTotalPrice: string;
  modificator: number | null;
  modificatorName: string;
  groupModifications: Array<{ id: number; count: number }>;
  isServiceItem: boolean;
  isContainer: boolean;
}

export interface CalculatePromotion {
  id: number;
  externalId: string;
  name: string;
  /** `percent_discount` | `fixed_discount` | `fixed_price` и т.п. (см. project_promotions_api_contract). */
  type: string;
  discountAmount: string;
  discountPercent: number;
}

/**
 * Ответ серверного расчёта.
 *
 * Все денежные поля — строки decimal ("134.00"). НЕ округлять через float.
 *
 * Формула:
 *   productsTotal = itemsTotal + containerTotal
 *   discountedProductsTotal = productsTotal - promotionDiscount
 *   totalBeforeBonus = discountedProductsTotal + servicePrice + deliveryPrice
 *   bonusApplied = min(bonusRequested, bonusAvailable, totalBeforeBonus)
 *   totalPrice = totalBeforeBonus - bonusApplied
 */
export interface CalculateResponse {
  itemsTotal: string;
  containerTotal: string;
  productsTotal: string;
  promotionDiscount: string;
  discountedProductsTotal: string;
  servicePrice: string;
  deliveryPrice: string;
  bonusRequested: string;
  bonusAvailable: string;
  bonusApplied: string;
  /** Сколько бонусов будет начислено после оплаты. integer (не строка). */
  bonusEarned: number;
  /** Процент начисления, использованный для bonusEarned. integer. */
  bonusAccrualPercent: number;
  totalPrice: string;
  promotion: CalculatePromotion | null;
  orderProducts: CalculateOrderProduct[];
}
