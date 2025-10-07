import Header from '../_components/Header';
import Content from './_components/Content';

const MenuPage = () => {
  return (
    <main className='px-2.5'>
      <Header title='Меню' showSearch />
      <Content />
    </main>
  );
};

export default MenuPage;
