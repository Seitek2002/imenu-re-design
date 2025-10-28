'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ModalPortalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Optional extra classes for the inner card wrapper
  cardClassName?: string;
  // Optional z-index level (defaults to a high layer)
  zIndex?: number;
};

export default function ModalPortal({
  open,
  onClose,
  children,
  cardClassName,
  zIndex = 60,
}: ModalPortalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[${zIndex}] flex items-center justify-center`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Centered card */}
      <div className="relative w-full flex items-center justify-center">
        <div
          className={`bg-white rounded-2xl p-4 w-[90%] max-w-md max-h-[70vh] overflow-y-auto shadow-2xl relative ${cardClassName ?? ''}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
