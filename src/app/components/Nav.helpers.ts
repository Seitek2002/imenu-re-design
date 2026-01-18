import homeIcon from '@/assets/Footer/home.svg';
import cartIcon from '@/assets/Footer/basket.svg';
import historyIcon from '@/assets/Footer/history.svg';
import profileIcon from '@/assets/Footer/profile.svg';

export const getNavItems = (venueSlug: string, homeUrl?: string) => {
  const mainLink = homeUrl || `/${venueSlug}`;

  return [
    {
      label: 'Главная',
      href: mainLink, // 🔥 Теперь ссылка динамическая
      icon: homeIcon,
    },
    {
      label: 'Корзина',
      href: `/${venueSlug}/cart`,
      icon: cartIcon,
    },
    {
      label: 'История',
      href: `/${venueSlug}/history`,
      icon: historyIcon,
    },
    {
      label: 'Профиль',
      href: `/${venueSlug}/profile`,
      icon: profileIcon,
    },
  ];
};
