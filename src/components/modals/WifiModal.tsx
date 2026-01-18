'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  text?: string;
  url?: string | null;
}

export default function WifiModal({ isOpen, onClose, text, url }: Props) {
  const mounted = useMounted();

  // Блокируем скролл фона
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Content */}
      <div className='relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all scale-100 animate-fadeIn'>
        {/* Иконка Wi-Fi сверху */}
        <div className='w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='w-8 h-8'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z'
            />
          </svg>
        </div>

        <h3 className='text-xl font-bold text-center text-gray-900 mb-2'>
          Подключение к Wi-Fi
        </h3>

        <div className='text-center text-gray-600 mb-6 whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100'>
          {text || 'Данные не указаны'}
        </div>

        <div className='flex flex-col gap-3'>
          {/* Кнопка "Подключиться" (если есть ссылка) */}
          {url && (
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform'
            >
              Подключиться
            </a>
          )}

          <button
            onClick={onClose}
            className='w-full py-3.5 bg-gray-100 text-gray-900 font-bold rounded-xl active:scale-95 transition-transform'
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
