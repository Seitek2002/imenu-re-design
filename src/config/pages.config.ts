export const PAGES = {
  HOME: (venue: string) => `${venue}`,
  FOODS: (venue: string) => `${venue}/foods`,
  MENU: (slug: string) => `menu?category=${slug}`,
  BASKET: (venue: string) => `${venue}/basket`,
  HISTORY: (venue: string) => `${venue}/history`,
  PROFILE: (venue: string) => `${venue}/profile`,
};
