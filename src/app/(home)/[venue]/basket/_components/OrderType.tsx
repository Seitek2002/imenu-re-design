import { FC } from 'react';

interface IProps {
  orderType: 'takeout' | 'dinein' | 'delivery';
  setOrderType: (key: 'takeout' | 'dinein' | 'delivery') => void;
}

const OrderType: FC<IProps> = ({ orderType, setOrderType }) => {
  return (
    <div className='bg-[#FAFAFA] rounded-full'>
      <div className='grid grid-cols-2 gap-2 p-1'>
        {[
          { key: 'takeout', label: 'С собой' },
          { key: 'delivery', label: 'Доставка' },
        ].map((o) => {
          const isActive = orderType === (o.key as typeof orderType);
          return (
            <button
              key={o.key}
              onClick={() => setOrderType(o.key as typeof orderType)}
              className={`py-2 rounded-full text-sm transition-colors ${
                isActive
                  ? 'text-[#111111] bg-[#EFEEEC] font-semibold'
                  : 'text-[#6B6B6B]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderType;
