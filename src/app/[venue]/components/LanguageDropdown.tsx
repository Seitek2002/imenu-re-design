'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALES, type Locale } from '@/lib/locale';
import { useAuthStore } from '@/store/auth';
import { updateMyProfile } from '@/lib/api/me';
import { Globe } from 'lucide-react';
import GB from 'country-flag-icons/react/3x2/GB';
import RU from 'country-flag-icons/react/3x2/RU';
import KG from 'country-flag-icons/react/3x2/KG';

const SETTLE_DELAY_MS = 120;

export default function LanguageDropdown() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isQueued, setIsQueued] = useState(false);

  // Snapshot pathname at the moment user pressed the button. We won't run
  // refresh until pathname stops changing — guards against the race where
  // the user taps a category link and the language switch at the same time.
  const queuedAtPathRef = useRef<string | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const runRefresh = () => {
    setIsQueued(false);
    queuedAtPathRef.current = null;
    startTransition(() => router.refresh());
  };

  // Прогрев Data Cache на сервере для остальных локалей. После idle
  // дёргаем route handler — он триггерит серверные fetch'и с другим
  // Accept-Language, и при реальном переключении ответы уже в кэше.
  useEffect(() => {
    const venueSlug = pathname.split('/').filter(Boolean)[0];
    if (!venueSlug) return;

    const others = LOCALES.filter((l) => l !== locale);

    const run = () => {
      others.forEach((l) => {
        fetch(`/api/prefetch-locale?venue=${encodeURIComponent(venueSlug)}&locale=${l}`, {
          cache: 'no-store',
          keepalive: true,
        }).catch(() => {});
      });
    };

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;
    let handle: number;
    let isIdle = false;
    if (typeof w.requestIdleCallback === 'function') {
      isIdle = true;
      handle = w.requestIdleCallback(run, { timeout: 4000 });
    } else {
      handle = window.setTimeout(run, 1500);
    }
    return () => {
      if (isIdle && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
    // venueSlug определяется из pathname; перезапуск при смене venue/locale ок
  }, [locale, pathname]);

  useEffect(() => {
    if (!isQueued) return;

    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
    }
    // Re-arm the settle timer on every pathname change while queued.
    settleTimerRef.current = window.setTimeout(() => {
      runRefresh();
    }, SETTLE_DELAY_MS);

    return () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQueued, pathname]);

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    if (isPending || isQueued) return;
    if (navigator.vibrate) navigator.vibrate(40);
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${maxAge}; SameSite=Lax`;
    queuedAtPathRef.current = pathname;
    setIsQueued(true);

    // Если пользователь авторизован — синхронизируем выбор с бэком,
    // чтобы SMS/уведомления приходили на нужном языке. Fire-and-forget.
    const { accessToken, updateClient, client } = useAuthStore.getState();
    if (accessToken && client?.locale !== next) {
      updateMyProfile({ locale: next })
        .then((c) => updateClient(c))
        .catch(() => {
          // тихая ошибка — UI-локаль уже переключилась
        });
    }
  };

  const CYCLE: Locale[] = ['ru', 'ky', 'en'];
  const cycleNext = () => {
    const next = CYCLE[(CYCLE.indexOf(locale) + 1) % CYCLE.length];
    switchTo(next);
  };

  const FLAG = { ru: RU, ky: KG, en: GB };
  const LABEL = { ru: 'RU', ky: 'KY', en: 'EN' };
  const Flag = FLAG[locale];

  const disabled = isPending || isQueued;

  return (
    <button
      onClick={cycleNext}
      disabled={disabled}
      className='flex items-center gap-1.5 h-10 px-3 rounded-[14px] bg-[#FAFAFA] text-sm font-bold cursor-pointer active:bg-gray-100 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-all disabled:opacity-60'
      aria-label='Change language'
    >
      <Globe size={15} className='text-gray-400 shrink-0' />
      <Flag className='w-5 h-auto rounded-[3px]' />
      <span>{LABEL[locale]}</span>
    </button>
  );
}
