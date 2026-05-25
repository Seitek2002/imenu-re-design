'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  useMyAddresses,
  useDeleteMyAddress,
  type MyAddress,
} from '@/lib/api/addresses';
import { useAuthStore } from '@/store/auth';
import AddressEditModal from '@/components/modals/AddressEditModal';
import { PROFILE_IN_DEVELOPMENT } from '../_inDevelopment';

export default function AddressesPage() {
  if (PROFILE_IN_DEVELOPMENT) return <ProfileRedirect />;
  return <AddressesPageReal />;
}

function ProfileRedirect() {
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${venue}/profile`);
  }, [router, venue]);
  return null;
}

function AddressesPageReal() {
  const t = useTranslations('Profile.addresses');
  const tProfile = useTranslations('Profile');
  const { venue } = useParams<{ venue: string }>();
  const hasToken = useAuthStore((s) => !!s.accessToken);
  const { data, isLoading } = useMyAddresses();
  const addresses = data ?? [];
  const [editing, setEditing] = useState<MyAddress | null | undefined>(
    undefined,
  );
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const del = useDeleteMyAddress();

  const isModalOpen = editing !== undefined;
  const canAdd = addresses.length < 10;

  const onDelete = async (id: number) => {
    try {
      await del.mutateAsync(id);
    } finally {
      setSwipedId(null);
    }
  };

  return (
    <div className='min-h-svh pb-32'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>
          {t('title')}
        </h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-2'>
        {!hasToken && (
          <div className='bg-white rounded-2xl p-6 text-center text-[13px] text-[#9E9E9E]'>
            {t('loginRequired')}
          </div>
        )}

        {hasToken && isLoading && (
          <div className='flex flex-col gap-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl px-4 py-3.5 h-[64px] animate-pulse'
              >
                <div className='h-3.5 w-24 bg-[#F4F1EE] rounded' />
                <div className='h-3 w-52 bg-[#F8F6F7] rounded mt-2' />
              </div>
            ))}
          </div>
        )}

        {hasToken && !isLoading && addresses.length === 0 && (
          <div className='bg-white rounded-2xl p-6 text-center text-[13px] text-[#9E9E9E]'>
            {t('empty')}
          </div>
        )}

        {hasToken &&
          addresses.map((a) => (
            <AddressRow
              key={a.id}
              address={a}
              swiped={swipedId === a.id}
              busyDelete={del.isPending}
              onTap={() => {
                if (swipedId === a.id) {
                  setSwipedId(null);
                  return;
                }
                setEditing(a);
              }}
              onSwipeLeft={() => setSwipedId(a.id)}
              onSwipeRight={() => setSwipedId(null)}
              onDelete={() => onDelete(a.id)}
              formatLine={formatAddressLine(a, t)}
            />
          ))}
      </div>

      {hasToken && canAdd && (
        <div className='fixed bottom-20 left-0 right-0 px-4 max-w-175 mx-auto'>
          <button
            type='button'
            onClick={() => setEditing(null)}
            className='w-full h-12 rounded-2xl bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(243,129,31,0.55)] active:scale-[0.99] transition-transform'
          >
            <Plus size={18} />
            {t('addNew')}
          </button>
        </div>
      )}

      <AddressEditModal
        isOpen={isModalOpen}
        onClose={() => setEditing(undefined)}
        address={editing ?? null}
      />
    </div>
  );
}

function formatAddressLine(
  a: MyAddress,
  t: (k: string, p?: Record<string, string | number>) => string,
): string {
  return [
    a.address,
    a.apartment && t('apartment', { value: a.apartment }),
    a.entrance && t('entrance', { value: a.entrance }),
    a.floor && t('floor', { value: a.floor }),
  ]
    .filter(Boolean)
    .join(', ');
}

interface RowProps {
  address: MyAddress;
  swiped: boolean;
  busyDelete: boolean;
  onTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDelete: () => void;
  formatLine: string;
}

function AddressRow({
  address,
  swiped,
  busyDelete,
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onDelete,
  formatLine,
}: RowProps) {
  const t = useTranslations('Profile.addresses');
  const isDefault = address.isDefault;

  // Простой touch-свайп влево/вправо без библиотек. Реагируем когда сдвиг по
  // X > 40 px, в этом случае показываем красную кнопку «Удалить».
  const onTouchStart = (e: React.TouchEvent) => {
    (e.currentTarget as HTMLElement).dataset.x = String(e.touches[0].clientX);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = Number((e.currentTarget as HTMLElement).dataset.x ?? '0');
    const dx = e.changedTouches[0].clientX - start;
    if (dx < -40) onSwipeLeft();
    else if (dx > 40) onSwipeRight();
  };

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={onDelete}
        disabled={busyDelete}
        aria-label={t('delete')}
        className='absolute top-0 bottom-0 right-0 w-[80px] rounded-2xl bg-[#E0533A] text-white text-[12px] font-medium flex flex-col items-center justify-center gap-1 disabled:opacity-60'
      >
        <Trash2 size={20} />
        {t('delete')}
      </button>

      <button
        type='button'
        onClick={onTap}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`relative w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition-transform duration-200 active:scale-[0.995] ${
          isDefault
            ? 'border border-[#E8A145] bg-[#FFFCF5]'
            : 'border border-[#EDEAE7]'
        } ${swiped ? '-translate-x-[88px]' : 'translate-x-0'}`}
      >
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='text-[14px] font-semibold text-[#21201F] truncate'>
              {address.label}
            </span>
            {isDefault && (
              <span className='text-[9px] font-medium text-[#F28A1A] bg-[#FFEBD0] px-1.5 py-0.5 rounded-full whitespace-nowrap'>
                {t('default')}
              </span>
            )}
          </div>
          <div className='mt-0.5 text-[12px] text-[#9E9E9E] truncate'>
            {formatLine}
          </div>
        </div>
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            isDefault
              ? 'bg-[linear-gradient(to_right,#FAA924_31%,#F3811F_71%)] text-white'
              : 'bg-[#F4F1EE] text-[#9E9E9E]'
          }`}
        >
          <ChevronRight size={16} />
        </span>
      </button>
    </div>
  );
}
