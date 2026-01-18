import { FC } from 'react';

interface Props {
  className?: string;
}

const ImageSkeleton: FC<Props> = ({ className }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#F3F3F3] w-full h-full flex items-center justify-center ${
        className || ''
      }`}
      role='img'
      aria-label='Загрузка...'
    >
      {/* Shimmer Effect через Tailwind (animate-pulse или кастомный класс) */}
      <div className='absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-gray-200/50 to-transparent animate-[shimmer_1.5s_infinite]' />

      {/* Логотип по центру */}
      <div className='relative z-10 flex flex-col items-center gap-2 opacity-50'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='40'
          height='40'
          viewBox='0 0 32 32'
          fill='none'
        >
          <rect width='32' height='32' rx='16' fill='#E5E7EB' />
          <path
            d='M21.4976 18.7638C21.4976 17.2393 20.9184 15.7773 19.8874 14.6993C18.8564 13.6214 17.458 13.0158 16 13.0158C14.5419 13.0158 13.1436 13.6214 12.1125 14.6993C11.0815 15.7773 10.5023 17.2393 10.5023 18.7638L21.4976 18.7638Z'
            fill='#9CA3AF'
          />
          <path
            d='M9.49805 19.1133H22.5021V20.8635H9.49805V19.1133Z'
            fill='#9CA3AF'
          />
          <path
            d='M16.8561 11.9399C16.8561 12.3836 16.4711 12.7433 15.9963 12.7433C15.5215 12.7433 15.1365 12.3836 15.1365 11.9399C15.1365 11.4962 15.5215 11.1365 15.9963 11.1365C16.4711 11.1365 16.8561 11.4962 16.8561 11.9399Z'
            fill='#9CA3AF'
          />
        </svg>
        <span className='text-[10px] font-medium text-gray-400 font-cruinn'>
          iMenu.kg
        </span>
      </div>
    </div>
  );
};

export default ImageSkeleton;
