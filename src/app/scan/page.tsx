'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, Camera, AlertCircle, X } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
// import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();

  // Состояния
  const isMounted = useMounted();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Функция валидации URL
  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  // Обработка успешного сканирования
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = (result: any) => {
    if (result) {
      // Библиотека может возвращать массив или объект, берем сырое значение
      const rawValue = result[0]?.rawValue || result?.rawValue || result;

      // Чтобы не сканировало один и тот же код много раз подряд
      if (rawValue === scannedData) return;

      if (isValidUrl(rawValue)) {
        // Если это валидная ссылка — переходим
        window.location.href = rawValue;
      } else {
        // Если мусор — показываем модалку
        setScannedData(rawValue);
        setErrorModalOpen(true);
      }
    }
  };

  // Обработка ошибок камеры
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any) => {
    console.error(error);
    // Обычно ошибка доступа содержит 'NotAllowedError' или 'PermissionDeniedError'
    if (
      error?.name === 'NotAllowedError' ||
      error?.name === 'PermissionDeniedError'
    ) {
      setHasPermission(false);
    }
  };

  // Компонент загрузки/инициализации
  if (!isMounted) return <div className='min-h-screen bg-black' />;

  return (
    <div className='min-h-screen bg-black flex flex-col relative'>
      {/* Хедер с кнопкой назад */}
      <div className='absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-linear-to-b from-black/70 to-transparent'>
        <button
          onClick={() => router.back()}
          className='text-white p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors'
        >
          <ArrowLeft className='w-6 h-6' />
        </button>
        <h1 className='text-white font-semibold text-lg'>Сканирование QR</h1>
        <div className='w-10' /> {/* Пустой блок для центровки */}
      </div>

      {/* Основная зона сканера */}
      <div className='flex-1 flex flex-col justify-center items-center relative overflow-hidden'>
        {/* Состояние: Нет прав доступа */}
        {hasPermission === false ? (
          <div className='text-center px-6 py-10 bg-white rounded-2xl mx-4 max-w-sm'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Camera className='w-8 h-8 text-red-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
              Доступ к камере запрещен
            </h3>
            <p className='text-gray-600 mb-6'>
              Мы не можем сканировать QR-код без доступа к камере. Пожалуйста,
              разрешите доступ в настройках браузера.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors'
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          /* Сам сканер */
          <div className='w-full h-full absolute inset-0'>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              components={{
                finder: false,
              }}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { width: '100%', height: '100%', objectFit: 'cover' },
              }}
            />

            {/* Визуальная рамка сканера */}
            <div className='absolute inset-0 z-10 flex items-center justify-center'>
              <div className='relative w-72 h-72'>
                {/* Уголки рамки */}
                <div className='absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-red-500 rounded-tl-xl' />
                <div className='absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-red-500 rounded-tr-xl' />
                <div className='absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-red-500 rounded-bl-xl' />
                <div className='absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-red-500 rounded-br-xl' />

                {/* Анимация сканирования */}
                <div className='absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]' />
              </div>
            </div>

            {/* Подсказка */}
            <div className='absolute bottom-20 left-0 right-0 text-center z-10 px-4'>
              <p className='text-white/80 text-sm bg-black/40 py-2 px-4 rounded-full inline-block backdrop-blur-sm'>
                Наведите камеру на QR-код заведения
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Модалка ошибки (Невалидный QR) */}
      {errorModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-start mb-4'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                <AlertCircle className='w-6 h-6 text-red-600' />
              </div>
              <button
                onClick={() => setErrorModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 p-1'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <h3 className='text-xl font-bold text-gray-900 mb-2'>
              Некорректный QR-код
            </h3>
            <p className='text-gray-600 mb-6 leading-relaxed'>
              Этот QR-код не содержит ссылки на заведение. Пожалуйста,
              убедитесь, что вы сканируете правильный код iMenu.
            </p>

            <button
              onClick={() => {
                setErrorModalOpen(false);
                setScannedData(''); // Сбрасываем, чтобы можно было сканировать снова
              }}
              className='w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 active:scale-95 transition-all'
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Стили для анимации сканера */}
      <style jsx global>{`
        @keyframes scan {
          0%,
          100% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
