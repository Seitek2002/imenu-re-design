import { PAGES } from '@/config/pages.config';

import homeIcon from '@/assets/Footer/home.svg';
import basketIcon from '@/assets/Footer/basket.svg';
import historyIcon from '@/assets/Footer/history.svg';
import profileIcon from '@/assets/Footer/profile.svg';

export const getNavItems = (basePath: string) => [
  { icon: homeIcon, label: 'Главная', href: PAGES.HOME(basePath) },
  { icon: basketIcon, label: 'Корзина', href: PAGES.BASKET(basePath) },
  { icon: historyIcon, label: 'История', href: PAGES.HISTORY(basePath) },
  { icon: profileIcon, label: 'Профиль', href: PAGES.PROFILE(basePath) },
];
