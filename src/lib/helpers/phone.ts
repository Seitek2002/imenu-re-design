// Юзер вводит локальные 9 цифр после префикса "+996" (см. DrawerCheckout).
// Бекенд хранит и ищет клиентов по полному международному формату "996XXXXXXXXX".
// Эта функция нормализует ввод любой формы в "996XXXXXXXXX" перед отправкой.
export function normalizePhoneForApi(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('996')) return digits;
  if (digits.startsWith('0')) return '996' + digits.slice(1);
  return '996' + digits;
}
