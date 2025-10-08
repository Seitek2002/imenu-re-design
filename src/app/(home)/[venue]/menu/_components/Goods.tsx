import { FC } from 'react';
import GoodItem from './GoodItem';

import { goodItems, type ApiItem } from './Goods.helpers';
import { Category } from '@/lib/api/types';

type Props = {
  category: Category['categoryName'];
};

const Goods: FC<Props> = ({ category }) => {
  console.log(
    goodItems.filter((item) => item.category.categoryName === category)
  );
  const filteredGoods = goodItems.filter(
    (item) => item.category.categoryName === category
  );

  return (
    <div className='grid grid-cols-2 gap-2'>
      {filteredGoods.length > 0 ? (
        filteredGoods.map((item: ApiItem) => (
          <GoodItem key={item.id} item={item} />
        ))
      ) : (
        <h1>Пусто</h1>
      )}
    </div>
  );
};

export default Goods;
