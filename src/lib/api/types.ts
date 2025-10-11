// Types derived from the provided OpenAPI schema (simplified to relevant fields)

export type Banner = {
  id: number;
  title: string;
  text: string;
  banner: string; // uri
  image: string; // uri
  url: string | null;
};

export type Category = {
  id: number;
  categoryName: string;
  categoryPhoto: string; // readOnly uri
  categoryPhotoSmall: string; // readOnly uri
};

export type Product = {
  id: number;
  productName: string;
  weight: number;
  productPhoto: string;
  // Дополнительные поля, которые приходят с сервера и используются в UI (опционально)
  productPrice?: string | number;
  productPhotoSmall?: string;
  productPhotoLarge?: string;
  productDescription?: string | null;
  // Модификаторы (размеры и т.п.) могут приходить вместе с продуктом
  modificators?: Array<{
    id: number;
    name?: string;
    price?: number | string;
  }>;
  category?: {
    id: number;
    categoryName: string;
  };
};

export type OrderProduct = {
  product: Product; // readOnly in OrderList
  count: number;
  price: string; // decimal as string
  modificator: number | null;
};

export type OrderList = {
  id: number;
  totalPrice: string; // decimal as string
  status: 0 | 1 | 2 | 3 | 4 | 7;
  createdAt: string; // date-time
  serviceMode: 1 | 2 | 3;
  address: string | null;
  comment: string | null;
  phone: string;
  orderProducts: OrderProduct[];
  tableNum: string;
  statusText: string;
};

export type Spot = {
  id: number;
  name: string;
  address: string | null;
  // Not required in schema, но присутствуют в OpenAPI (nullable)
  wifiText?: string | null;
  wifiUrl?: string | null;
};

export type WorkSchedule = {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dayName: string;
  workStart: string; // time
  workEnd: string; // time
  isDayOff: boolean;
  is24h: boolean;
};

export type Venue = {
  colorTheme:
    | "#008B68"
    | "#FFB200"
    | "#F80101"
    | "#FF4800"
    | "#00BBFF"
    | "#0717FF"
    | "#AF00A3"
    | "#000000"
    | "#00BFB2"
    | ""; // from enum
  companyName: string;
  slug: string;
  logo: string | null; // uri
  schedules: WorkSchedule[];
  deliveryServiceFeePercent: number;
  takeoutServiceFeePercent: number;
  dineinServiceFeePercent: number;
  defaultDeliverySpot: number | null;
  spots: Spot[];
  isDeliveryAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDineinAvailable: boolean;
  deliveryFixedFee: string;
  deliveryFreeFrom: string | null;
  terms: string | null;
  description: string | null;
};

// Generic API response helpers
export type ListResponse<T> = T[];
