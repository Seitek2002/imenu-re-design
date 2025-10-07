import GoodItem from './GoodItem';

import { goodItems } from './Goods.helpers';

const Goods = () => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {goodItems.map((item) => (
        <GoodItem key={item.name} {...item} />
      ))}
    </div>
  );
};

export default Goods;
