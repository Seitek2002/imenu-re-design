import { FC } from 'react';
import ClosedStoreIllustration from './illustrations/ClosedStoreIllustration';

interface Props {
  scheduleMessage?: string;
  brandColor?: string;
}

const StoreClosedCard: FC<Props> = ({
  scheduleMessage = 'Ждем вас завтра с 10:00',
  brandColor = '#FF9900'
}) => {
  return (
    <div className='bg-white rounded-3xl p-6 text-center shadow-sm mt-2 mb-3'>
      {/* Иллюстрация */}
      <div className='relative w-50 h-50 mx-auto mb-4'>
        <ClosedStoreIllustration color={brandColor} className="w-full h-full" />
      </div>

      {/* Заголовок */}
      <h2 className='text-xl font-bold text-[#21201f] mb-2'>
        Сейчас нерабочее время бла-бла-бла
      </h2>

      {/* Подзаголовок (динамический) */}
      <p className='text-gray-500 text-sm mb-6'>{scheduleMessage}</p>

      {/* Кнопка "Посмотреть меню" (если нужно просто показать меню,
          можно сделать Link на страницу с параметром ?view=menu 
          или просто ScrollLink, если меню скрыто ниже) 
      */}
      {/* <button className='...'>Посмотреть меню</button> */}
    </div>
  );
};

export default StoreClosedCard;
