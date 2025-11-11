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

  // Debounce input value and trigger search via URL update
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value.trim()), 400);
    return () => clearTimeout(id);
  }, [value]);

  // Sync URL when debounced changes (sends search request)
  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    if (debounced) {
      params.set('search', debounced);
      // reset category when searching to avoid collisions with swiper/category state
      params.delete('category');
    } else {
      params.delete('search');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

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
        {isPending && (
          <span
            aria-label="Загрузка"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--brand)' }}
          />
        )}
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
    </div>
  );
}
