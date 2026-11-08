import Image, { type StaticImageData } from 'next/image';

import burger from '@/assets/HomeLinks/home-links-1.png';
import coffee from '@/assets/HomeLinks/home-links-2.png';
import combo from '@/assets/HomeLinks/home-links-5.png';
import tea from '@/assets/Foods/item-1.png';
import lemonade from '@/assets/Foods/item-6.png';

// Упрощённая копия главной заведения (/[venue]): шапка с логотипом,
// плитки разделов, виджет «Открыто», корзина и таб-бар. Вместо логотипа —
// пустой слот: в КП это «ваше заведение».

interface Tile {
  label: string;
  img: StaticImageData;
  big?: boolean;
}

const TILES: Tile[] = [
  { label: 'Бургеры', img: burger, big: true },
  { label: 'Чай', img: tea, big: true },
  { label: 'Кофе', img: coffee },
  { label: 'Комбо', img: combo },
  { label: 'Лимонады', img: lemonade },
];

export default function PhoneMock() {
  return (
    <div className='lp-phone'>
      <div className='lp-phone__screen'>
        <div className='lp-phone__statusbar'>
          <span>19:02</span>
          <span className='lp-phone__notch' />
          <span className='lp-phone__battery' />
        </div>

        <div className='lp-phone__header'>
          <span className='lp-phone__logo'>лого</span>
          <span className='lp-phone__name'>
            <b>Ваше заведение</b>
            <small>Powered by iMenu.kg</small>
          </span>
          <span className='lp-phone__table'>Стол 7</span>
        </div>

        <div className='lp-phone__tiles'>
          {TILES.map((tile) => (
            <div
              key={tile.label}
              className={`lp-phone__tile${tile.big ? ' lp-phone__tile--big' : ''}`}
            >
              <span className='lp-phone__tile-img'>
                <Image src={tile.img} alt='' sizes='120px' />
              </span>
              <span className='lp-phone__tile-label'>{tile.label}</span>
            </div>
          ))}
        </div>

        <div className='lp-phone__open'>
          <span className='lp-phone__dot' />
          <span>Открыто</span>
          <b>до 23:00</b>
        </div>

        <div className='lp-phone__cart'>
          <span className='lp-phone__cart-count'>2</span>
          <span>Корзина</span>
          <b>1 240 сом</b>
        </div>

        <div className='lp-phone__tabbar'>
          <span className='is-active' />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
