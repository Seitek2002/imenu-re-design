export interface OrderProduct {
  id: number;
  price: string;
  count: number;
  modificator: number | null;
  product: {
    id: number;
    productName: string;
    productPhoto?: string;
    productPhotoSmall?: string;
    productPhotoLarge?: string;
  };
}

export interface OrderV2 {
  id: number;
  status: number;
  serviceMode: number; // 1=DineIn, 2=Takeout, 3=Delivery
  totalPrice: string;
  orderProducts: OrderProduct[];
  table?: {
    id: number;
    tableNum: string;
  };
  created_at?: string;
}

export interface OrdersResponse {
  count: number;
  results: OrderV2[];
}

export interface BonusResponse {
  phoneNumber: string;
  venue: string;
  bonus: number;
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
  orderProducts: OrderProductInput[];
  paymentMethod?: 1 | 2; // 1=Наличные, 2=Безналичная (ELQR/карта; провайдер настроен на бекенде per-venue)
  isTgBot?: boolean;

  useBonus?: boolean; // <--- САМОЕ ВАЖНОЕ ПОЛЕ!
}

export interface OrderCreateResponse {
  id: number;
  paymentUrl?: string;
}
