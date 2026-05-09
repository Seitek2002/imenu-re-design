'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

interface Props {
  expiresAt: string;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PaymentCountdown({ expiresAt }: Props) {
  const t = useTranslations('OrderStatus');
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  const remaining = target - now;
  const expired = remaining <= 0;

  return (
    <div
      className={`flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold ${
        expired
          ? 'bg-red-50 text-red-700'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      <Clock size={16} strokeWidth={2.5} />
      {expired ? (
        <span>{t('paymentExpired')}</span>
      ) : (
        <span>
          {t('paymentExpiresIn', { time: formatRemaining(remaining) })}
        </span>
      )}
    </div>
  );
}
