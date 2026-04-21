import HomeLink from './HomeLink';

import { MainButton } from '@/types/api';

interface IProps {
  venueSlug: string;
  buttons: MainButton[][];
}

function resolveHref(btn: MainButton, venueSlug: string): string | null {
  if (btn.buttonType === 'section' && btn.section?.id != null) {
    return `/${venueSlug}/categories/${btn.section.id}`;
  }
  if (btn.buttonType === 'category' && btn.category?.slug) {
    return `/${venueSlug}/products/${btn.category.slug}`;
  }
  return null;
}

const HomeLinks = ({ venueSlug = 'ustukan', buttons }: IProps) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4'>
      {buttons.map((row, rowIdx) => {
        const resolved = row
          .map((btn) => ({ btn, href: resolveHref(btn, venueSlug) }))
          .filter((x): x is { btn: MainButton; href: string } => x.href !== null);

        if (resolved.length === 0) return null;

        return (
          <div
            key={rowIdx}
            className={`grid gap-3 ${
              resolved.length === 2 ? 'grid-cols-2 mb-3' : 'grid-cols-3'
            }`}
          >
            {resolved.map(({ btn, href }) => (
              <HomeLink
                key={btn.id}
                img={btn.photo}
                label={btn.name}
                href={href}
                isPriority={rowIdx === 0}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default HomeLinks;
