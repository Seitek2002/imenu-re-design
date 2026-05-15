import Header from '@/app/components/Header';
import CategoriesSkeleton from './components/CategoriesSkeleton';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const tc = await getTranslations('Categories');
  return (
    <main className='px-2.5 min-h-svh pb-28 bg-[#F8F6F7]'>
      <Header title={tc('defaultTitle')} showSearch={false} />
      <CategoriesSkeleton />
    </main>
  );
}
