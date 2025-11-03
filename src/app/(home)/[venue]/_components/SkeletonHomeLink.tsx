'use client';

import ImenuSquareSkeleton from '@/components/ui/ImenuSquareSkeleton';

export default function SkeletonHomeLink() {
  return (
    <div className="text-center relative">
      <div className="relative aspect-[368/286] w-full h-38 rounded-2xl overflow-hidden">
        <ImenuSquareSkeleton className="absolute inset-0 w-full h-full" roundedClassName="rounded-2xl" />
      </div>
      <div className="mt-2">
        <svg className="mx-auto" width="140" height="16" role="img" aria-label="Загрузка...">
          <defs>
            <linearGradient id="home-link-skeleton-text">
              <stop offset="0%" stopColor="#f0f0f0">
                <animate attributeName="offset" values="-2; 1" dur="1.4s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#e6e6e6">
                <animate attributeName="offset" values="-1; 2" dur="1.4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#f0f0f0">
                <animate attributeName="offset" values="0; 3" dur="1.4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="140" height="16" rx="8" fill="url(#home-link-skeleton-text)" />
        </svg>
      </div>
    </div>
  );
}
