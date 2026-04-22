'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ContentItem from './ContentItem';
import { Category } from '@/types/api';

export type CategoryGroup = {
  parent: Category | null; // null = "Остальное"
  items: Category[];
};

export type CategoryLayout =
  | { mode: 'flat'; items: Category[] }
  | { mode: 'grouped'; groups: CategoryGroup[] };

interface Props {
  venueSlug: string;
  layout: CategoryLayout;
}

function renderGrid(items: Category[], venueSlug: string, offset = 0) {
  return (
    <div className='grid grid-cols-6 gap-3'>
      {items.map((item, index) => {
        const globalIndex = offset + index;
        // Логика сетки 3-2-3-2 сохранена: 3 маленьких + 2 больших в цикле из 5
        const positionInCycle = globalIndex % 5;
        const isLarge = positionInCycle >= 3;

        return (
          <ContentItem
            key={item.id}
            id={item.id}
            name={item.categoryName}
            img={
              item.categoryPhotoSmall ||
              item.categoryPhoto ||
              '/placeholder.png'
            }
            venueSlug={venueSlug}
            slug={item.slug}
            isLarge={isLarge}
            isPriority={globalIndex < 5}
          />
        );
      })}
    </div>
  );
}

const Content = ({ venueSlug, layout }: Props) => {
  const t = useTranslations('Categories');
  const isEmpty =
    (layout.mode === 'flat' && layout.items.length === 0) ||
    (layout.mode === 'grouped' && layout.groups.length === 0);

  if (isEmpty) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] text-gray-400'>
        <p>{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-4xl p-4 pb-36 min-h-screen shadow-sm mt-4'>
      {layout.mode === 'flat' ? (
        renderGrid(layout.items, venueSlug)
      ) : (
        <div className='flex flex-col gap-6'>
          {layout.groups.map((group, groupIdx) => {
            const offset = layout.groups
              .slice(0, groupIdx)
              .reduce((acc, g) => acc + g.items.length, 0);

            const headerText = group.parent?.categoryName ?? t('other');
            const headerLink = group.parent
              ? `/${venueSlug}/products/${group.parent.slug}`
              : null;

            return (
              <section key={group.parent?.id ?? 'orphan'}>
                {headerLink ? (
                  <Link
                    href={headerLink}
                    className='flex items-center justify-between mb-3 px-1 group'
                  >
                    <h2 className='text-lg font-bold text-[#21201F]'>
                      {headerText}
                    </h2>
                    <span className='text-sm text-brand font-medium group-active:translate-x-0.5 transition-transform'>
                      {t('viewAll')}
                    </span>
                  </Link>
                ) : (
                  <h2 className='text-lg font-bold text-[#21201F] mb-3 px-1'>
                    {headerText}
                  </h2>
                )}
                {renderGrid(group.items, venueSlug, offset)}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Content;
