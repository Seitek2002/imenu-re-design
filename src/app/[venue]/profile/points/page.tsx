'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  ShoppingBag,
  BadgePercent,
  Gift,
} from 'lucide-react';

type Entry = {
  id: string;
  kind: 'order' | 'promo' | 'gift';
  title: string;
  subtitle: string;
  amount: number;
  time: string;
};

type Group = { title: string; entries: Entry[] };

const GROUPS: Group[] = [
  {
    title: 'Сегодня',
    entries: [
      {
        id: '1',
        kind: 'order',
        title: 'Начисление за заказ',
        subtitle: '№ 45799839',
        amount: 120,
        time: '18:34',
      },
      {
        id: '2',
        kind: 'order',
        title: 'Списание за заказ',
        subtitle: '№ 45799839',
        amount: -200,
        time: '18:20',
      },
    ],
  },
  {
    title: 'Вчера',
    entries: [
      {
        id: '3',
        kind: 'promo',
        title: 'Бонус по акции',
        subtitle: 'День рождения',
        amount: 500,
        time: '12:01',
      },
    ],
  },
  {
    title: '8 апреля',
    entries: [
      {
        id: '4',
        kind: 'order',
        title: 'Начисление за заказ',
        subtitle: '№ 45799841',
        amount: 99,
        time: '20:15',
      },
      {
        id: '5',
        kind: 'gift',
        title: 'Подарок',
        subtitle: 'Промокод WELCOME',
        amount: 250,
        time: '10:00',
      },
    ],
  },
];

const ICON: Record<Entry['kind'], React.ElementType> = {
  order: ShoppingBag,
  promo: BadgePercent,
  gift: Gift,
};

export default function PointsHistoryPage() {
  const { venue } = useParams<{ venue: string }>();

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>История бонусов</h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='bg-white rounded-2xl px-4 py-4 flex items-stretch'>
          <div className='flex-1 pr-3'>
            <div className='text-[13px] text-[#9E9E9E]'>Баланс</div>
            <div className='mt-1 text-[22px] font-extrabold text-[#21201F]'>1 245 б.</div>
          </div>
          <div className='w-px bg-[#EDEAE7]' />
          <div className='flex-1 pl-4 flex flex-col gap-1.5 justify-center'>
            <Stat label='Накоплено всего' value='2 384' />
            <Stat label='Списано всего' value='1 139' />
          </div>
        </section>

        <button className='self-start inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[#EDEAE7] text-[13px] text-[#21201F]'>
          <Calendar size={16} className='text-[#9E9E9E]' />
          За месяц
          <ChevronDown size={16} className='text-[#9E9E9E]' />
        </button>

        <section className='bg-white rounded-2xl px-4 py-4 flex flex-col divide-y divide-[#EDEAE7]'>
          {GROUPS.map((g) => (
            <div key={g.title} className='py-3 first:pt-0 last:pb-0'>
              <div className='text-[12px] text-[#9E9E9E]'>{g.title}</div>
              <ul className='mt-3 flex flex-col gap-3'>
                {g.entries.map((e) => {
                  const Icon = ICON[e.kind];
                  const positive = e.amount >= 0;
                  return (
                    <li key={e.id} className='flex items-center gap-3'>
                      <div className='w-[42px] h-[42px] rounded-full bg-[#F4F1EE] flex items-center justify-center shrink-0'>
                        <Icon size={20} className='text-[#21201F]' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-[14px] text-[#21201F] truncate'>{e.title}</div>
                        <div className='text-[12px] text-[#9E9E9E] mt-0.5 truncate'>
                          {e.subtitle}
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <div
                          className={`text-[15px] font-bold ${
                            positive ? 'text-[#22A05A]' : 'text-[#E0533A]'
                          }`}
                        >
                          {positive ? '+' : '−'}
                          {Math.abs(e.amount)}
                        </div>
                        <div className='text-[12px] text-[#9E9E9E]'>{e.time}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between text-[13px]'>
      <span className='text-[#9E9E9E]'>{label}</span>
      <span className='text-[#21201F] font-semibold'>{value}</span>
    </div>
  );
}
