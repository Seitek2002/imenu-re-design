import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PAGES } from '@/config/pages.config';

type Props = {
  name: string;
  img: string;
  slug: string;
};

const ContentItem: FC<Props> = ({ name, img, slug }) => {
  return (
    <Link
      className='content-item h-28 rounded-2xl overflow-hidden relative'
      href={PAGES.MENU(slug)}
    >
      <span className='text-[#21201F] bg-white text-sm z-10 font-semibold absolute top-3 left-3'>
        {name}
      </span>
      <Image src={img || '/placeholder-dish.svg'} fill alt='photo category' className='h-full object-cover' />
    </Link>
  );
};

export default ContentItem;
