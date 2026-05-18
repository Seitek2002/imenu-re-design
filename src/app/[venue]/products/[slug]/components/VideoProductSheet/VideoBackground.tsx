'use client';

import { useEffect, useRef, useState } from 'react';

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
 * Фоновое видео с бесшовным переходом постер → видео.
 *
 * Постер рендерится отдельным <img>, чтобы перекрывать видео пока оно грузится.
 * Когда видео готово к воспроизведению (canplay), постер плавно исчезает.
 * Это убирает артефакт «мигания» нативного poster-атрибута.
 */
export default function VideoBackground({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    setVideoReady(false);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const conn = (navigator as NavigatorWithConnection).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return;

    v.play().catch(() => {});
    return () => {
      v.pause();
    };
  }, [src]);

  return (
    <div className='absolute inset-0'>
      {/* Видео: начинает прозрачным, появляется когда готово */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload='auto'
        disablePictureInPicture
        aria-hidden='true'
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Постер: перекрывает видео, плавно исчезает когда видео готово */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=''
          aria-hidden='true'
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
            videoReady ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
}
