'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useUpdateMe, type Gender } from '@/lib/api/me';
import type { AuthClient } from '@/lib/api/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client?: AuthClient | null;
}

const GENDERS: Gender[] = ['male', 'female', 'other'];

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function EditProfileModal({ isOpen, onClose, client }: Props) {
  const mounted = useMounted();
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <Form client={client ?? null} onClose={onClose} />,
    document.body,
  );
}

// Отдельный компонент — чтобы при каждом открытии модалки форма
// монтировалась заново и брала initialState из текущего client.
function Form({
  client,
  onClose,
}: {
  client: AuthClient | null;
  onClose: () => void;
}) {
  const t = useTranslations('ProfileEdit');
  const [firstname, setFirstname] = useState(client?.firstname ?? '');
  const [lastname, setLastname] = useState(client?.lastname ?? '');
  const [patronymic, setPatronymic] = useState(client?.patronymic ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [birthday, setBirthday] = useState(client?.birthday ?? '');
  const [gender, setGender] = useState<Gender | null>(client?.gender ?? null);
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateMe();

  const genderLabel = (g: Gender) =>
    g === 'male' ? t('genderMale') : g === 'female' ? t('genderFemale') : t('genderOther');

  const handleSave = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('errorEmail'));
      return;
    }
    if (birthday) {
      if (birthday > todayIso()) {
        setError(t('errorBirthdayFuture'));
        return;
      }
      const year = Number(birthday.slice(0, 4));
      if (year < 1900) {
        setError(t('errorBirthdayEarly'));
        return;
      }
    }
    try {
      await update.mutateAsync({
        firstname: firstname.trim() || null,
        lastname: lastname.trim() || null,
        patronymic: patronymic.trim() || null,
        email: trimmedEmail || null,
        birthday: birthday || null,
        gender,
      });
      onClose();
    } catch {
      setError(t('errorSave'));
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm enter-fade'
        onClick={() => !update.isPending && onClose()}
      />
      <div className='relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl enter-sheet-sm max-h-[92vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-[18px] font-bold text-[#21201F]'>{t('title')}</h3>
          <button
            onClick={onClose}
            disabled={update.isPending}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F1EE] text-[#9E9E9E]'
            aria-label={t('close')}
          >
            <X size={16} />
          </button>
        </div>

        <div className='flex flex-col gap-3'>
          <Field
            label={t('firstname')}
            value={firstname}
            onChange={setFirstname}
            placeholder={t('firstnamePlaceholder')}
          />
          <Field
            label={t('lastname')}
            value={lastname}
            onChange={setLastname}
            placeholder={t('lastnamePlaceholder')}
          />
          <Field
            label={t('patronymic')}
            value={patronymic}
            onChange={setPatronymic}
            placeholder={t('patronymicPlaceholder')}
          />
          <Field
            label={t('email')}
            value={email}
            onChange={setEmail}
            placeholder={t('emailPlaceholder')}
            type='email'
          />
          <Field
            label={t('birthday')}
            value={birthday}
            onChange={setBirthday}
            type='date'
            max={todayIso()}
          />

          <div className='flex flex-col gap-1'>
            <span className='text-[12px] text-[#9E9E9E]'>{t('gender')}</span>
            <div className='flex gap-2'>
              {GENDERS.map((g) => {
                const active = gender === g;
                return (
                  <button
                    key={g}
                    type='button'
                    onClick={() => setGender(active ? null : g)}
                    className={`flex-1 h-10 rounded-2xl text-[13px] font-medium transition ${
                      active
                        ? 'bg-[#21201F] text-white'
                        : 'bg-[#F4F1EE] text-[#21201F]'
                    }`}
                  >
                    {genderLabel(g)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className='mt-3 text-[12px] text-[#DC2626]'>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={update.isPending}
          className='mt-5 w-full h-12 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60'
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  max?: string;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[12px] text-[#9E9E9E]'>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        max={max}
        className='h-12 px-4 rounded-2xl bg-[#F4F1EE] text-[14px] text-[#21201F] outline-none focus:ring-2 focus:ring-[#21201F]/10'
      />
    </label>
  );
}
