import { BasketItem } from '@/store/basket';

// Типы на основе твоей Swagger документации
interface CreateOrderParams {
  items: BasketItem[];
  orderType: 'takeout' | 'delivery' | 'dinein';
  customerPhone: string;
  comment?: string;
  address?: string; // Для доставки
  spotId?: number; // ID филиала (обязательно для бэка)
  tableId?: number; // ID стола (для dinein)
  venueSlug: string;
}

interface ApiOrderProduct {
  product: number;
  count: number;
  modificator: number | null;
}

interface ApiOrderPayload {
  phone: string;
  serviceMode: 1 | 2 | 3; // 1=На месте, 2=Самовывоз, 3=Доставка
  orderProducts: ApiOrderProduct[];
  comment?: string;
  address?: string;
  spot?: number;
  table?: number;
  venue_slug: string;
  // Остальные поля (servicePrice, tipsPrice) пока не шлем, пусть считает бэк
}

interface OrderResponse {
  id: number;
  paymentUrl: string; // Ссылка на оплату!
  phoneVerificationHash?: string;
}

// --- ХЕЛПЕРЫ ---

const mapOrderTypeToServiceMode = (
  type: 'takeout' | 'delivery' | 'dinein'
): 1 | 2 | 3 => {
  switch (type) {
    case 'dinein':
      return 1;
    case 'takeout':
      return 2;
    case 'delivery':
      return 3;
  }
};

const mapBasketToApiProducts = (items: BasketItem[]): ApiOrderProduct[] => {
  return items.map((item) => ({
    product: item.id,
    count: item.quantity,
    modificator: item.modifierId || null,
  }));
};

// --- ОСНОВНАЯ ФУНКЦИЯ ---

export const createOrder = async (
  data: CreateOrderParams
): Promise<OrderResponse> => {
  // 1. Готовим данные (Payload)
  const payload: ApiOrderPayload = {
    phone: data.customerPhone, // Бэк ждет строку (напр. "0555123456" или "+996...")
    serviceMode: mapOrderTypeToServiceMode(data.orderType),
    orderProducts: mapBasketToApiProducts(data.items),
    comment: data.comment || '',
    address: data.address || '',
    spot: data.spotId || 1, // ⚠️ ВАЖНО: Тут должен быть реальный ID точки. Пока заглушка 1.
    table: data.tableId,
    venue_slug: data.venueSlug,
  };

  console.log('🚀 Отправляем заказ:', payload);

  // 2. Делаем запрос
  // Замени на свой реальный URL бэкенда
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://imenu.kg';

  const res = await fetch(`${API_URL}/api/v2/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Если нужна авторизация (Token/Bearer), добавь её сюда
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  // 3. Обработка ответа
  const responseData = await res.json();

  if (!res.ok) {
    // Если ошибка (400, 500) — кидаем её, чтобы поймал наш DevErrorModal
    throw {
      status: res.status,
      message: 'Ошибка при создании заказа',
      details: responseData, // Тут будет "сырой" ответ от бэка с ошибками валидации
    };
  }

  return responseData as OrderResponse;
};
