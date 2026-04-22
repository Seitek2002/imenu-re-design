'use client';

import { useTranslations } from 'next-intl';

const ProfilePage = () => {
  const t = useTranslations('Profile');
  return (
    <div className='relative min-h-screen bg-[#F8F6F7] overflow-hidden'>
      {/* --- ЗАДНИЙ ПЛАН (Фейковый интерфейс) --- */}
      {/* Мы используем blur-sm и opacity-60, чтобы создать эффект "за стеклом".
          pointer-events-none, чтобы нельзя было нажать. */}
      <div className='filter blur-[6px] opacity-40 pointer-events-none select-none p-5 flex flex-col gap-6 h-screen'>
        {/* Фейковая шапка профиля */}
        <div className='flex items-center gap-4 mt-8'>
          <div className='w-20 h-20 bg-gray-300 rounded-full animate-pulse' />
          <div className='flex flex-col gap-2'>
            <div className='w-40 h-6 bg-gray-300 rounded animate-pulse' />
            <div className='w-24 h-4 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Фейковые карточки статистики */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='h-24 bg-gray-200 rounded-3xl' />
          <div className='h-24 bg-gray-200 rounded-3xl' />
        </div>

        {/* Фейковое меню */}
        <div className='flex flex-col gap-3 mt-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='h-16 bg-white rounded-2xl flex items-center px-4 justify-between'
            >
              <div className='flex items-center gap-4'>
                <div className='w-8 h-8 bg-gray-100 rounded-lg' />
                <div className='w-32 h-4 bg-gray-100 rounded' />
              </div>
              <div className='w-4 h-4 bg-gray-100 rounded-full' />
            </div>
          ))}
        </div>
      </div>

      {/* --- ПЕРЕДНИЙ ПЛАН (Контент) --- */}
      <div className='absolute inset-0 flex flex-col items-center justify-center z-10 px-6'>
        {/* Анимированная иконка замка или профиля */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 bg-[#FFE600] rounded-full blur-xl opacity-20 animate-pulse' />
          <div className='relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center -rotate-6'>
            <span className='text-5xl'>👤</span>
            {/* Маленький замочек */}
            <div className='absolute -top-2 -right-2 bg-[#21201F] text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md rotate-12'>
              🔒
            </div>
          </div>
        </div>

        <h1 className='text-2xl font-bold text-[#21201F] text-center mb-3'>
          {t('title')}
        </h1>

        <p className='text-[#9E9E9E] text-center mb-8 max-w-70 leading-relaxed'>
          {t('description')}
        </p>

        {/* Кнопки */}
        <div className='flex flex-col gap-3 w-full max-w-xs'>
          {/* <Link
            href='/'
            className='w-full py-3.5 bg-[#21201F] text-white rounded-2xl font-bold text-center shadow-lg active:scale-95 transition-transform'
          >
            Перейти к меню
          </Link> */}

          <button
            disabled
            className='w-full py-3.5 bg-white text-[#9E9E9E] rounded-2xl font-medium text-center border border-gray-100 cursor-not-allowed'
          >
            {t('loginSoon')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
