'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePaymentRedirect } from '@/store/payment-redirect';

/**
 * Полноэкранный оверлей «уходим на оплату». Слушает usePaymentRedirect: когда
 * выставлен url, показывает спиннер и уводит браузер на платёжный шлюз.
 *
 * Внутренний экран вынесен в RedirectingScreen с key={url} — так его состояние
 * (showManual) всегда стартует свежим на каждый новый редирект, без синхронного
 * setState в эффекте.
 */
export default function PaymentRedirectOverlay() {
  const url = usePaymentRedirect((s) => s.url);
  if (!url) return null;
  return <RedirectingScreen key={url} url={url} />;
}

function RedirectingScreen({ url }: { url: string }) {
  const t = useTranslations('OrderStatus');
  const reset = usePaymentRedirect((s) => s.reset);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // Навигацию запускаем на следующем кадре, чтобы оверлей успел отрисоваться —
    // иначе на задержке загрузки страницы шлюза был бы виден замёрший UI.
    const nav = requestAnimationFrame(() => {
      window.location.href = url;
    });
    // Фолбэк: если за 6с страница не сменилась (шлюз тормозит / редирект
    // не сработал) — показываем ручную ссылку.
    const fallback = setTimeout(() => setShowManual(true), 6000);
    // bfcache: вернулись «назад» со шлюза — страница восстановлена из памяти,
    // url в сторе ещё выставлен. Сбрасываем, чтобы не залипнуть на спиннере.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      cancelAnimationFrame(nav);
      clearTimeout(fallback);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [url, reset]);

  return (
    <div className='fixed inset-0 z-[300] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm px-8 text-center'>
      <Loader2 className='animate-spin text-brand' size={40} />
      <p className='text-lg font-semibold text-[#111111]'>{t('redirecting')}</p>
      <p className='max-w-xs text-sm text-[#6B6B6B]'>{t('redirectingDesc')}</p>
      {showManual && (
        <a
          href={url}
          className='mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-white transition-transform active:scale-95'
        >
          {t('redirectManual')}
        </a>
      )}
    </div>
  );
}
