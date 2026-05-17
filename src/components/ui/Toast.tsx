'use client';

import { useEffect } from 'react';

interface Props {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 3000 }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className='fixed bottom-28 left-0 right-0 mx-auto w-fit z-200 bg-[#111111] text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg max-w-xs text-center animate-fade-in'
      onClick={onDismiss}
    >
      {message}
    </div>
  );
}
