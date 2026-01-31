'use client';

import Link from 'next/link';

const HistoryPage = () => {
  return (
    <div className='relative min-h-screen bg-[#F8F6F7] overflow-hidden flex flex-col items-center justify-center'>
      {/* --- Текст по центру (под лентами) --- */}
      <div className='z-10 text-center px-4 flex flex-col items-center animate-pulse'>
        <div className='text-6xl mb-4'>🚧</div>
        <h1 className='text-3xl font-cruinn font-bold text-[#21201F] mb-2'>
          Раздел в разработке
        </h1>
        <p className='text-[#9E9E9E] mb-8 max-w-xs mx-auto'>
          Мы прямо сейчас пишем историю... Загляните сюда чуть позже!
        </p>
      </div>

      {/* --- ЛЕНТА 1 (Наклон влево, едет вправо) --- */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] -rotate-6 py-4 bg-[#FFE600] border-y-4 border-black shadow-xl z-20 pointer-events-none flex select-none'>
        <div className='animate-marquee flex whitespace-nowrap'>
          {Array(20)
            .fill('CAUTION • ЕЩЕ В РАЗРАБОТКЕ • WORK IN PROGRESS • ')
            .map((text, i) => (
              <span
                key={i}
                className='mx-4 text-2xl font-black text-black tracking-widest'
              >
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* --- ЛЕНТА 2 (Наклон вправо, едет влево) --- */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] rotate-12 py-4 bg-[#21201F] border-y-4 border-[#FFE600] shadow-xl z-30 pointer-events-none flex select-none opacity-90'>
        <div className='animate-marquee-reverse flex whitespace-nowrap'>
          {Array(20)
            .fill('SOON • СКОРО ОТКРЫТИЕ • COMING SOON • ')
            .map((text, i) => (
              <span
                key={i}
                className='mx-4 text-2xl font-black text-[#FFE600] tracking-widest'
              >
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* --- Глобальные стили для анимации (можно вынести в globals.css) --- */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;
