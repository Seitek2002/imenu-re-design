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
