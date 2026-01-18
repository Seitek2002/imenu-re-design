'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

export default function DevErrorModal({ isOpen, onClose, error }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 🔥 Логика: определяем, что показать
  let displayContent = '';

  if (error instanceof Error) {
    // 1. Если это JS ошибка (например Network Error)
    displayContent = error.message;
    // Если есть стек, можно добавить и его, но обычно message достаточно
  } else if (typeof error === 'object' && error !== null) {
    // 2. Если это JSON от сервера (наш случай с "venue_slug required")
    displayContent = JSON.stringify(error, null, 2);
  } else {
    // 3. Если это просто строка
    displayContent = String(error);
  }

  return createPortal(
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <div className='bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]'>
        {/* Шапка */}
        <div className='bg-red-500 p-4 flex justify-between items-center text-white'>
          <h3 className='font-bold text-lg'>Ошибка сервера (Dev Mode)</h3>
          <button onClick={onClose} className='text-2xl leading-none'>
            &times;
          </button>
        </div>

        {/* Тело */}
        <div className='p-4 overflow-auto bg-gray-50 flex-1'>
          <p className='text-sm text-gray-500 mb-2'>Детали ошибки:</p>
          <pre className='bg-[#1e1e1e] text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre-wrap'>
            {displayContent}
          </pre>
        </div>

        {/* Футер */}
        <div className='p-4 border-t border-gray-100 flex justify-end'>
          <button
            onClick={onClose}
            className='bg-gray-900 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform'
          >
            Понятно, исправлю
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
