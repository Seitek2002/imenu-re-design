import { FC } from 'react';

import HomeLink from './HomeLink';

import homeLinksImg1 from '@/assets/HomeLinks/home-links-1.png';
import homeLinksImg2 from '@/assets/HomeLinks/home-links-2.png';
import homeLinksImg3 from '@/assets/HomeLinks/home-links-3.png';
import homeLinksImg4 from '@/assets/HomeLinks/home-links-4.png';
import homeLinksImg5 from '@/assets/HomeLinks/home-links-5.png';

const sections = [
  {
    cols: 'grid-cols-2',
    textSize: 'text-xl',
    items: [
      { img: homeLinksImg1, label: 'Вкусная еда' },
      { img: homeLinksImg2, label: 'Напитки' },
    ],
  },
  {
    cols: 'grid-cols-3',
    textSize: 'text-base',
    items: [
      { img: homeLinksImg3, label: 'Избранное' },
      { img: homeLinksImg4, label: 'Акции' },
      { img: homeLinksImg5, label: 'Комбо' },
    ],
  },
];

const HomeLinks: FC = () => {
  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4'>
      {sections.map((section, i) => (
        <div
          key={i}
          className={`home-links-content grid ${section.cols} gap-3 ${
            i > 0 ? 'mt-3' : ''
          } ${section.textSize}`}
        >
          {section.items.map(({ img, label }) => (
            <HomeLink key={label} img={img} label={label} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HomeLinks;
