'use client';

import { useState } from 'react';
import Header from '../_components/Header';
import Content from './_components/Content';

const MenuPage = () => {
  const [headerHidden, setHeaderHidden] = useState(false);

  return (
    <main className='px-2.5'>
      <Header
        title='Меню'
        showSearch
        onVisibilityChange={setHeaderHidden}
      />
      <Content headerHidden={headerHidden} />
    </main>
  );
};

export default MenuPage;
