'use client';

import { useMounted } from '@/hooks/useMounted';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ModalPortalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
};

export default function ModalPortal({
  open,
  onClose,
  children,
  zIndex = 100,
}: ModalPortalProps) {
  const mounted = useMounted();

  // Блокировка скролла
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 flex items-center justify-center p-4'
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200'
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(50);
          onClose();
        }}
      />

      {/* Card + Animation */}
      <div className='relative bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in duration-200'>
        {children}
      </div>
    </div>,
    document.body
  );
}
