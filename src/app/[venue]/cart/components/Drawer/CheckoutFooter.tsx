// components/Drawer/CheckoutFooter.tsx
import { FC } from 'react';

interface Props {
  total: number;
  isSubmitting: boolean;
  onPay: () => void;
}

const CheckoutFooter: FC<Props> = ({ total, isSubmitting, onPay }) => {
  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col'>
        <span className='text-xs text-gray-500 font-medium'>К оплате</span>
        <span className='text-2xl font-bold font-cruinn text-[#111111]'>
          {total} c.
        </span>
      </div>

      <button
        onClick={onPay}
        disabled={isSubmitting}
        className={`
          flex-1 h-14 rounded-2xl font-bold text-white text-lg shadow-lg
          transition-all active:scale-95 flex items-center justify-center gap-2
          ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand'}
        `}
      >
        {isSubmitting ? (
          <>
            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            <span>Обработка...</span>
          </>
        ) : (
          'Оплатить заказ'
        )}
      </button>
    </div>
  );
};

export default CheckoutFooter;
