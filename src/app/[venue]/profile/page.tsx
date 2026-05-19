'use client';

import { useRef, useState } from 'react';
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
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  const phone = useClientStore((s) => s.phone);
  const countryId = useClientStore((s) => s.countryId);
  const clear = useClientStore((s) => s.clear);
  const clearAuth = useAuthStore((s) => s.clear);
  const client = useAuthStore((s) => s.client);
  const hasToken = useAuthStore((s) => !!s.accessToken);
  const [editOpen, setEditOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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
          onClick={() => requireAuth() && setEditOpen(true)}
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
            onClick={() => requireAuth() && setEditOpen(true)}
            className='bg-white rounded-2xl p-4 text-left active:scale-[0.99] transition-transform'
          >
            <div className='text-[13px] text-[#9E9E9E]'>Имя</div>
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

        <TastesSection
          tastes={client?.tastes ?? []}
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

        <AddressesSection
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

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
        client={client}
      />

      <OtpLoginModal
        open={loginOpen}
        venueSlug={venue}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          // store.client уже обновлён OtpLoginModal'ом — больше ничего не нужно
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
          Мои адреса
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
                    осн
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
            <span className='text-[11px]'>Добавить</span>
          </button>
        )}
      </div>

      {authed && isLoading && addresses.length === 0 && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>Загружаем…</div>
      )}

      {!authed && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>
          Войдите по SMS, чтобы сохранять адреса.
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
          Вкусовые предпочтения
        </div>
        <div className='mt-1 text-[12px] text-[#9E9E9E]'>
          Учтём при формировании заказа
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-2 items-center'>
        {tastes.map((t) => (
          <span
            key={t}
            className='inline-flex items-center gap-1.5 h-[30px] pl-3 pr-1.5 rounded-full bg-[#F4F1EE] text-[12px] text-[#21201F]'
          >
            {t}
            <button
              type='button'
              onClick={() => remove(t)}
              disabled={update.isPending}
              className='w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-[#EDEAE7] disabled:opacity-50'
              aria-label={`Удалить ${t}`}
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
              placeholder='Без лука'
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
              Добавить
            </button>
          )
        )}
      </div>

      {tastes.length === 0 && !adding && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>
          {authed
            ? 'Пока пусто — добавьте, что вам не подходит.'
            : 'Войдите по SMS, чтобы сохранить предпочтения.'}
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
