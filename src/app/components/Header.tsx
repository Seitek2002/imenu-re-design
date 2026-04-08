'use client';

import { FC, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui'; // 1. Импорт стора
import { X } from 'lucide-react'; // Возьмем иконку крестика из библиотеки, которая у тебя есть

import searchIcon from '@/assets/Header/search.svg';
import arrowIcon from '@/assets/Header/arrow.svg';

interface IProps {
  title: string;
  showSearch?: boolean;
}

const Header: FC<IProps> = ({ title, showSearch }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. Подключаем состояние
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } =
    useUIStore();

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleBack = () => {
    if (navigator.vibrate) navigator.vibrate(20);

    // 🔥 Если открыт поиск — закрываем его, а не уходим со страницы
    if (isSearchOpen) {
      setSearchOpen(false);
      return;
    }

    router.back();
  };

  return (
    <header className='sticky top-0 bg-white/95 backdrop-blur-sm z-20 transition-transform duration-300 min-h-16'>
      <div className='flex justify-between items-center px-5 pt-4 pb-4 h-full'>
        {/* Кнопка НАЗАД */}
        <button
          onClick={handleBack}
          className='w-10 h-10 flex items-center justify-start active:opacity-60 shrink-0'
          aria-label='Вернуться назад'
        >
          <Image
            src={arrowIcon}
            width={24}
            height={24}
            alt='Назад'
            className='cursor-pointer'
          />
        </button>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: ИЛИ ЗАГОЛОВОК, ИЛИ ПОИСК */}
        <div className='flex-1 flex justify-center mx-2 overflow-hidden'>
          {isSearchOpen ? (
            /* РЕЖИМ ПОИСКА */
            <div className='w-full flex items-center bg-[#F5F5F5] rounded-xl px-3 h-10 animate-fadeIn'>
              <input
                ref={inputRef}
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Поиск...'
                className='w-full bg-transparent outline-none text-[#111111] text-sm placeholder-gray-400'
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={16} className='text-gray-400' />
                </button>
              )}
            </div>
          ) : (
            /* ОБЫЧНЫЙ ЗАГОЛОВОК */
            <h2 className='text-2xl font-bold text-center leading-none mt-1 truncate'>
              {title}
            </h2>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className='w-10 flex justify-end shrink-0'>
          {/* Если поиск открыт — ничего не показываем справа (или можно крестик закрытия) */}
          {!isSearchOpen && showSearch ? (
            <button
              type='button'
              onClick={() => setSearchOpen(true)}
              className='cursor-pointer active:scale-95 transition-transform'
            >
              <Image
                src={searchIcon}
                width={24}
                height={24}
                alt='Поиск'
                aria-label='Поиск по меню'
              />
            </button>
          ) : !isSearchOpen ? (
            <div className='w-6' />
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
