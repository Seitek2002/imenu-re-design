'use client';

import { useTranslations } from 'next-intl';
import ContentItem from './ContentItem';
import { Category } from '@/types/api';

export type CategoryGroup = {
  parent: Category | null; // null = orphans, рендерятся без заголовка
  items: Category[];
};

export type CategoryLayout =
  | { mode: 'flat'; items: Category[] }
  | { mode: 'grouped'; groups: CategoryGroup[] };

interface Props {
  venueSlug: string;
  layout: CategoryLayout;
  // catId → число товаров в этой категории (по product.categories[].id).
  productCountByCatId?: Record<number, number>;
}

function renderGrid(
  items: Category[],
  venueSlug: string,
  productCountByCatId: Record<number, number> | undefined,
  parent: Category | null,
  isFirstGroup: boolean,
) {
  // Родитель сам обычно не имеет товаров — суммируем по детям группы.
  const parentCount = parent
    ? items.reduce(
        (acc, c) => acc + (productCountByCatId?.[c.id] ?? 0),
        productCountByCatId?.[parent.id] ?? 0,
      )
    : 0;

  return (
    <div className='grid grid-cols-6 gap-3'>
      {parent && (
        <ContentItem
          key={`cover-${parent.id}`}
          id={parent.id}
          name={parent.categoryName}
          img={parent.categoryPhoto || parent.categoryPhotoSmall || '/placeholder.png'}
          venueSlug={venueSlug}
          slug={parent.slug}
          productCount={parentCount}
          isLarge
          isCover
          isPriority={isFirstGroup}
        />
      )}
      {items.map((item, index) => {
        // Ресет ритма 3-2-3-2 на каждую группу — секции выглядят цельно.
        const positionInCycle = index % 5;
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
            parentSlug={parent?.slug}
            productCount={productCountByCatId?.[item.id] ?? 0}
            isLarge={isLarge}
            isPriority={isFirstGroup && index < 4}
          />
        );
      })}
    </div>
  );
}

const Content = ({ venueSlug, layout, productCountByCatId }: Props) => {
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
    <div className='bg-white rounded-4xl p-4 pb-28 shadow-sm mt-4'>
      {layout.mode === 'flat' ? (
        renderGrid(layout.items, venueSlug, productCountByCatId, null, true)
      ) : (
        <div className='flex flex-col gap-6'>
          {layout.groups.map((group, groupIdx) => (
            <section key={group.parent?.id ?? 'orphan'}>
              {!group.parent && (
                <h2 className='text-lg font-bold text-[#21201F] mb-3 px-1'>
                  {t('other')}
                </h2>
              )}
              {renderGrid(
                group.items,
                venueSlug,
                productCountByCatId,
                group.parent,
                groupIdx === 0,
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Content;
