export interface CountryCode {
  id: string;
  name: string;
  dial: string;
  flag: string;
  length: number;
  placeholder: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { id: 'KG', name: 'Кыргызстан', dial: '996', flag: '🇰🇬', length: 9, placeholder: '700123456' },
  { id: 'RU', name: 'Россия',     dial: '7',   flag: '🇷🇺', length: 10, placeholder: '9001234567' },
  { id: 'KZ', name: 'Казахстан',  dial: '7',   flag: '🇰🇿', length: 10, placeholder: '7001234567' },
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0];

export function getCountryById(id: string | undefined | null): CountryCode {
  return COUNTRY_CODES.find((c) => c.id === id) ?? DEFAULT_COUNTRY;
}
