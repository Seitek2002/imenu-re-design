import Category from './Category';
import Goods from './Goods';

const Content = () => {
  return (
    <div className='bg-white rounded-4xl mt-1.5 min-h-[120svh]'>
      <Category />
      <div className='px-4'>
        <Goods />
      </div>
    </div>
  );
};

export default Content;
