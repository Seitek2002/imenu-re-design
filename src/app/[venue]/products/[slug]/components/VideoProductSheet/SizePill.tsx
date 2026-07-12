'use client';

export interface SizePillOption {
  id: number;
  label: string;
  sub: string | null;
}

interface Props {
  options: SizePillOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function SizePill({ options, selectedId, onSelect }: Props) {
  if (options.length === 0) return null;

  return (
    <div className='overflow-x-auto no-scrollbar -mx-5 px-5'>
      <div
        className='inline-flex items-stretch gap-1 p-1.5 rounded-full bg-white/10 backdrop-blur-md w-max'
        role='radiogroup'
        aria-label='Размер'
      >
        {options.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              type='button'
              role='radio'
              aria-checked={isActive}
              onClick={() => onSelect(opt.id)}
              className={`min-w-28 px-5 py-2 rounded-full text-center transition-colors duration-200 ${
                isActive
                  ? 'bg-white/30 shadow-sm'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              <div className='text-sm leading-tight'>{opt.label}</div>
              {opt.sub && (
                <div className='text-sm leading-tight opacity-80 mt-1'>
                  {opt.sub}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
