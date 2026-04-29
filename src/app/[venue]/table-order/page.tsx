import Header from '@/app/components/Header';
import { getTranslations } from 'next-intl/server';
import CurrentOrderView from './components/CurrentOrderView';

interface Props {
  params: Promise<{ venue: string }>;
}

export default async function TableOrderPage({ params }: Props) {
  const { venue } = await params;
  const t = await getTranslations('TableOrder');

  return (
    <main className='min-h-svh bg-[#F8F6F7] pb-10'>
      <Header title={t('title')} />
      <div className='px-4 pt-2'>
        <CurrentOrderView venueSlug={venue} />
      </div>
    </main>
  );
}
