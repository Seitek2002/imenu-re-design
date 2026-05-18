'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // "/" focuses the search input if one is mounted and user isn't already typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const input = document.querySelector<HTMLInputElement>('[data-search-input]');
      if (!input) return;
      e.preventDefault();
      input.focus();
      input.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Не ремаунтим на смену slug внутри /products/* — Content.tsx сам делает
  // replaceState при клике по табу, и full remount сбрасывал его state +
  // повторно дёргал initial-scroll к старому serverside slug → промах скролла.
  const stableKey = pathname.replace(/^(\/[^/]+\/products)\/.+$/, '$1');

  return (
    <div key={stableKey} className='page-fade-in'>
      {children}
    </div>
  );
}
