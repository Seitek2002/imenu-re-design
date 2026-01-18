export enum ColorTheme {
  DarkGreen = '#008B68',
  Amber = '#FFB200',
  Scarlet = '#F80101',
  Orange = '#FF4800',
  LightBlue = '#00BBFF',
  Blue = '#0717FF',
  Pink = '#AF00A3',
  Black = '#000000',
  Turquoise = '#00BFB2',
  None = '',
}

/** Режим обслуживания */
export enum ServiceMode {
  DineIn = 1, // На месте
  Takeaway = 2, // Самовывоз
  Delivery = 3, // Доставка
}

/** Статус заказа */
export enum OrderStatus {
  Created = 0, // Заказ оформлен
  Preparing = 1, // Готовим заказ
  Ready = 2, // Заказ готов
  Completed = 3, // Заказ выполнен
  PendingPayment = 4, // Ожидает оплату
  InDelivery = 5, // В доставке
  Cancelled = 7, // Отменён
}

/** Дни недели */
export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

// --- BASIC ENTITIES ---

export interface Banner {
  id: number;
  title: string;
  text: string;
  banner: string; // URI
  image: string; // URI
  url?: string | null; // URI
}

export interface Category {
  id: number;
  slug: string;
  categoryName: string;
  categoryPhoto: string;
  categoryPhotoSmall: string;
}

export interface Spot {
  id: number;
  name: string;
  address?: string | null;
  wifiText?: string | null;
  wifiUrl?: string | null;
}

export interface WorkSchedule {
  dayOfWeek: DayOfWeek;
  dayName: string; // ReadOnly
  workStart: string; // format: time (HH:mm:ss)
  workEnd: string; // format: time (HH:mm:ss)
  isDayOff: boolean;
  is24h: boolean;
}

// --- VENUE ---

export interface Venue {
  slug: string;
  companyName: string;
  colorTheme?: ColorTheme | string;
  logo?: string | null;
  description?: string | null;
  terms?: string | null; // Условия заведения

  // Связанные сущности
  schedules: WorkSchedule[];
  spots: Spot[];

  // Настройки обслуживания
  isDeliveryAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDineinAvailable: boolean;

  // Комиссии и сборы
  deliveryServiceFeePercent?: number;
  takeoutServiceFeePercent?: number;
  dineinServiceFeePercent?: number;
  deliveryFixedFee?: string; // Decimal string
  deliveryFreeFrom?: string | null; // Decimal string
  defaultDeliverySpot?: number | null;

  // Бонусная система
  isBonusSystemEnabled: boolean;
  bonusAccrualPercent?: number;
}

// --- CLIENT ---

export interface Client {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  patronymic?: string | null;
  email?: string | null;
}

// --- ORDERS ---

/** Продукт внутри заказа (для отображения) */
export interface OrderProduct {
  product: Product;
  count: number;
  price: string; // Decimal string
  modificator?: number | null;
}

/** Продукт внутри заказа (для создания) */
export interface OrderProductCreate {
  product: number; // ID продукта
  count: number;
  modificator?: number | null;
}

/** Полная информация о заказе (ответ от сервера) */
export interface OrderList {
  id: number;
  createdAt: string; // date-time
  status: OrderStatus;
  statusText: string;

  totalPrice: string; // Decimal string
  serviceMode: ServiceMode;

  phone: string;
  address?: string | null;
  comment?: string | null;
  tableNum: string;

  orderProducts: OrderProduct[];
}

/** Тело запроса для создания заказа */
export interface OrderCreate {
  // Поля, отправляемые на сервер
  phone: string;
  orderProducts: OrderProductCreate[];

  serviceMode?: ServiceMode;
  address?: string | null;
  comment?: string | null;

  spot?: number | null;
  table?: number | null;

  tipsPrice?: number;
  bonus?: number; // Сколько бонусов списать
  useBonus?: boolean;

  isTgBot?: boolean;
  tgRedirectUrl?: string | null;

  // Поля ответа (ReadOnly), которые могут прийти после создания
  id?: number;
  paymentUrl?: string;
  phoneVerificationHash?: string;
  code?: string | null; // writeOnly в схеме, но иногда возвращается
  hash?: string | null; // writeOnly
}

// --- PAGINATION ---

export interface PaginatedOrderList {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: OrderList[];
}

// --- WEBHOOKS (Если вдруг понадобятся) ---
export interface PosterWebhook {
  account: string;
  accountNumber: string;
  object: string;
  objectId: number;
  action: string;
  time: number;
  verify: string;
  data: string;
}

export interface SectionShort {
  id: number;
}

export interface CategoryShort {
  id: number;
  categoryName: string;
  slug: string;
  categoryPhoto?: string | null;
  categoryPhotoSmall?: string | null;
}

// Главная кнопка меню
export interface MainButton {
  id: number;
  name: string;
  photo: string; // URL картинки
  order: number;
  buttonType: 'section' | 'category' | 'link'; // Вижу по JSON, что там section

  // Если buttonType === 'section'
  section?: SectionShort | null;
  slug: string;

  // Вложенные категории (если нужно будет делать выпадающее меню, но пока нам нужна только ссылка)
  categories?: CategoryShort[];
}

export interface Modificator {
  id: number;
  name: string;
  price: number;
}

export interface ProductCategory {
  id: number;
  categoryName: string;
}

export interface Product {
  id: number;
  productName: string;
  productDescription: string | null;
  productPrice: number;
  weight: number;

  measureUnit?: string;

  // Фото
  productPhoto?: string;
  productPhotoSmall?: string;
  productPhotoLarge?: string;

  categories: ProductCategory[];
  modificators: Modificator[];

  isRecommended?: boolean;
}
