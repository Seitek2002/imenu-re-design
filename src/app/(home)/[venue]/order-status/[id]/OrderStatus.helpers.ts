import clockIcon from '@/assets/OrderStatus/clock.svg';
import chefIcon from '@/assets/OrderStatus/chef-hat.svg';
import checkIcon from '@/assets/OrderStatus/check.svg';
import geoIcon from '@/assets/OrderStatus/geo.svg';

export type StepsKey = number;

export type Step = {
  key: number;
  title: string;
  desc: string;
  icon: typeof clockIcon;
};

export type StepsMap = Record<StepsKey, Step[]>;

export const steps: StepsMap = {
  2: [
    {
      key: 0,
      title: 'Заказ принят!',
      desc: 'Мы получили ваш заказ и скоро передадим его на кухню.',
      icon: clockIcon,
    },
    {
      key: 1,
      title: 'Готовим ваш заказ',
      desc: 'Наши повара уже работают над вашим блюдом.',
      icon: chefIcon,
    },
    {
      key: 2,
      title: 'Ваш заказ готов!',
      desc: 'Можно забрать на стойке выдачи.',
      icon: checkIcon,
    },
    {
      key: 3,
      title: 'Заказ выполнен',
      desc: 'Приятного аппетита!',
      icon: geoIcon,
    },
  ],
  3: [
    {
      key: 0,
      title: 'Заказ принят',
      desc: 'Мы получили ваш заказ и готовим его к отправке.',
      icon: clockIcon,
    },
    {
      key: 1,
      title: 'Ваш заказ передан на кухню',
      desc: 'Наши повара уже готовят ваше блюдо.',
      icon: chefIcon,
    },
    {
      key: 2,
      title: 'Заказ передан курьеру',
      desc: 'Курьер уже в пути и скоро доставит ваш заказ.',
      icon: checkIcon,
    },
    {
      key: 3,
      title: 'Заказ выполнен',
      desc: 'Приятного аппетита и хорошего дня!',
      icon: geoIcon,
    },
  ],
  1: [
    {
      key: 0,
      title: 'Заказ принят',
      desc: 'Мы получили ваш заказ и передаём его на кухню.',
      icon: clockIcon,
    },
    {
      key: 1,
      title: 'Ваш заказ передан на кухню',
      desc: 'Наши повара уже готовят ваше блюдо.',
      icon: chefIcon,
    },
    {
      key: 2,
      title: 'Заказ подан за стол',
      desc: 'Ваши блюда уже на столе. Приятного аппетита!',
      icon: checkIcon,
    },
  ],
};
