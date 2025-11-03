import React from 'react';

type Props = {
  // Pixel size of the square. If not provided, it stretches to parent width via className.
  size?: number;
  // Extra classes to control layout (e.g., w-full). Height will follow aspect-square.
  className?: string;
  // Border radius utility (Tailwind). Defaults to rounded-2xl.
  roundedClassName?: string;
};

/**
 * ImenuSquareSkeleton
 * A reusable square skeleton loader with the iMenu logo centered.
 * - Uses a subtle shimmer background
 * - Accepts optional size and className for flexible placement
 *
 * Example:
 * <ImenuSquareSkeleton size={160} />
 * <ImenuSquareSkeleton className="w-full" />
 */
export default function ImenuSquareSkeleton({
  size,
  className = '',
  roundedClassName = 'rounded-2xl',
}: Props) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative overflow-hidden bg-[#F3F3F3] ${roundedClassName} ${
        size ? '' : 'aspect-square'
      } ${className || ''}`}
      style={style}
      aria-label="Загрузка..."
      role="img"
    >
      {/* Shimmer layer */}
      <div className="absolute inset-0 -translate-x-full shimmer-layer" />

      {/* Centered iMenu logo (grayscale) + caption */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          {/* Circle in gray instead of brand red */}
          <rect width="32" height="32" rx="16" fill="#E5E7EB" />
          {/* Inner shapes in darker gray */}
          <path
            d="M21.4976 18.7638C21.4976 17.2393 20.9184 15.7773 19.8874 14.6993C18.8564 13.6214 17.458 13.0158 16 13.0158C14.5419 13.0158 13.1436 13.6214 12.1125 14.6993C11.0815 15.7773 10.5023 17.2393 10.5023 18.7638L21.4976 18.7638Z"
            fill="#9CA3AF"
          />
          <path d="M9.49805 19.1133H22.5021V20.8635H9.49805V19.1133Z" fill="#9CA3AF" />
          <path
            d="M16.8561 11.9399C16.8561 12.3836 16.4711 12.7433 15.9963 12.7433C15.5215 12.7433 15.1365 12.3836 15.1365 11.9399C15.1365 11.4962 15.5215 11.1365 15.9963 11.1365C16.4711 11.1365 16.8561 11.4962 16.8561 11.9399Z"
            fill="#9CA3AF"
          />
        </svg>
        <span className="text-sm font-medium text-[#9CA3AF]" aria-hidden="true">
          iMenu.kg
        </span>
      </div>

      {/* Local CSS for shimmer */}
      <style jsx>{`
        .shimmer-layer {
          background-image: linear-gradient(
            90deg,
            rgba(243, 243, 243, 0) 0%,
            rgba(230, 230, 230, 0.9) 50%,
            rgba(243, 243, 243, 0) 100%
          );
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
