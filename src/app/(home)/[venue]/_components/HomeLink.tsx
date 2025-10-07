import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface IProps {
  img: StaticImport;
  label: string;
}

const HomeLink: FC<IProps> = ({ img, label }) => {
  return (
    <Link href={'/ustukan/foods'} key={label} className='text-center relative'>
      <Image src={img} alt={label} />
      <div className='mt-2 font-semibold'>{label}</div>
    </Link>
  );
};

export default HomeLink;
