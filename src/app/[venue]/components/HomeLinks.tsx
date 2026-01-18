import HomeLink from './HomeLink';

import { MainButton } from '@/types/api';

interface IProps {
  venueSlug: string;
  buttons: MainButton[][];
}

const HomeLinks = ({ venueSlug = 'ustukan', buttons }: IProps) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4'>
      {buttons.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid gap-3 ${
            row.length === 2 ? 'grid-cols-2 mb-3' : 'grid-cols-3'
          }`}
        >
          {row.map((btn) => (
            <HomeLink
              key={btn.id}
              img={btn.photo}
              label={btn.name}
              sectionId={btn.section?.id ?? 0}
              venueSlug={venueSlug}
              isPriority={rowIdx === 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default HomeLinks;
