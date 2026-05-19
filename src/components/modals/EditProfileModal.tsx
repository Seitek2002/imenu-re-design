'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'other', label: 'Другое' },
];

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
  const [firstname, setFirstname] = useState(client?.firstname ?? '');
  const [lastname, setLastname] = useState(client?.lastname ?? '');
  const [patronymic, setPatronymic] = useState(client?.patronymic ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [birthday, setBirthday] = useState(client?.birthday ?? '');
  const [gender, setGender] = useState<Gender | null>(client?.gender ?? null);
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateMe();

  const handleSave = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Неверный email');
      return;
    }
    if (birthday) {
      if (birthday > todayIso()) {
        setError('Дата рождения не может быть в будущем');
        return;
      }
      const year = Number(birthday.slice(0, 4));
      if (year < 1900) {
        setError('Год рождения слишком ранний');
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
      setError('Не удалось сохранить');
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={() => !update.isPending && onClose()}
      />
      <div className='relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-[18px] font-bold text-[#21201F]'>Профиль</h3>
          <button
            onClick={onClose}
            disabled={update.isPending}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F1EE] text-[#9E9E9E]'
            aria-label='Закрыть'
          >
            <X size={16} />
          </button>
        </div>

        <div className='flex flex-col gap-3'>
          <Field label='Имя' value={firstname} onChange={setFirstname} placeholder='Иван' />
          <Field label='Фамилия' value={lastname} onChange={setLastname} placeholder='Иванов' />
          <Field label='Отчество' value={patronymic} onChange={setPatronymic} placeholder='Иванович' />
          <Field
            label='Email'
            value={email}
            onChange={setEmail}
            placeholder='you@example.com'
            type='email'
          />
          <Field
            label='Дата рождения'
            value={birthday}
            onChange={setBirthday}
            type='date'
            max={todayIso()}
          />

          <div className='flex flex-col gap-1'>
            <span className='text-[12px] text-[#9E9E9E]'>Пол</span>
            <div className='flex gap-2'>
              {GENDERS.map((g) => {
                const active = gender === g.value;
                return (
                  <button
                    key={g.value}
                    type='button'
                    onClick={() => setGender(active ? null : g.value)}
                    className={`flex-1 h-10 rounded-2xl text-[13px] font-medium transition ${
                      active
                        ? 'bg-[#21201F] text-white'
                        : 'bg-[#F4F1EE] text-[#21201F]'
                    }`}
                  >
                    {g.label}
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
          Сохранить
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
