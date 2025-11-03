'use client';

import ImenuSquareSkeleton from '@/components/ui/ImenuSquareSkeleton';

export default function SkeletonCategoryCard() {
  return (
    <div className="w-full">
      <div className="content-item h-28 rounded-2xl bg-[#F6F6F6] overflow-hidden relative flex justify-center items-end">
        <ImenuSquareSkeleton className="absolute inset-0 w-full h-full" roundedClassName="rounded-2xl" />
      </div>
    </div>
  );
}
