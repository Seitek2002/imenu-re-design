'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useUpdateClient } from '@/lib/api/queries';
import type { Client } from '@/types/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  client?: Client | null;
}

export default function EditProfileModal({ isOpen, onClose, phone, client }: Props) {
  const mounted = useMounted();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const update = useUpdateClient(phone);

  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setFirstname(client?.firstname ?? '');
      setLastname(client?.lastname ?? '');
      setEmail(client?.email ?? '');
      setError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, client]);

  if (!mounted || !isOpen) return null;

  const handleSave = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Неверный email');
      return;
    }
    try {
      await update.mutateAsync({
        firstname: firstname.trim() || null,
        lastname: lastname.trim() || null,
        email: trimmedEmail || null,
      });
      onClose();
    } catch {
      setError('Не удалось сохранить');
    }
  };

  return createPortal(
    <div className='fixed inset-0 z-60 flex items-end sm:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={() => !update.isPending && onClose()}
      />
      <div className='relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300'>
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
          <Field
            label='Email'
            value={email}
            onChange={setEmail}
            placeholder='you@example.com'
            type='email'
          />
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
    </div>,
    document.body,
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[12px] text-[#9E9E9E]'>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-12 px-4 rounded-2xl bg-[#F4F1EE] text-[14px] text-[#21201F] outline-none focus:ring-2 focus:ring-[#21201F]/10'
      />
    </label>
  );
}
