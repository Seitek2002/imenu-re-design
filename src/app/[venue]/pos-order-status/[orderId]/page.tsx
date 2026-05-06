import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Header from '@/app/components/Header';

interface Props {
  params: Promise<{ venue: string; orderId: string }>;
}

export default async function PosOrderStatusPage({ params }: Props) {
  const { venue, orderId } = await params;
  const t = await getTranslations('PosOrderStatus');

  return (
    <main className='min-h-svh bg-[#F8F6F7] pb-10'>
      <Header title={t('title')} />

      <section className='px-4 pt-6 flex flex-col items-center text-center'>
        <div className='w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5'>
          <CheckCircle2 size={48} strokeWidth={2.2} />
        </div>

        <h1 className='text-2xl font-bold text-[#111111] mb-2'>
          {t('successTitle')}
        </h1>
        <p className='text-[#6B6B6B] text-sm leading-relaxed max-w-xs mb-1'>
          {t('successDesc')}
        </p>
        <p className='text-[#A4A4A4] text-xs mb-8'>
          {t('orderRef', { id: orderId })}
        </p>

        <div className='w-full max-w-xs flex flex-col gap-3'>
          <Link
            href={`/${venue}/table-order`}
            className='h-12 rounded-xl bg-brand text-white font-bold flex items-center justify-center active:scale-95 transition-transform shadow-md'
          >
            {t('backToTable')}
          </Link>
          <Link
            href={`/${venue}`}
            className='h-12 rounded-xl bg-white text-[#111111] font-bold flex items-center justify-center active:scale-95 transition-transform border border-[#E7E7E7]'
          >
            {t('backToMenu')}
          </Link>
        </div>
      </section>
    </main>
  );
}
