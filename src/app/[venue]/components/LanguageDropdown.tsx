'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  LOCALES,
  LOCALE_COOKIE,
  type Locale,
} from '@/lib/locale';

const LABELS: Record<Locale, string> = {
  ru: 'RU',
  ky: 'KY',
  en: 'EN',
};

export default function LanguageDropdown() {
  const locale = useLocale() as Locale;
  const t = useTranslations('Common.languageNames');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const closePopover = () => {
    const popover = document.getElementById('lang-menu');
    if (popover && popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  };

  const handleSelect = (next: Locale) => {
    closePopover();
    if (next === locale) return;

    if (navigator.vibrate) navigator.vibrate(40);

    // 1 год, path=/ — чтобы применялся везде в приложении.
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${maxAge}; SameSite=Lax`;

    // Пересобираем серверный рендер (подтянет новые messages из cookie)
    // и заодно инвалидирует RSC кэш — клиентские хуки ловят новую локаль
    // через useLocale() и автоматически рефетчат благодаря locale в queryKey.
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className='relative'>
      <button
        popoverTarget='lang-menu'
        disabled={isPending}
        className='flex items-center gap-1.5 p-2.5 rounded-[14px] bg-[#FAFAFA] cursor-pointer font-bold text-sm disabled:opacity-60'
      >
        <span>{LABELS[locale]}</span>
        <svg
          width='16'
          height='16'
          viewBox='0 0 18 18'
          fill='none'
          className='opacity-50'
        >
          <path
            d='M13.5 6.75L9 12.375L4.125 6.75'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      <div
        id='lang-menu'
        popover='auto'
        className='absolute m-0 p-1.5 w-36 rounded-2xl border border-gray-100 bg-white shadow-2xl backdrop:bg-transparent'
        style={{
          inset: 'auto',
          top: 'calc(anchor(bottom) + 8px)',
          right: 'anchor(right)',
        }}
      >
        <div className='flex flex-col gap-1'>
          {LOCALES.map((opt) => (
            <button
              key={opt}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                locale === opt
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'active:bg-gray-100'
              }`}
              onClick={() => handleSelect(opt)}
            >
              {t(opt)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
