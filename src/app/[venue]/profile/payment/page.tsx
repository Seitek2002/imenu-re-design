'use client';

/**
 * Способы оплаты — статичная страница по макету. Бэкенд сохранённых карт пока
 * нет (см. project_kuma_request_2026_05_24_p2_deferred). Когда появится — здесь
 * нужно подцепить хук вроде useMyCards() и принять/убрать «Основной».
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, CreditCard, Plus, QrCode, Wallet } from 'lucide-react';
import { PROFILE_IN_DEVELOPMENT } from '../_inDevelopment';

interface MockCard {
  id: string;
  brand: 'visa' | 'mastercard';
  last4: string;
  isDefault: boolean;
}

const MOCK_CARDS: MockCard[] = [
  { id: '1', brand: 'visa', last4: '4242', isDefault: true },
  { id: '2', brand: 'visa', last4: '2585', isDefault: false },
];

export default function PaymentMethodsPage() {
  if (PROFILE_IN_DEVELOPMENT) return <ProfileRedirect />;
  return <PaymentMethodsPageReal />;
}

function ProfileRedirect() {
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${venue}/profile`);
  }, [router, venue]);
  return null;
}

function PaymentMethodsPageReal() {
  const t = useTranslations('Profile.payment');
  const tProfile = useTranslations('Profile');
  const { venue } = useParams<{ venue: string }>();

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
          {t('titleAll')}
        </h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-2'>
        <section className='bg-white rounded-2xl p-4'>
          <div className='text-[13px] font-semibold text-[#21201F]'>
            {t('cardsTitle')}
          </div>
          <ul className='mt-3 flex flex-col gap-2'>
            {MOCK_CARDS.map((c) => (
              <li key={c.id}>
                <button
                  type='button'
                  className={`w-full rounded-2xl px-3 py-3 flex items-center gap-3 text-left active:scale-[0.995] transition-transform ${
                    c.isDefault
                      ? 'border border-[#E8A145] bg-[#FFFCF5]'
                      : 'border border-[#EDEAE7] bg-white'
                  }`}
                >
                  <span className='shrink-0 w-12 h-8 rounded-md bg-white border border-[#EDEAE7] flex items-center justify-center'>
                    <CreditCard size={16} className='text-[#1A1F71]' />
                  </span>
                  <span className='text-[14px] text-[#21201F] tracking-widest font-medium'>
                    ••••{c.last4}
                  </span>
                  {c.isDefault && (
                    <span className='ml-auto text-[9px] font-medium text-[#F28A1A] bg-[#FFEBD0] px-1.5 py-0.5 rounded-full whitespace-nowrap'>
                      {t('default')}
                    </span>
                  )}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      c.isDefault
                        ? 'bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white'
                        : 'bg-[#F4F1EE] text-[#9E9E9E]'
                    } ${c.isDefault ? '' : 'ml-auto'}`}
                  >
                    <ChevronRight size={16} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type='button'
            className='mt-3 w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform'
          >
            <Plus size={18} />
            {t('addCard')}
          </button>
        </section>

        <section className='bg-white rounded-2xl p-4'>
          <div className='text-[13px] font-semibold text-[#21201F]'>
            {t('otherTitle')}
          </div>
          <ul className='mt-3 flex flex-col gap-2'>
            <li className='rounded-2xl border border-[#EDEAE7] px-3 py-3 flex items-center gap-3'>
              <span className='shrink-0 w-9 h-9 rounded-full bg-[#EAF7EC] flex items-center justify-center'>
                <Wallet size={18} className='text-[#22A05A]' />
              </span>
              <span className='text-[14px] text-[#21201F]'>{t('cash')}</span>
            </li>
            <li className='rounded-2xl border border-[#EDEAE7] px-3 py-3 flex items-center gap-3'>
              <span className='shrink-0 w-9 h-9 rounded-full bg-[#FDF2E5] flex items-center justify-center'>
                <QrCode size={18} className='text-[#E0871A]' />
              </span>
              <span className='text-[14px] text-[#21201F]'>{t('qr')}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
