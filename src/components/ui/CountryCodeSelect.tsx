'use client';
/* eslint-disable @next/next/no-img-element */

import { FC, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRY_CODES, getCountryById } from '@/lib/helpers/countryCodes';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

const CountryCodeSelect: FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const country = getCountryById(value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className='relative shrink-0'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='flex items-center gap-1.5 font-semibold text-[#111111] text-base outline-none cursor-pointer'
      >
        <img
          src={`https://flagcdn.com/w40/${country.id.toLowerCase()}.png`}
          alt={country.name}
          width={20}
          height={14}
          className='rounded-sm object-cover shrink-0'
        />
        <span>+{country.dial}</span>
        <ChevronDown size={14} className='text-[#A4A4A4]' />
      </button>
      {open && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-lg border border-[#E7E7E7] min-w-[180px] py-1'>
          {COUNTRY_CODES.map((c) => (
            <button
              type='button'
              key={c.id}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F5F5F5] transition-colors text-left ${
                c.id === value ? 'font-semibold text-[#111111]' : 'text-[#6B6B6B]'
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${c.id.toLowerCase()}.png`}
                alt={c.name}
                width={20}
                height={14}
                className='rounded-sm object-cover shrink-0'
              />
              <span className='flex-1'>{c.name}</span>
              <span className='text-[#A4A4A4]'>+{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;
