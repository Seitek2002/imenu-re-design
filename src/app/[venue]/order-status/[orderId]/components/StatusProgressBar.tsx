'use client';

import { X } from 'lucide-react'; // 1. Импортируем иконку крестика
import { useTranslations } from 'next-intl';
import { STEPS_CONFIG, StepKey } from '../steps';

interface Props {
  serviceMode: number;
  status: number;
}

function stepText(t: ReturnType<typeof useTranslations>, key: StepKey, suffix: 'title' | 'desc'): string {
  const [mode, idx] = key.split('.');
  return t(`steps.${mode}.${idx}_${suffix}`);
}

export default function StatusProgressBar({ serviceMode, status }: Props) {
  const t = useTranslations('OrderStatus');
  const steps = STEPS_CONFIG[serviceMode] || STEPS_CONFIG[2];
  const total = steps.length;
  const isCancelled = status === 7;

  // 2. 🔥 ИСПРАВЛЕНИЕ ЛОГИКИ:
  // Если отмена (7) -> активный шаг всегда 0.
  // Иначе -> ограничиваем статус длиной массива.
  const currentStepIndex = isCancelled
    ? 0
    : Math.min(Math.max(0, status), total - 1);

  // Расчет ширины полоски
  const progressPercent =
    total <= 1 ? 0 : (currentStepIndex / (total - 1)) * 100;

  const CurrentStepInfo = steps[currentStepIndex];

  return (
    <div className='bg-white rounded-[30px] p-5 shadow-sm mb-4'>
      {/* Заголовок */}
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold mb-1'>
          {isCancelled ? t('cancelled') : CurrentStepInfo && stepText(t, CurrentStepInfo.key, 'title')}
        </h2>
        <p className='text-gray-400 text-sm'>
          {isCancelled ? t('cancelledDesc') : CurrentStepInfo && stepText(t, CurrentStepInfo.key, 'desc')}
        </p>
      </div>

      {/* Визуализация */}
      <div className='relative'>
        {/* Фон линии */}
        <div className='absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0' />

        {/* Активная линия */}
        <div
          className='absolute top-1/2 left-0 h-1 bg-brand -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out'
          style={{ width: `${progressPercent}%` }}
        />

        {/* Кружочки */}
        <div className='relative z-10 flex justify-between'>
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;

            // 3. 🔥 ПОДМЕНА ИКОНКИ:
            // Если заказ отменен И это первый шаг (активный) -> ставим крестик.
            // Иначе -> берем иконку из конфига.
            const IconComponent = isCancelled && index === 0 ? X : step.Icon;

            return (
              <div
                key={step.key}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500
                  ${
                    isActive
                      ? 'bg-brand border-brand text-white shadow-lg scale-110'
                      : 'bg-white border-gray-200 text-gray-300'
                  }
                `}
              >
                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
