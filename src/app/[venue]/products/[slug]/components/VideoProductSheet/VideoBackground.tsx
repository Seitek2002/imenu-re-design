'use client';

import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  poster: string;
}

type ConnectionInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: ConnectionInfo;
};

/**
 * Фоновое видео: muted + loop + playsInline, autoplay через JS.
 *
 * Уважает `prefers-reduced-motion`, Data Saver и slow-2g/2g — в этих случаях
 * остаётся показ постера. У постера те же object-cover-пропорции, поэтому
 * fallback визуально не отличается от первого кадра видео.
 */
export default function VideoBackground({ src, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Уважаем accessibility / экономию трафика — если видео нельзя показывать,
    // оставляем постер.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const conn = (navigator as NavigatorWithConnection).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
      return;
    }

    // Попытка автоплея. Muted video может играть без жеста пользователя, но
    // iOS Low Power Mode всё равно может заблокировать — тогда виден постер.
    v.play().catch(() => {});

    return () => {
      v.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload='auto'
      // disablePictureInPicture, чтобы iOS не показывал PiP-кнопку поверх видео
      disablePictureInPicture
      className='absolute inset-0 w-full h-full object-cover'
      aria-hidden='true'
    />
  );
}
