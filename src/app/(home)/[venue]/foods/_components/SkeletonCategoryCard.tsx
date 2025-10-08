'use client';

export default function SkeletonCategoryCard() {
  return (
    <div className="w-full">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F3F3F3]">
        <svg className="absolute inset-0 w-full h-full" role="img" aria-label="Загрузка...">
          <defs>
            <linearGradient id="skeleton-gradient">
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
          <rect x="0" y="0" width="100%" height="100%" fill="url(#skeleton-gradient)" rx="16" />
        </svg>
      </div>
    </div>
  );
}
