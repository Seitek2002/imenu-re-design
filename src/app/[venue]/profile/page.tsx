'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  Pencil,
  ArrowRight,
  Plus,
  X,
  Store,
  ShoppingBag,
  MessageSquareText,
  LogOut,
  User as UserIcon,
  Loader2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { useClientStore } from '@/store/client';
import { useAuthStore } from '@/store/auth';
import { useClientBonus, useClientLoyalty } from '@/lib/api/queries';
import { useUpdateMe } from '@/lib/api/me';
import { useMyAddresses, type MyAddress } from '@/lib/api/addresses';
import { logoutAuth } from '@/lib/api/auth';
import { getCountryById } from '@/lib/helpers/countryCodes';
import { formatPhoneDisplay } from '@/lib/helpers/phone';
import EditProfileModal from '@/components/modals/EditProfileModal';
import AddressEditModal from '@/components/modals/AddressEditModal';
import OtpLoginModal from '@/components/modals/OtpLoginModal';

const MAX_TASTES = 20;
const MAX_TASTE_LEN = 32;

// Локальная KG-маска для отображения в профиле: «0XXX XXX XXX» (три группы по 3).
// Не путать с formatPhoneInput (маска полей ввода, группы 3-2-2-2).
function formatKgLocalPhone(localDigits: string): string {
  const d = (localDigits || '').replace(/\D/g, '').slice(0, 9);
  const groups = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean);
  return `0${groups.join(' ')}`;
}

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
  // По макету номер показываем в локальном формате с ведущим 0 (без кода страны)
  // для KG — единой маской «0XXX XXX XXX» (три группы по 3 цифры). Для прочих
  // стран оставляем международный «+dial …».
  const fullPhone = phone
    ? countryId === 'KG'
      ? formatKgLocalPhone(phone)
      : formatPhoneDisplay(phone, country.dial, countryId)
    : '';

  const { data: bonus, isLoading: bonusLoading } = useClientBonus({
    phone,
    venueSlug: venue,
  });
  const { data: loyalty } = useClientLoyalty({
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

  // По макету в карточке только имя (без фамилии) — фамилия съедает строку
  // и не даёт уложиться в фикс. высоту 77px.
  const displayName = (client?.firstname ?? '').trim() || t('guest');

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
      </header>

      <div className='px-4 mt-2 flex flex-col gap-[10px]'>
        <section className='bg-white rounded-2xl p-2.5 grid grid-cols-[1.45fr_1fr] gap-2.5'>
          <button
            type='button'
            onClick={() => requireAuth() && setEditOpen(true)}
            className='bg-[#EAF7EC] border-[0.3px] border-[#1A5E00]/20 rounded-2xl p-4 h-[77px] flex flex-col justify-center text-left active:scale-[0.99] transition-transform'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[13px] font-medium text-[#21201F] truncate'>
                {displayName}
              </span>
              <Pencil size={16} className='text-[#7C8A7E] shrink-0' />
            </div>
            <div className='mt-1 text-[16px] font-medium text-[#21201F]'>{fullPhone}</div>
          </button>
          <Link
            href={`/${venue}/profile/points`}
            className='bg-[#FBF7FD] border-[0.3px] border-[#29003E]/20 rounded-2xl p-4 h-[77px] flex flex-col justify-between active:scale-[0.99] transition-transform'
          >
            <div className='flex items-center justify-between text-[12px] text-black'>
              <span>{t('bonusLabel')}</span>
              <ArrowRight size={16} />
            </div>
            <div className='text-[22px] font-semibold text-[#8031C9] leading-none'>
              {bonusLoading ? '…' : (bonus?.bonus ?? 0).toLocaleString('ru-RU').replace(',', ' ')}
            </div>
          </Link>
        </section>

        {bonus?.clientGroup && bonus.clientGroup.discountPercent > 0 && (
          <LoyaltySection
            currentPercent={bonus.clientGroup.discountPercent}
            // Шкала из /v2/client/loyalty/ (Kuma 2026-05-24 §6b). У не-Poster
            // venue endpoint вернёт 404 → loyalty = null → прогресс не
            // рендерится, остаётся только текущий процент.
            nextPercent={loyalty?.nextGroup?.discountPercent}
            amountToNext={
              loyalty?.turnoverToNext
                ? Math.ceil(Number(loyalty.turnoverToNext))
                : undefined
            }
            currency='сом'
          />
        )}

        <TastesSection
          tastes={client?.tastes ?? []}
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

        <AddressesSection
          venueSlug={venue}
          authed={hasToken}
          onLoginRequired={() => setLoginOpen(true)}
        />

        <PaymentSection venueSlug={venue} />

        <section className='bg-white rounded-2xl p-4'>
          <div className='text-[13px] font-semibold text-[#21201F]'>{t('quickLinks.title')}</div>
          <div className='mt-3 grid grid-cols-3 gap-2'>
            <Link
              href={`/${venue}/support?tab=venue`}
              className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'
            >
              <Store size={20} className='text-[#F3811F]' />
              <span className='text-[11px]'>{t('quickLinks.venues')}</span>
            </Link>
            <Link
              href={`/${venue}/support?tab=order`}
              className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'
            >
              <ShoppingBag size={20} className='text-[#6B9A6E]' />
              <span className='text-[11px]'>{t('quickLinks.orders')}</span>
            </Link>
            <Link
              href={`/${venue}/support?tab=other`}
              className='rounded-xl border border-[#EDEAE7] flex flex-col items-center justify-center gap-1.5 py-3 text-[#21201F]'
            >
              <MessageSquareText size={20} className='text-[#3F6BDB]' />
              <span className='text-[11px]'>{t('quickLinks.chat')}</span>
            </Link>
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
  venueSlug,
  authed,
  onLoginRequired,
}: {
  venueSlug: string;
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

  const showAddCard = !authed || addresses.length === 0 || addresses.length < 10;

  return (
    <section className='bg-white rounded-2xl p-4 relative'>
      <div className='flex items-center justify-between'>
        <div className='text-[13px] font-semibold text-[#21201F]'>
          {t('title')}
        </div>
        {authed && addresses.length > 0 && (
          <Link
            href={`/${venueSlug}/profile/addresses`}
            className='flex items-center gap-1 text-[12px] text-[#9E9E9E] active:scale-95 transition-transform'
          >
            {t('seeAll')}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className='mt-3 flex items-stretch gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {authed && isLoading && addresses.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='w-[135px] h-[75px] shrink-0 rounded-xl border border-[#EDEAE7] p-2.5 flex flex-col gap-2 animate-pulse'
              >
                <div className='flex items-center gap-1.5'>
                  <div className='w-3.5 h-3.5 rounded-full bg-[#F4F1EE]' />
                  <div className='h-3 w-12 bg-[#F4F1EE] rounded' />
                </div>
                <div className='h-3 w-full bg-[#F8F6F7] rounded' />
                <div className='h-3 w-3/4 bg-[#F8F6F7] rounded' />
              </div>
            ))
          : authed &&
            addresses.map((a) => (
              <button
                key={a.id}
                type='button'
                onClick={() => open(a)}
                className={`w-[135px] h-[75px] shrink-0 rounded-xl border px-2.5 py-2 flex flex-col gap-0.5 text-left active:scale-[0.98] transition-transform ${
                  a.isDefault
                    ? 'border-[#E8A145] bg-[#FDF7ED]'
                    : 'border-[#EDEAE7]'
                }`}
              >
                <div className='flex items-center gap-1.5'>
                  <span className='text-[13px] font-semibold text-[#21201F] truncate'>
                    {a.label}
                  </span>
                  {a.isDefault && (
                    <span className='ml-auto text-[9px] font-medium text-[#F28A1A] bg-[#FFEBD0] px-1.5 py-0.5 rounded-full whitespace-nowrap'>
                      {t('default')}
                    </span>
                  )}
                </div>
                <div className='text-[11px] text-[#9E9E9E] leading-[1.45] line-clamp-2 pb-[1px]'>
                  {[
                    a.address,
                    a.apartment && t('apartment', { value: a.apartment }),
                    a.entrance && t('entrance', { value: a.entrance }),
                    a.floor && t('floor', { value: a.floor }),
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </button>
            ))}

        {showAddCard && (
          <button
            type='button'
            onClick={() => open(null)}
            className='w-[110px] h-[75px] shrink-0 rounded-xl border border-dashed border-[#D7D2CC] flex flex-col items-center justify-center text-[#9E9E9E] gap-1'
          >
            <Plus size={16} />
            <span className='text-[11px]'>{t('add')}</span>
          </button>
        )}
      </div>

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

/**
 * Уровень лояльности — переиспользуемая карточка.
 * Слева крупный текущий процент скидки + подпись; справа индикатор прогресса
 * (текущий уровень → следующий) с подписью «Еще {amount} {currency} до {next} %».
 *
 * `currentPercent` берётся из реального clientGroup.discountPercent. А вот
 * `nextPercent` / `amountToNext` API не отдаёт (порога следующего уровня нет,
 * см. project_profile_redesign_gaps) — на месте вызова они захардкожены с TODO.
 * Когда они не заданы, правый индикатор не рендерится.
 */
function LoyaltySection({
  currentPercent,
  nextPercent,
  amountToNext,
  currency,
}: {
  currentPercent: number;
  nextPercent?: number;
  amountToNext?: number;
  currency?: string;
}) {
  const t = useTranslations('Profile.loyalty');
  const hasProgress =
    typeof nextPercent === 'number' && typeof amountToNext === 'number';

  return (
    <section
      className={`bg-white rounded-2xl p-2.5 ${
        hasProgress ? 'grid grid-cols-2' : 'flex items-center justify-center'
      }`}
    >
      <div className='flex flex-col items-center text-center justify-between gap-3'>
        <div className='flex-1 flex items-center text-[28px] font-bold leading-[1.1] bg-[linear-gradient(to_top,#FAA924_31%,#F3811F_71%)] bg-clip-text text-transparent'>
          {currentPercent} %
        </div>
        <div className='text-[12px] font-medium leading-[1.1] text-[#21201F]'>
          {t('title')}
        </div>
      </div>

      {hasProgress && (
        <div className='border-l border-[#E5E1DD] px-2.5 flex flex-col items-center text-center justify-between gap-3'>
          <div className='flex-1 flex items-center gap-2 w-full'>
            <span className='shrink-0 w-[36px] h-[36px] rounded-full border border-[#FFD5A8] flex items-center justify-center'>
              <span className='w-[30px] h-[30px] rounded-full bg-[#F28A1A] text-white text-[12px] font-medium leading-[1.1] flex items-center justify-center'>
                {currentPercent}%
              </span>
            </span>
            <span className='flex-1 flex items-center'>
              <span className='w-1.5 h-1.5 rotate-45 bg-[#C9C2BB] shrink-0' />
              <span className='flex-1 h-px bg-[#C9C2BB]' />
              <span className='w-1.5 h-1.5 rotate-45 bg-[#C9C2BB] shrink-0' />
            </span>
            <span className='shrink-0 w-[30px] h-[30px] rounded-full bg-white border border-[#D7D2CC] text-[#21201F] text-[12px] font-medium leading-[1.1] flex items-center justify-center'>
              {nextPercent}%
            </span>
          </div>
          <div className='text-[12px] font-medium leading-[1.1] text-[#21201F]'>
            {t('toNext', {
              amount: amountToNext!.toLocaleString('ru-RU').replace(',', ' '),
              currency: currency ?? '',
              next: nextPercent!,
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Способ оплаты — статичная вёрстка по макету. Сохранённых способов оплаты в API
 * нет (оплата идёт редиректом на paymentUrl, см. project_payment_contract).
 * TODO: подключить реальные данные, когда появится эндпоинт сохранённых карт.
 */
function PaymentSection({ venueSlug }: { venueSlug: string }) {
  const t = useTranslations('Profile.payment');
  return (
    <section className='bg-white rounded-2xl p-4'>
      <div className='flex items-center justify-between'>
        <div className='text-[13px] font-semibold text-[#21201F]'>
          {t('title')}
        </div>
        <Link
          href={`/${venueSlug}/profile/payment`}
          className='flex items-center gap-1 text-[12px] text-[#9E9E9E] active:scale-95 transition-transform'
        >
          {t('seeAll')}
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className='mt-3 flex items-stretch gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <div className='w-[135px] h-[75px] shrink-0 rounded-xl border border-[#E8A145] bg-[#FDF7ED] p-2.5 flex flex-col gap-1'>
          <div className='flex items-center gap-1.5'>
            <CreditCard size={16} className='text-[#1A1F71] shrink-0' />
            <span className='text-[12px] font-bold text-[#1A1F71]'>VISA</span>
            <span className='ml-auto text-[9px] font-medium text-[#F28A1A] bg-[#FFEBD0] px-1.5 py-0.5 rounded-full whitespace-nowrap'>
              {t('default')}
            </span>
          </div>
          <div className='text-[12px] text-[#21201F] tracking-widest'>
            ••••4242
          </div>
        </div>

        <div className='w-[135px] h-[75px] shrink-0 rounded-xl border border-[#EDEAE7] p-2.5 flex flex-col gap-1'>
          <Wallet size={16} className='text-[#6B9A6E]' />
          <span className='text-[12px] font-medium text-[#21201F]'>
            {t('cash')}
          </span>
        </div>
      </div>
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
            className='inline-flex items-center gap-1.5 h-[30px] pl-3 pr-1.5 rounded-full bg-[#FDF7ED] text-[12px] text-[#21201F]'
          >
            {taste}
            <button
              type='button'
              onClick={() => remove(taste)}
              disabled={update.isPending}
              className='w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-[#F4E9D2] disabled:opacity-50'
              aria-label={t('remove', { name: taste })}
            >
              <X size={14} className='text-[#C75D00]' />
            </button>
          </span>
        ))}

        {adding && (
          <span className='inline-flex items-center h-[30px] pl-3 pr-1 rounded-full bg-[#FDF7ED]'>
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
        )}
      </div>

      {!adding && canAddMore && (
        <button
          type='button'
          onClick={startAdd}
          className='mt-1 inline-flex items-center justify-center gap-1.5 w-[178px] h-[32px] rounded-xl border border-dashed border-[#EDEAE7] text-[12px] text-[#9E9E9E] active:scale-[0.99] transition-transform'
        >
          <Plus size={14} />
          {t('add')}
        </button>
      )}

      {tastes.length === 0 && !adding && (
        <div className='mt-2 text-[11px] text-[#9E9E9E]'>
          {authed ? t('empty') : t('loginRequired')}
        </div>
      )}

      {tastes.length === 0 && authed && !adding && (
        <TastePresets
          onPick={async (preset) => {
            try {
              await update.mutateAsync({ tastes: [preset] });
            } catch {
              // silent
            }
          }}
          disabled={update.isPending}
        />
      )}
    </section>
  );
}

function TastePresets({
  onPick,
  disabled,
}: {
  onPick: (preset: string) => void;
  disabled: boolean;
}) {
  const t = useTranslations('Profile.tastes');
  // t.raw() возвращает массив как есть; в типах next-intl это unknown.
  const raw = t.raw('presets');
  const presets = Array.isArray(raw) ? (raw as string[]) : [];
  if (presets.length === 0) return null;
  return (
    <div className='mt-3'>
      <div className='text-[11px] text-[#9E9E9E] mb-1.5'>{t('presetsHint')}</div>
      <div className='flex flex-wrap gap-2'>
        {presets.map((p) => (
          <button
            key={p}
            type='button'
            onClick={() => onPick(p)}
            disabled={disabled}
            className='inline-flex items-center gap-1 h-[28px] px-3 rounded-full bg-[#F8F6F7] border border-[#EDEAE7] text-[12px] text-[#21201F] active:scale-[0.97] transition-transform disabled:opacity-60'
          >
            <Plus size={12} className='text-[#9E9E9E]' />
            {p}
          </button>
        ))}
      </div>
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

