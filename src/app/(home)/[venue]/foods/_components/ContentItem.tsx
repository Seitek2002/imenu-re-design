import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { PAGES } from '@/config/pages.config';

type Props = {
  name: string;
  img: StaticImageData;
  slug: string;
};

const ContentItem: FC<Props> = ({ name, img, slug }) => {
  return (
    <Link
      className='content-item h-28 rounded-2xl relative'
      href={PAGES.MENU(slug)}
    >
      <span className='text-[#21201F] text-sm font-semibold absolute top-3 left-3'>
        {name}
      </span>
      <Image src={img} alt='photo category' className='h-full' />
    </Link>
  );
};

export default ContentItem;
