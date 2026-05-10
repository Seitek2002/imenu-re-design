'use client';

import { useEffect } from 'react';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[products/[slug]] render error', error);
  }, [error]);

  return (
    <main className='px-5 min-h-svh pb-32 bg-[#F8F6F7] flex flex-col items-center justify-center text-center'>
      <h1 className='text-lg font-semibold text-gray-900'>
        Не удалось загрузить меню
      </h1>
      <p className='mt-2 text-sm text-gray-500 max-w-xs'>
        Похоже, сервис временно недоступен. Попробуйте обновить страницу через
        пару секунд.
      </p>

      <button
        type='button'
        onClick={reset}
        className='mt-6 h-11 px-6 rounded-full bg-black text-white text-sm font-medium active:scale-[0.98] transition'
      >
        Обновить
      </button>

      {error.digest ? (
        <p className='mt-4 text-[11px] text-gray-400'>
          Код ошибки: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
