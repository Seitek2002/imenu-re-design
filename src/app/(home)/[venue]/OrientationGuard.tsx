'use client';

import React from 'react';

/**
 * Blocks interaction on mobile devices when in landscape orientation
 * by showing a full-screen overlay asking to rotate the device.
 *
 * Rules:
 * - Consider "mobile" as max-width: 1024px (pointer: coarse can be unreliable across devices)
 * - Detect orientation via matchMedia('(orientation: portrait)')
 * - Fallback to resize/orientationchange listeners
 * - Attempt screen.orientation.lock('portrait') when available (best-effort, ignore errors)
 */
export default function OrientationGuard() {
  const [mounted, setMounted] = React.useState(false);
  const [landscapeMobile, setLandscapeMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const mqPortrait = window.matchMedia('(orientation: portrait)');
    const mqPhone = window.matchMedia('(max-width: 1024px)');

    const update = () => {
      // mobile + not portrait => block
      setLandscapeMobile(mqPhone.matches && !mqPortrait.matches);
    };

    // Initial
    update();

    // Listeners (modern)
    const onPortraitChange = () => update();
    const onMobileChange = () => update();
    mqPortrait.addEventListener?.('change', onPortraitChange);
    mqPhone.addEventListener?.('change', onMobileChange);

    // Fallbacks
    const onResize = () => update();
    const onOrientation = () => update();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientation);

    // Best-effort orientation lock on supported environments
    try {
      // @ts-ignore
      if (screen?.orientation?.lock) {
        // @ts-ignore
        screen.orientation.lock('portrait').catch(() => {});
      }
    } catch {}

    return () => {
      mqPortrait.removeEventListener?.('change', onPortraitChange);
      mqPhone.removeEventListener?.('change', onMobileChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
    };
  }, []);

  if (!mounted || !landscapeMobile) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Поверните устройство"
      className="fixed inset-0 z-[2000] bg-white/98 backdrop-blur-sm flex items-center justify-center p-8 text-center select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="max-w-xs">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl border-2 border-brand flex items-center justify-center text-brand">
          {/* Simple rotate icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 0 1-7.45 4.39"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Поверните устройство</h2>
        <p className="text-sm text-[#6B7280]">
          Пожалуйста, используйте портретную ориентацию для продолжения
        </p>
      </div>
    </div>
  );
}
