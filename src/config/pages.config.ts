export const PAGES = {
  HOME: (venue: string) => `${venue}`,
  FOODS: (venue: string) => `${venue}/foods`,
  MENU: (slug: string) => `menu?category=${slug}`,
  BASKET: '/basket',
  HISTORY: '/history',
  PROFILE: '/profile',
};
