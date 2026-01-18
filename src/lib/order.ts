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

export interface OrderProductInput {
  product: number; // ID продукта
  count: number;
  modificator?: number | null;
}

export interface OrderCreateBody {
  phone: string;
  serviceMode: 1 | 2 | 3;
  address?: string | null;
  comment?: string | null;
  spot?: number | null;
  table?: number | null;
  orderProducts: OrderProductInput[];
  paymentMethods?: 'cash' | 'card' | 'elqr'; // Если нужно
  isTgBot?: boolean;

  useBonus?: boolean; // <--- САМОЕ ВАЖНОЕ ПОЛЕ!
}

export interface OrderCreateResponse {
  id: number;
  paymentUrl?: string;
}
