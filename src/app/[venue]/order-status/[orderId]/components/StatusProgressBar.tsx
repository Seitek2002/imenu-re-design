'use client';

import { X, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { STEPS_CONFIG, StepKey } from '../steps';
import {
  isCancelled,
  isPendingPayment,
  statusToStepIndex,
} from '@/lib/helpers/progressHelper';

interface Props {
  serviceMode: number;
  status: number;
}

function stepText(
  t: ReturnType<typeof useTranslations>,
  key: StepKey,
  suffix: 'title' | 'desc',
): string {
  const [mode, idx] = key.split('.');
  return t(`steps.${mode}.${idx}_${suffix}`);
}

export default function StatusProgressBar({ serviceMode, status }: Props) {
  const t = useTranslations('OrderStatus');
  const steps = STEPS_CONFIG[serviceMode] || STEPS_CONFIG[2];
  const total = steps.length;

  const cancelled = isCancelled(status);
  const pendingPayment = isPendingPayment(status);
  const isOverlay = cancelled || pendingPayment;

  const currentStepIndex = statusToStepIndex(status, serviceMode);

  // При оверлее (отмена/ждёт оплату) прогресс на 0%, иначе считаем по шагам.
  const progressPercent = isOverlay
    ? 0
    : total <= 1
      ? 0
      : (currentStepIndex / (total - 1)) * 100;

  const CurrentStepInfo = steps[currentStepIndex];

  let title: string;
  let desc: string;
  if (cancelled) {
    title = t('cancelled');
    desc = t('cancelledDesc');
  } else if (pendingPayment) {
    title = t('pendingPayment');
    desc = t('pendingPaymentDesc');
  } else {
    title = CurrentStepInfo ? stepText(t, CurrentStepInfo.key, 'title') : '';
    desc = CurrentStepInfo ? stepText(t, CurrentStepInfo.key, 'desc') : '';
  }

  return (
    <div className='bg-white rounded-[30px] p-5 shadow-sm mb-4'>
      {/* Заголовок */}
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold mb-1'>{title}</h2>
        <p className='text-gray-400 text-sm'>{desc}</p>
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
            const isActive = !isOverlay && index <= currentStepIndex;
            const isOverlayActive = isOverlay && index === 0;

            // Отмена → крест на первом шаге; ожидание оплаты → кошелёк на первом шаге.
            let IconComponent = step.Icon;
            if (cancelled && index === 0) IconComponent = X;
            else if (pendingPayment && index === 0) IconComponent = Wallet;

            return (
              <div
                key={step.key}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500
                  ${
                    isActive || isOverlayActive
                      ? 'bg-brand border-brand text-white shadow-lg scale-110'
                      : 'bg-white border-gray-200 text-gray-300'
                  }
                `}
              >
                <IconComponent
                  size={20}
                  strokeWidth={isActive || isOverlayActive ? 2.5 : 2}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
