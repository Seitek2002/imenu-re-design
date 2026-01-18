// src/data/mockBasket.ts

export type BasketItemType = {
  key: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  modifierName?: string;
};

export const MOCK_ITEMS: BasketItemType[] = [
  {
    key: '1',
    id: 101,
    name: 'Английский завтрак',
    price: 370,
    quantity: 1,
    image: '/placeholder-dish.svg', // Убедись, что картинка есть в public
    modifierName: 'Большой',
  },
  {
    key: '2',
    id: 102,
    name: 'Каша манная',
    price: 140,
    quantity: 2,
    image: '/placeholder-dish.svg',
  },
  {
    key: '3',
    id: 103,
    name: 'Сырники',
    price: 250,
    quantity: 1,
    modifierName: 'Со сгущенкой',
  },
];
