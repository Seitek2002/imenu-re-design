import HomeLink from './HomeLink';
import { getMainButtons } from '@/lib/server/getMainButtons';

// Server component: fetches data on the server and renders list
export default async function HomeLinks({ venueSlug }: { venueSlug: string }) {
  const data = await getMainButtons(venueSlug);
  const rows = Array.isArray(data) && data.length === 2 ? data : [[], []];

  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4'>
      {[0, 1].map((rowIdx) => {
        const row = rows[rowIdx] || [];
        const colsClass = rowIdx === 0 ? 'grid-cols-2' : 'grid-cols-3';
        const textSize = rowIdx === 0 ? 'text-xl' : 'text-base';

        return (
          <div
            key={rowIdx}
            className={`home-links-content grid ${colsClass} gap-3 ${
              rowIdx > 0 ? 'mt-3' : ''
            } ${textSize}`}
          >
            {row.map((btn) => (
              <HomeLink
                key={btn.id}
                img={btn.photo ?? '/placeholder-dish.svg'}
                label={btn.name ?? ''}
                sectionId={btn.section?.id ?? 0}
                venueSlug={venueSlug}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
