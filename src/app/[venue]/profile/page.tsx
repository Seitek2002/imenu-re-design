'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  Loader2,
} from 'lucide-react';
import { useClientStore } from '@/store/client';
import { useAuthStore } from '@/store/auth';
import { useClientBonus } from '@/lib/api/queries';
import { useUpdateMe } from '@/lib/api/me';
import { useMyAddresses, type MyAddress } from '@/lib/api/addresses';
import { logoutAuth } from '@/lib/api/auth';
import { getCountryById } from '@/lib/helpers/countryCodes';
import { formatPhoneDisplay } from '@/lib/helpers/phone';
import EditProfileModal from '@/components/modals/EditProfileModal';
import AddressEditModal from '@/components/modals/AddressEditModal';
import OtpLoginModal from '@/components/modals/OtpLoginModal';

const PAYMENTS = [
  { id: 'visa', brand: 'VISA', last: '4242' },
  { id: 'mc', brand: 'MC', last: '8810' },
];

const MAX_TASTES = 20;
const MAX_TASTE_LEN = 32;

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  const phone = useClientStore((s) => s.phone);
  const countryId = useClientStore((s) => s.countryId);
  const clear = useClientStore((s) => s.clear);
  const clearAuth = useAuthStore((s) => s.clear);
  const client = useAuthStore((s) => s.client);
  const hasToken = useAuthStore((s) => !!s.accessToken);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const softLoggedOut = useAuthStore((s) => s.softLoggedOut);
  const acknowledgeRelogin = useAuthStore((s) => s.acknowledgeRelogin);
  const [editOpen, setEditOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Soft-logout: refresh упал 401, но телефон в clientStore остался —
  // модалка открывается автоматически. Закрытие → acknowledgeRelogin
  // обнулит флаг и derived `autoOpen` станет false.
  const autoOpenLogin = bootstrapped && softLoggedOut && !!phone && !hasToken;
  const isLoginModalOpen = loginOpen || autoOpenLogin;

  const country = getCountryById(countryId);
  const fullPhone = phone
    ? formatPhoneDisplay(phone, country.dial, countryId)
    : '';

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

  const requireAuth = () => {
    if (!hasToken) {
      setLoginOpen(true);
      return false;
    }
    return true;
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
            const digitsOnly = result.client.phone.replace(/\D/g, '');
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
    t('guest');

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={t('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>{t('title')}</h1>
        <button
          onClick={() => requireAuth() && setEditOpen(true)}
          className='ml-auto w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={t('edit')}
        >
          <Pencil size={18} />
        </button>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='grid grid-cols-[1.45fr_1fr] gap-3'>
          <button
            type='button'
            onClick={() => requireAuth() && setEditOpen(true)}
            className='bg-white rounded-2xl p-4 text-left active:scale-[0.99] transition-transform'
          >
            <div className='text-[13px] text-[#9E9E9E]'>{t('nameLabel')}</div>
            <div className='mt-1 flex items-center justify-between'>
              <span className='text-[15px] font-bold text-[#21201F] truncate'>
                {displayName}
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
              <span>{t('bonusLabel')}</span>
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

        <TastesSection
          tastes={client?.tastes ?? []}
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

        <AddressesSection
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

        <SoonSection title={t('payments.title')} count={PAYMENTS.length}>
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
              <span className='text-[11px]'>{t('payments.add')}</span>
            </button>
          </div>
        </SoonSection>

        <section className='bg-white rounded-2xl p-4'>
          <div className='text-[13px] font-semibold text-[#21201F]'>{t('quickLinks.title')}</div>
          <div className='mt-3 grid grid-cols-3 gap-2'>
            <Link
              href={`/${venue}/history`}
              className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'
            >
              <ShoppingBag size={20} />
              <span className='text-[11px]'>{t('quickLinks.orders')}</span>
            </Link>
            <QuickLink icon={<Store size={20} />} label={t('quickLinks.venues')} />
            <QuickLink icon={<MessageSquareText size={20} />} label={t('quickLinks.chat')} />
          </div>
        </section>

        <button
          onClick={handleLogout}
          className='bg-white rounded-2xl p-4 flex items-center gap-3 text-[14px] text-[#E0533A] font-medium active:scale-[0.99] transition-transform'
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
      />

      <OtpLoginModal
        open={isLoginModalOpen}
        venueSlug={venue}
        initialPhone={phone || undefined}
        initialCountryId={countryId}
        onClose={() => {
          setLoginOpen(false);
          // Если открылись из-за soft-logout — гасим флаг, чтобы модалка
          // не вылезала повторно при каждой навигации/refresh пока сессия мертва.
          if (softLoggedOut) acknowledgeRelogin();
        }}
        onSuccess={() => {
          // store.client уже обновлён OtpLoginModal'ом — больше ничего не нужно.
          // setSession внутри OtpLoginModal'а сам обнулит softLoggedOut.
        }}
      />
    </div>
  );
}

function AddressesSection({
  authed,
  onLoginRequired,
}: {
  authed: boolean;
  onLoginRequired: () => void;
}) {
  const t = useTranslations('Profile.addresses');
  const { data, isLoading } = useMyAddresses();
  const addresses = data ?? [];
  const [editing, setEditing] = useState<MyAddress | null | undefined>(
    undefined,
  );
  const isModalOpen = editing !== undefined;

  const open = (addr: MyAddress | null) => {
    if (!authed) {
      onLoginRequired();
      return;
    }
    if (addr === null && addresses.length >= 10) return;
    setEditing(addr);
  };

  return (
    <section className='bg-white rounded-2xl p-4 relative'>
      <div className='flex items-center justify-between'>
        <div className='text-[13px] font-semibold text-[#21201F]'>
          {t('title')}
          {addresses.length > 0 && (
            <span className='text-[#9E9E9E] font-normal ml-1'>
              ({addresses.length})
            </span>
          )}
        </div>
      </div>

      <div className='mt-3 grid grid-cols-3 gap-2'>
        {authed &&
          addresses.map((a) => (
            <button
              key={a.id}
              type='button'
              onClick={() => open(a)}
              className='rounded-xl border border-[#EDEAE7] p-2.5 flex flex-col gap-2 text-left active:scale-[0.98] transition-transform'
            >
              <div className='flex items-center gap-1.5'>
                <MapPin size={14} className='text-brand shrink-0' />
                <span className='text-[12px] font-semibold truncate'>
                  {a.label}
                </span>
                {a.isDefault && (
                  <span className='ml-auto text-[9px] uppercase tracking-wide text-[#9E9E9E] bg-[#F4F1EE] px-1.5 py-0.5 rounded-full'>
                    {t('default')}
                  </span>
                )}
              </div>
              <div className='text-[11px] text-[#9E9E9E] leading-snug line-clamp-2'>
                {a.address}
              </div>
            </button>
          ))}

        {(!authed || addresses.length < 10) && (
          <button
            type='button'
            onClick={() => open(null)}
            className='rounded-xl border border-dashed border-[#D7D2CC] flex flex-col items-center justify-center text-[#9E9E9E] gap-1 py-3'
          >
            <Plus size={16} />
            <span className='text-[11px]'>{t('add')}</span>
          </button>
        )}
      </div>

      {authed && isLoading && addresses.length === 0 && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>{t('loading')}</div>
      )}

      {!authed && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>
          {t('loginRequired')}
        </div>
      )}

      <AddressEditModal
        isOpen={isModalOpen}
        onClose={() => setEditing(undefined)}
        address={editing ?? null}
      />
    </section>
  );
}

function TastesSection({
  tastes,
  authed,
  onLoginRequired,
}: {
  tastes: string[];
  authed: boolean;
  onLoginRequired: () => void;
}) {
  const t = useTranslations('Profile.tastes');
  const update = useUpdateMe();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canAddMore = tastes.length < MAX_TASTES;

  const startAdd = () => {
    if (!authed) {
      onLoginRequired();
      return;
    }
    if (!canAddMore) return;
    setDraft('');
    setAdding(true);
    queueMicrotask(() => inputRef.current?.focus());
  };

  const commitAdd = async () => {
    const value = draft.trim().slice(0, MAX_TASTE_LEN);
    if (!value) {
      setAdding(false);
      return;
    }
    if (tastes.includes(value)) {
      setAdding(false);
      setDraft('');
      return;
    }
    try {
      await update.mutateAsync({ tastes: [...tastes, value] });
    } catch {
      // ошибка не критична — оставим инпут открытым
      return;
    }
    setAdding(false);
    setDraft('');
  };

  const remove = async (t: string) => {
    if (!authed) {
      onLoginRequired();
      return;
    }
    try {
      await update.mutateAsync({ tastes: tastes.filter((x) => x !== t) });
    } catch {
      // silent — пользователь увидит, что чип не пропал
    }
  };

  return (
    <section className='bg-white rounded-2xl p-4 relative'>
      <div>
        <div className='text-[13px] font-semibold text-[#21201F]'>
          {t('title')}
        </div>
        <div className='mt-1 text-[12px] text-[#9E9E9E]'>
          {t('subtitle')}
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-2 items-center'>
        {tastes.map((taste) => (
          <span
            key={taste}
            className='inline-flex items-center gap-1.5 h-[30px] pl-3 pr-1.5 rounded-full bg-[#F4F1EE] text-[12px] text-[#21201F]'
          >
            {taste}
            <button
              type='button'
              onClick={() => remove(taste)}
              disabled={update.isPending}
              className='w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-[#EDEAE7] disabled:opacity-50'
              aria-label={t('remove', { name: taste })}
            >
              <X size={12} className='text-[#9E9E9E]' />
            </button>
          </span>
        ))}

        {adding ? (
          <span className='inline-flex items-center h-[30px] pl-3 pr-1 rounded-full bg-[#F4F1EE]'>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_TASTE_LEN))}
              onBlur={commitAdd}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void commitAdd();
                } else if (e.key === 'Escape') {
                  setAdding(false);
                  setDraft('');
                }
              }}
              placeholder={t('placeholder')}
              maxLength={MAX_TASTE_LEN}
              className='bg-transparent outline-none text-[12px] text-[#21201F] w-24'
            />
            {update.isPending && (
              <Loader2 size={12} className='animate-spin text-[#9E9E9E] mr-1.5' />
            )}
          </span>
        ) : (
          canAddMore && (
            <button
              type='button'
              onClick={startAdd}
              className='inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full border border-dashed border-[#D7D2CC] text-[12px] text-[#9E9E9E]'
            >
              <Plus size={12} />
              {t('add')}
            </button>
          )
        )}
      </div>

      {tastes.length === 0 && !adding && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>
          {authed ? t('empty') : t('loginRequired')}
        </div>
      )}
    </section>
  );
}

function EmptyState({
  venueSlug,
  onLoginClick,
}: {
  venueSlug: string;
  onLoginClick: () => void;
}) {
  const t = useTranslations('Profile');
  return (
    <div className='min-h-svh pb-24 flex flex-col'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={t('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>{t('title')}</h1>
      </header>

      <div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
        <div className='w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-5'>
          <UserIcon size={36} className='text-[#C4B59C]' strokeWidth={1.5} />
        </div>
        <h2 className='text-[18px] font-bold text-[#21201F]'>{t('loginEmpty.title')}</h2>
        <p className='mt-2 text-[13px] text-[#9E9E9E] max-w-xs'>
          {t('loginEmpty.description')}
        </p>
        <button
          onClick={onLoginClick}
          className='mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium active:scale-[0.99] transition-transform'
        >
          {t('loginEmpty.loginButton')}
        </button>
        <Link
          href={`/${venueSlug}`}
          className='mt-3 text-[13px] text-[#9E9E9E] underline-offset-2 hover:underline'
        >
          {t('loginEmpty.menuLink')}
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
  const t = useTranslations('Profile.payments');
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
            {t('soon')}
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
