'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from '@/lib/locale';
import { Globe } from 'lucide-react';
import GB from 'country-flag-icons/react/3x2/GB';
import RU from 'country-flag-icons/react/3x2/RU';
import KG from 'country-flag-icons/react/3x2/KG';

export default function LanguageDropdown() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    if (navigator.vibrate) navigator.vibrate(40);
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${maxAge}; SameSite=Lax`;
    startTransition(() => router.refresh());
  };

  const CYCLE: Locale[] = ['ru', 'ky', 'en'];
  const cycleNext = () => {
    const next = CYCLE[(CYCLE.indexOf(locale) + 1) % CYCLE.length];
    switchTo(next);
  };

  const FLAG = { ru: RU, ky: KG, en: GB };
  const LABEL = { ru: 'RU', ky: 'KY', en: 'EN' };
  const Flag = FLAG[locale];

  return (
    <button
      onClick={cycleNext}
      disabled={isPending}
      className='flex items-center gap-1.5 h-10 px-3 rounded-[14px] bg-[#FAFAFA] text-sm font-bold cursor-pointer active:bg-gray-100 transition-all disabled:opacity-60'
      aria-label='Change language'
    >
      <Globe size={15} className='text-gray-400 shrink-0' />
      <Flag className='w-5 h-auto rounded-[3px]' />
      <span>{LABEL[locale]}</span>
    </button>
  );
}
