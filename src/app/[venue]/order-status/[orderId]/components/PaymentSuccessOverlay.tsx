'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'payment_success';

/** Call before navigating to order-status to trigger the overlay */
export function markPaymentSuccess(orderId: string | number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(orderId));
  } catch {
    // SSR / private-browsing guard
  }
}

interface Props {
  orderId: string | number;
}

export default function PaymentSuccessOverlay({ orderId }: Props) {
  const t = useTranslations('OrderStatus');
  const [visible, setVisible] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === String(orderId)) {
        sessionStorage.removeItem(STORAGE_KEY);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [fading, setFading] = useState(false);

  // no auto-hide — user dismisses by tapping

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={dismiss}
    >
      <div
        className={`bg-white rounded-3xl p-8 mx-6 flex flex-col items-center text-center shadow-xl transition-all duration-300 ${
          fading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className='w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5'>
          <CheckCircle2 size={48} strokeWidth={2.2} />
        </div>
        <h2 className='text-2xl font-bold text-[#111111] mb-2'>
          {t('paymentSuccess')}
        </h2>
        <p className='text-[#6B6B6B] text-sm leading-relaxed max-w-xs'>
          {t('paymentSuccessDesc')}
        </p>
      </div>
    </div>
  );
}
