import { FC } from 'react';
import { UtensilsCrossed } from 'lucide-react'; // Или любая другая иконка

interface Props {
  tableNumber: string | number;
}

const TableBadge: FC<Props> = ({ tableNumber }) => {
  return (
    <div className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        {/* Иконка в кружочке */}
        <div className='w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand'>
          <UtensilsCrossed size={20} />
        </div>

        <div className='flex flex-col'>
          <span className='text-xs text-gray-500 font-medium'>
            Ваш заказ для
          </span>
          <span className='text-lg font-bold text-[#21201f] leading-none'>
            Стола № {tableNumber}
          </span>
        </div>
      </div>

      {/* Декоративный статус или просто визуальный элемент */}
      <div className='px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg'>
        В зале
      </div>
    </div>
  );
};

export default TableBadge;
