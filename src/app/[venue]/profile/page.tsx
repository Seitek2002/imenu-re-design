'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Pencil,
  ArrowRight,
  ChevronRight,
  Plus,
  X,
  Store,
  ShoppingBag,
  MessageSquareText,
  MapPin,
  CreditCard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useClientStore } from '@/store/client';
import { useAuthStore } from '@/store/auth';
import { useClient, useClientBonus } from '@/lib/api/queries';
import { logoutAuth } from '@/lib/api/auth';
import { getCountryById } from '@/lib/helpers/countryCodes';
import { formatPhoneDisplay } from '@/lib/helpers/phone';
import EditProfileModal from '@/components/modals/EditProfileModal';
import OtpLoginModal from '@/components/modals/OtpLoginModal';

const TASTES = ['Без лука', 'Без кинзы', 'Без острого', 'Без чеснока'];
const ADDRESSES = [
  { id: 'home', label: 'Дом', address: 'ул. Киевская 95, кв. 12' },
  { id: 'work', label: 'Работа', address: 'пр. Чуй 219' },
];
const PAYMENTS = [
  { id: 'visa', brand: 'VISA', last: '4242' },
  { id: 'mc', brand: 'MC', last: '8810' },
];

export default function ProfilePage() {
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  const phone = useClientStore((s) => s.phone);
  const countryId = useClientStore((s) => s.countryId);
  const clear = useClientStore((s) => s.clear);
  const clearAuth = useAuthStore((s) => s.clear);
  const [editOpen, setEditOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const country = getCountryById(countryId);
  const fullPhone = phone
    ? formatPhoneDisplay(phone, country.dial, countryId)
    : '';

  const { data: client, isLoading: clientLoading } = useClient(phone);
  const { data: bonus, isLoading: bonusLoading } = useClientBonus({
    phone,
    venueSlug: venue,
  });

  const handleLogout = async () => {
    await logoutAuth();
    clearAuth();
    clear();
    router.push(`/${venue}`);
  };

  if (!phone) {
    return (
      <>
        <EmptyState
          venueSlug={venue}
          onLoginClick={() => setLoginOpen(true)}
        />
        <OtpLoginModal
          open={loginOpen}
          venueSlug={venue}
          onClose={() => setLoginOpen(false)}
          onSuccess={(result) => {
            // OTP-флоу заодно подтягивает phone — сохраняем его в гостевой стор,
            // чтобы существующие хуки (useClient/useClientBonus/useOrdersV2) работали.
            const digitsOnly = result.client.phone.replace(/\D/g, '');
            // нормализованный формат бэка: "996700001001" → берём локальные цифры
            const local = digitsOnly.startsWith('996')
              ? digitsOnly.slice(3)
              : digitsOnly;
            useClientStore.getState().saveClient({
              phone: local,
              countryId: 'KG',
            });
          }}
        />
      </>
    );
  }

  const displayName =
    [client?.firstname, client?.lastname].filter(Boolean).join(' ').trim() ||
    'Гость';

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>Аккаунт</h1>
        <button
          onClick={() => setEditOpen(true)}
          className='ml-auto w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Редактировать'
        >
          <Pencil size={18} />
        </button>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='grid grid-cols-[1.45fr_1fr] gap-3'>
          <button
            type='button'
            onClick={() => setEditOpen(true)}
            className='bg-white rounded-2xl p-4 text-left active:scale-[0.99] transition-transform'
          >
            <div className='text-[13px] text-[#9E9E9E]'>Имя</div>
            <div className='mt-1 flex items-center justify-between'>
              <span className='text-[15px] font-bold text-[#21201F] truncate'>
                {clientLoading ? '…' : displayName}
              </span>
              <Pencil size={14} className='text-[#9E9E9E] shrink-0' />
            </div>
            <div className='mt-3 text-[12px] text-[#9E9E9E]'>{fullPhone}</div>
          </button>
          <Link
            href={`/${venue}/profile/points`}
            className='bg-[#21201F] text-white rounded-2xl p-4 flex flex-col justify-between active:scale-[0.99] transition-transform'
          >
            <div className='flex items-center justify-between text-[12px] opacity-70'>
              <span>Баллы</span>
              <ArrowRight size={14} />
            </div>
            <div className='mt-2 text-[22px] font-extrabold'>
              {bonusLoading ? '…' : (bonus?.bonus ?? 0).toLocaleString('ru-RU').replace(',', ' ')}
            </div>
            {bonus?.clientGroup && bonus.clientGroup.loyaltyType !== '' && (
              <div className='mt-1 text-[11px] opacity-70 truncate'>
                {bonus.clientGroup.name}
                {bonus.clientGroup.discountPercent > 0 && (
                  <> · {bonus.clientGroup.loyaltyType === 'discount' ? '−' : '+'}
                  {bonus.clientGroup.discountPercent}%</>
                )}
              </div>
            )}
          </Link>
        </section>

        <SoonSection title='Вкусовые предпочтения' subtitle='Учтём при формировании заказа'>
          <div className='mt-3 flex flex-wrap gap-2'>
            {TASTES.map((t) => (
              <span
                key={t}
                className='inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#F4F1EE] text-[12px] text-[#21201F]'
              >
                {t}
                <X size={12} className='text-[#9E9E9E]' />
              </span>
            ))}
            <button className='inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full border border-dashed border-[#D7D2CC] text-[12px] text-[#9E9E9E]'>
              <Plus size={12} />
              Добавить
            </button>
          </div>
        </SoonSection>

        <SoonSection title='Мои адреса' count={ADDRESSES.length}>
          <div className='mt-3 grid grid-cols-3 gap-2'>
            {ADDRESSES.map((a) => (
              <div
                key={a.id}
                className='rounded-xl border border-[#EDEAE7] p-2.5 flex flex-col gap-2'
              >
                <div className='flex items-center gap-1.5'>
                  <MapPin size={14} className='text-brand' />
                  <span className='text-[12px] font-semibold'>{a.label}</span>
                </div>
                <div className='text-[11px] text-[#9E9E9E] leading-snug line-clamp-2'>
                  {a.address}
                </div>
              </div>
            ))}
            <button className='rounded-xl border border-dashed border-[#D7D2CC] flex flex-col items-center justify-center text-[#9E9E9E] gap-1 py-3'>
              <Plus size={16} />
              <span className='text-[11px]'>Добавить</span>
            </button>
          </div>
        </SoonSection>

        <SoonSection title='Способы оплаты' count={PAYMENTS.length}>
          <div className='mt-3 grid grid-cols-3 gap-2'>
            {PAYMENTS.map((p) => (
              <div
                key={p.id}
                className='rounded-xl border border-[#EDEAE7] p-2.5 flex flex-col gap-3'
              >
                <CreditCard size={18} className='text-[#21201F]' />
                <div className='flex items-center gap-1 text-[12px] text-[#21201F]'>
                  <span className='inline-flex gap-[2px]'>
                    <Dot /><Dot /><Dot /><Dot />
                  </span>
                  <span>{p.last}</span>
                </div>
              </div>
            ))}
            <button className='rounded-xl border border-dashed border-[#D7D2CC] flex flex-col items-center justify-center text-[#9E9E9E] gap-1 py-3'>
              <Plus size={16} />
              <span className='text-[11px]'>Добавить</span>
            </button>
          </div>
        </SoonSection>

        <section className='bg-white rounded-2xl p-4'>
          <div className='text-[13px] font-semibold text-[#21201F]'>Быстрые ссылки</div>
          <div className='mt-3 grid grid-cols-3 gap-2'>
            <Link
              href={`/${venue}/history`}
              className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'
            >
              <ShoppingBag size={20} />
              <span className='text-[11px]'>Заказы</span>
            </Link>
            <QuickLink icon={<Store size={20} />} label='Филиалы' />
            <QuickLink icon={<MessageSquareText size={20} />} label='Чат' />
          </div>
        </section>

        <button
          onClick={handleLogout}
          className='bg-white rounded-2xl p-4 flex items-center gap-3 text-[14px] text-[#E0533A] font-medium active:scale-[0.99] transition-transform'
        >
          <LogOut size={18} />
          Выйти из аккаунта
        </button>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        phone={phone}
        client={client}
      />
    </div>
  );
}

function EmptyState({
  venueSlug,
  onLoginClick,
}: {
  venueSlug: string;
  onLoginClick: () => void;
}) {
  return (
    <div className='min-h-svh pb-24 flex flex-col'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>Аккаунт</h1>
      </header>

      <div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
        <div className='w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-5'>
          <UserIcon size={36} className='text-[#C4B59C]' strokeWidth={1.5} />
        </div>
        <h2 className='text-[18px] font-bold text-[#21201F]'>Войдите в аккаунт</h2>
        <p className='mt-2 text-[13px] text-[#9E9E9E] max-w-xs'>
          Подтвердите номер телефона по SMS — увидите историю заказов, баллы и сможете быстрее оформлять доставку.
        </p>
        <button
          onClick={onLoginClick}
          className='mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium active:scale-[0.99] transition-transform'
        >
          Войти по SMS
        </button>
        <Link
          href={`/${venueSlug}`}
          className='mt-3 text-[13px] text-[#9E9E9E] underline-offset-2 hover:underline'
        >
          Перейти в меню
        </Link>
      </div>
    </div>
  );
}

function SoonSection({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className='bg-white rounded-2xl p-4 relative'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-[13px] font-semibold text-[#21201F]'>
            {title}
            {count != null && (
              <span className='text-[#9E9E9E] font-normal ml-1'>({count})</span>
            )}
          </div>
          {subtitle && (
            <div className='mt-1 text-[12px] text-[#9E9E9E]'>{subtitle}</div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] uppercase tracking-wide text-[#9E9E9E] bg-[#F4F1EE] px-2 py-0.5 rounded-full'>
            скоро
          </span>
          <button className='flex items-center gap-1 text-[12px] text-[#9E9E9E]'>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function QuickLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'>
      {icon}
      <span className='text-[11px]'>{label}</span>
    </button>
  );
}

function Dot() {
  return <span className='w-[3px] h-[3px] rounded-full bg-[#21201F]' />;
}
