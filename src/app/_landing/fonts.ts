import { Commissioner, Martian_Mono } from 'next/font/google';

// Commissioner — одна вариативная гарнитура на весь лендинг. Ось FLAR даёт
// расширяющиеся «ресторанные» окончания (как на классических меню):
// в заголовках FLAR 100, в тексте 0. Подключаем только на `/`, остальное
// приложение продолжает жить на Inter/Cruinn из корневого layout.
export const landingSans = Commissioner({
  subsets: ['latin', 'cyrillic'],
  axes: ['FLAR', 'VOLM'],
  variable: '--font-lp-sans',
  display: 'swap',
});

// Моноширинный — только для чека и кухонных тикетов.
export const landingMono = Martian_Mono({
  subsets: ['latin', 'cyrillic'],
  axes: ['wdth'],
  variable: '--font-lp-mono',
  display: 'swap',
});
