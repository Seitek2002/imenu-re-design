import Header from '@/app/components/Header';
import ContentSkeleton from './components/ContentSkeleton';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const tc = await getTranslations('Categories');
  return (
    <main className='px-2.5 min-h-svh pb-32 bg-[#F8F6F7]'>
      <Header title={tc('defaultTitle')} showSearch={true} />
      <div
        role='status'
        aria-live='polite'
        className='flex items-center justify-center gap-2 py-3 text-sm text-gray-500'
      >
        <span className='w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin' />
        <span>{tc('loading')}</span>
      </div>
      <ContentSkeleton />
    </main>
  );
}
