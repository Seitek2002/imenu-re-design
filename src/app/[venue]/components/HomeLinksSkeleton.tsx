import ImageSkeleton from '@/components/ui/ImageSkeleton';

export default function HomeLinksSkeleton() {
  return (
    <div className='home-links bg-white mt-2 rounded-4xl p-4 shadow-sm'>
      <div className='grid grid-cols-2 gap-3 mb-3'>
        {[1, 2].map((i) => (
          <div key={i} className='text-center'>
            <div className='aspect-square rounded-2xl overflow-hidden'>
              <ImageSkeleton />
            </div>
            <div className='mt-2 h-4 bg-gray-100 rounded w-2/3 mx-auto' />
          </div>
        ))}
      </div>
      <div className='grid grid-cols-3 gap-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='text-center'>
            <div className='aspect-square rounded-2xl overflow-hidden'>
              <ImageSkeleton />
            </div>
            <div className='mt-2 h-3 bg-gray-100 rounded w-full mx-auto' />
          </div>
        ))}
      </div>
    </div>
  );
}
