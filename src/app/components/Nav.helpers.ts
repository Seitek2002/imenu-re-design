import homeIcon from '@/assets/Footer/home.svg';
import cartIcon from '@/assets/Footer/basket.svg';
import historyIcon from '@/assets/Footer/history.svg';
import profileIcon from '@/assets/Footer/profile.svg';

export type NavItemKey = 'home' | 'cart' | 'history' | 'profile';

export const getNavItems = (venueSlug: string, homeUrl?: string) => {
  const mainLink = homeUrl || `/${venueSlug}`;

  return [
    {
      key: 'home' as NavItemKey,
      href: mainLink,
      icon: homeIcon,
    },
    {
      key: 'cart' as NavItemKey,
      href: `/${venueSlug}/cart`,
      icon: cartIcon,
    },
    {
      key: 'history' as NavItemKey,
      href: `/${venueSlug}/history`,
      icon: historyIcon,
    },
    {
      key: 'profile' as NavItemKey,
      href: `/${venueSlug}/profile`,
      icon: profileIcon,
    },
  ];
};
