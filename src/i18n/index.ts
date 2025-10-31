/* Client-side i18n setup using i18next + react-i18next.
   - Stores selected language in localStorage key "lang"
   - Default language: 'ru'
   - Resources loaded from static JSON objects (can be split later per file if needed)
*/

'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruCommon from '@/locales/ru/common.json';
import kgCommon from '@/locales/kg/common.json';
import enCommon from '@/locales/en/common.json';

// Inline resources as starter; you can split to separate files if preferred.
const ru = {
  common: {
    basket: 'Корзина',
    clearBasketConfirm: 'Очистить корзину?',
    yes: 'Да',
    cancel: 'Отменить',
    total: 'Итого',
    goToBasket: 'Перейти в корзину',
    callWaiter: 'Позвать официанта к {{table}} столику',
    pay: 'Оплатить',
    phoneNumber: 'Номер телефона',
    comment: 'Комментарий',
    addComment: '+добавить комментарий к заказу',
    hideComment: 'Скрыть комментарий',
    checkoutProceed: 'К оформлению',
    street: 'Улица',
    entrance: 'Подъезд',
    floor: 'Этаж',
    apartment: 'Квартира',
    schedule: 'График работы',
    dayOff: 'Выходной',
    roundTheClock: 'Круглосуточно',
    infoNotProvided: 'Информация не указана.',
    asap: 'Быстрее всего',
    tableLabel: 'Стол №{{num}}',
    wifi: 'Wi‑Fi',
    wifiName: 'Название сети:',
    wifiPass: 'Пароль:',
    ordersHistorySoon: 'Скоро здесь появится история ваших заказов.',
    profileSoon: 'Профиль скоро будет доступен.',
  },
};
const kg = {
  common: {
    basket: 'Себет',
    clearBasketConfirm: 'Себетти тазалоону каалайсызбы?',
    yes: 'Ооба',
    cancel: 'Жокко чыгаруу',
    total: 'Жыйынтык',
    goToBasket: 'Себетке өтүү',
    callWaiter: '{{table}} үстөлгө официантты чакыруу',
    pay: 'Төлөө',
    phoneNumber: 'Телефон номери',
    comment: 'Комментарий',
    addComment: '+заказга комментарий кошуу',
    hideComment: 'Комментарийди жашыруу',
    checkoutProceed: 'Төлөөгө өтүү',
    street: 'Көчө',
    entrance: 'Подъезд',
    floor: 'Кабат',
    apartment: 'Батир',
    schedule: 'Иш графиги',
    dayOff: 'Дем алыш',
    roundTheClock: 'Түнү-күнү',
    infoNotProvided: 'Маалымат көрсөтүлгөн эмес.',
    asap: 'Тезирээк',
    tableLabel: 'Үстөл №{{num}}',
    wifi: 'Wi‑Fi',
    wifiName: 'Тармак аты:',
    wifiPass: 'Сыр сөз:',
    ordersHistorySoon: 'Жакында бул жерде заказ тарыхы пайда болот.',
    profileSoon: 'Профиль жакында жеткиликтүү болот.',
  },
};
const en = {
  common: {
    basket: 'Basket',
    clearBasketConfirm: 'Clear the basket?',
    yes: 'Yes',
    cancel: 'Cancel',
    total: 'Total',
    goToBasket: 'Go to basket',
    callWaiter: 'Call waiter to table {{table}}',
    pay: 'Pay',
    phoneNumber: 'Phone number',
    comment: 'Comment',
    addComment: '+add a comment to the order',
    hideComment: 'Hide comment',
    checkoutProceed: 'Proceed to checkout',
    street: 'Street',
    entrance: 'Entrance',
    floor: 'Floor',
    apartment: 'Apartment',
    schedule: 'Work schedule',
    dayOff: 'Day off',
    roundTheClock: '24/7',
    infoNotProvided: 'Information is not provided.',
    asap: 'As soon as possible',
    tableLabel: 'Table №{{num}}',
    wifi: 'Wi‑Fi',
    wifiName: 'Network name:',
    wifiPass: 'Password:',
    ordersHistorySoon: 'Order history will appear here soon.',
    profileSoon: 'Profile will be available soon.',
  },
};

const resources = {
  ru: { common: ruCommon },
  kg: { common: kgCommon },
  en: { common: enCommon },
};

// Resolve initial language from localStorage or browser
function resolveInitialLng() {
  try {
    const stored = localStorage.getItem('lang');
    if (stored && resources[stored as keyof typeof resources]) return stored;
  } catch {}
  // Fallback to ru
  return 'ru';
}

// Initialize only once
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: resolveInitialLng(),
    fallbackLng: 'ru',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

// Helper to programmatically switch language and persist
export function setAppLanguage(lang: 'ru' | 'kg' | 'en') {
  localStorage.setItem('lang', lang);
  i18n.changeLanguage(lang);
}

export default i18n;
