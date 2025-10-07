import ContentItem from './ContentItem';

import {
  foodItems,
  chunkByPattern,
  defaultGridPattern,
} from './Content.helpers';

const Content = () => {
  const rows = chunkByPattern(foodItems, defaultGridPattern);

  return (
    <div className='bg-white rounded-4xl p-4 flex flex-col gap-2 mt-1.5'>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid ${
            row.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          } gap-2`}
        >
          {row.map((item) => (
            <ContentItem
              key={item.slug}
              name={item.name}
              img={item.img}
              slug={item.slug}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Content;
