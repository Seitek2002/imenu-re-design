import GoodItem from './GoodItem';

import { goodItems, type ApiItem } from './Goods.helpers';

const Goods = () => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {goodItems.map((item: ApiItem) => (
        <GoodItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default Goods;
