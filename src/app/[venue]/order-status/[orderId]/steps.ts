import { Clock, ChefHat, CheckCircle, MapPin, Utensils } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STEPS_CONFIG: Record<number, any[]> = {
  // 2: Takeout (С собой)
  2: [
    {
      key: 0,
      title: 'Заказ принят!',
      desc: 'Скоро начнем готовить.',
      Icon: Clock,
    },
    { key: 1, title: 'Готовим', desc: 'Повара уже работают.', Icon: ChefHat },
    { key: 2, title: 'Готов!', desc: 'Заберите на выдаче.', Icon: CheckCircle },
    { key: 3, title: 'Выполнен', desc: 'Приятного аппетита!', Icon: Utensils },
  ],
  // 3: Delivery (Доставка)
  3: [
    { key: 0, title: 'Заказ принят', desc: 'Готовим к отправке.', Icon: Clock },
    { key: 1, title: 'На кухне', desc: 'Жарим и парим.', Icon: ChefHat },
    { key: 2, title: 'У курьера', desc: 'Едет к вам.', Icon: MapPin },
    {
      key: 3,
      title: 'Доставлен',
      desc: 'Приятного аппетита!',
      Icon: CheckCircle,
    },
  ],
  // 1: DineIn (В зале)
  1: [
    { key: 0, title: 'Заказ принят', desc: 'Передаем на кухню.', Icon: Clock },
    { key: 1, title: 'Готовится', desc: 'Ожидайте подачи.', Icon: ChefHat },
    { key: 2, title: 'Подан', desc: 'Приятного аппетита!', Icon: Utensils },
  ],
};
