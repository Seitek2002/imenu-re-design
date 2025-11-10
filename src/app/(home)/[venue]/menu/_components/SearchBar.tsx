'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import searchIcon from '@/assets/Header/search.svg';

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export default function SearchBar({ placeholder = 'Поиск', className = '', autoFocus = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initial = sp.get('search') ?? '';
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // keep input in sync if user navigates back/forward
  useEffect(() => {
    const current = sp.get('search') ?? '';
    if (current !== value) setValue(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const clear = () => {
    setValue('');
    const params = new URLSearchParams(sp.toString());
    params.delete('search');
    params.delete('category');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const submit = () => {
    const query = value.trim();
    const params = new URLSearchParams(sp.toString());
    if (query) {
      params.set('search', query);
      params.delete('category');
    } else {
      params.delete('search');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(50);
    }
  };

  const showClear = useMemo(() => value.length > 0, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-3 py-2 border border-transparent focus-within:border-brand transition-colors">
        <Image src={searchIcon} alt="search" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1"
        />
        <button
          type="button"
          aria-label="Найти"
          onClick={submit}
          disabled={value.trim().length === 0}
          className="ml-1 bg-brand text-white rounded-md px-3 py-1 text-sm disabled:opacity-50"
        >
          Найти
        </button>
        {showClear && (
          <button
            type="button"
            aria-label="Очистить"
            onClick={clear}
            className="text-[#6B6B6B] hover:text-[#111111] transition"
          >
            ✕
          </button>
        )}
      </div>
      {isPending && (
        <span className="absolute -bottom-5 right-1 text-xs text-gray-400">Поиск…</span>
      )}
    </div>
  );
}
