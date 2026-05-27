import { getCountryById } from './countryCodes';

// Юзер вводит локальные 9 цифр после префикса "+996" (см. DrawerCheckout).
// Бекенд хранит и ищет клиентов по полному международному формату "996XXXXXXXXX".
// Эта функция нормализует ввод любой формы в "996XXXXXXXXX" перед отправкой.
export function normalizePhoneForApi(raw: string, dialCode: string = '996'): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith(dialCode)) return digits;
  if (digits.startsWith('0')) return dialCode + digits.slice(1);
  return dialCode + digits;
}

// Форматирует локальные цифры для отображения в поле ввода (без кода страны).
// KG (9):    XXX XXX XXX   →  700 123 456
// RU/KZ (10): XXX XXX-XX-XX →  900 123-45-67
// US (10):   XXX XXX-XXXX  →  212 555-0123
export function formatPhoneInput(digits: string, countryId: string): string {
  const d = (digits || '').replace(/\D/g, '');
  if (countryId === 'KG') {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`;
  }
  if (countryId === 'US') {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  }
  // RU / KZ
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
}

// Форматирует номер для отображения с кодом страны: "+996 700 12 34 56"
export function formatPhoneDisplay(digits: string, dial: string, countryId: string): string {
  if (!digits) return '';
  return `+${dial} ${formatPhoneInput(digits, countryId)}`;
}

// Маска для OTP-модалки. Принимает полный международный номер без "+" ("996700123456").
// KG    → +996 7** ** ** 56
// RU/KZ → +7 9** ***-**-67
// US    → +1 2** ***-0123
export function formatPhoneMasked(fullPhone: string): string {
  const d = (fullPhone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('996') && d.length === 12) {
    const local = d.slice(3);
    return `+996 ${local[0]}** ** ** ${local.slice(-2)}`;
  }
  if (d.startsWith('7') && d.length === 11) {
    const local = d.slice(1);
    return `+7 ${local[0]}** ***-**-${local.slice(-2)}`;
  }
  if (d.startsWith('1') && d.length === 11) {
    const local = d.slice(1);
    return `+1 ${local[0]}** ***-${local.slice(-4)}`;
  }
  return `+${d.slice(0, -3).replace(/\d/g, '*')}${d.slice(-3)}`;
}

// Умный парсер ввода/вставки: определяет страну и возвращает чистые локальные цифры.
// Обрабатывает: +996..., +7..., 8..., 0XXX..., форматированные строки с пробелами/дефисами.
export function parsePhoneInput(
  raw: string,
  currentCountryId: string,
): { digits: string; countryId: string } {
  const stripped = (raw || '').replace(/\D/g, '');
  if (!stripped) return { digits: '', countryId: currentCountryId };

  // Международный формат: начинается с "+" или слишком длинный для локального
  const looksInternational = (raw || '').trimStart().startsWith('+') || stripped.length > 10;
  if (looksInternational) {
    if (stripped.startsWith('996')) {
      return { digits: stripped.slice(3, 12), countryId: 'KG' };
    }
    if (stripped.startsWith('7') && stripped.length === 11) {
      const id = ['KZ', 'RU'].includes(currentCountryId) ? currentCountryId : 'KZ';
      return { digits: stripped.slice(1, 11), countryId: id };
    }
    if (stripped.startsWith('8') && stripped.length === 11) {
      const id = ['KZ', 'RU'].includes(currentCountryId) ? currentCountryId : 'KZ';
      return { digits: stripped.slice(1, 11), countryId: id };
    }
    if (stripped.startsWith('1') && stripped.length === 11) {
      return { digits: stripped.slice(1, 11), countryId: 'US' };
    }
  }

  // Локальный ввод: убираем ведущий 0
  let local = stripped;
  if (local.startsWith('0')) local = local.slice(1);
  const country = getCountryById(currentCountryId);
  return { digits: local.slice(0, country.length), countryId: currentCountryId };
}
