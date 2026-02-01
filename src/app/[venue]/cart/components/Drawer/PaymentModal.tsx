'use client';

import ModalPortal from '@/app/[venue]/cart/components/ModalPortal';

interface Props {
  open: boolean;
  onClose: () => void;
  method: 'elqr' | 'cash';
  onSelect: (m: 'elqr' | 'cash') => void;
}

export default function PaymentModal({
  open,
  onClose,
  method,
  onSelect,
}: Props) {
  return (
    <ModalPortal open={open} onClose={onClose} zIndex={100}>
      <div className='relative p-4'>
        <button
          onClick={onClose}
          className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center font-bold'
        >
          ✕
        </button>
        <h3 className='text-lg font-bold text-center mb-6'>Способ оплаты</h3>
        <div className='flex flex-col gap-3'>
          <PaymentOption
            label='ELQR'
            isActive={method === 'elqr'}
            onClick={() => {
              onSelect('elqr');
              onClose();
            }}
          />
          <PaymentOption
            label='Наличными'
            isActive={method === 'cash'}
            onClick={() => {
              onSelect('cash');
              onClose();
            }}
          />
        </div>
      </div>
    </ModalPortal>
  );
}

// Микро-компонент для кнопки (можно оставить внутри файла)
function PaymentOption({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${
        isActive ? 'border-brand bg-brand/5' : 'border-transparent bg-[#F5F5F5]'
      }`}
    >
      <span className='font-semibold'>{label}</span>
      {isActive && <div className='w-3 h-3 rounded-full bg-brand' />}
    </button>
  );
}
