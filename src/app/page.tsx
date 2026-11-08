import type { Metadata } from 'next';

import Landing from './_landing/Landing';

// Лендинг для будущих партнёров (заведений): коммерческое предложение iMenu.
// Вся вёрстка, тексты и анимации — в src/app/_landing/.
export const metadata: Metadata = {
  title: { absolute: 'iMenu — QR-меню, онлайн-заказы и оплата для ресторанов и кафе' },
  description:
    'Подключите заведение к iMenu бесплатно: QR-меню на столах, заказы навынос и с доставкой по ссылке, оплата по QR любого банка Кыргызстана, ИИ-оператор и своя база гостей. Комиссия 1,5%, запуск за 3 дня.',
};

export default function Home() {
  return <Landing />;
}
