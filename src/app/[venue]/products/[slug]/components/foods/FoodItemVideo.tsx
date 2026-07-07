'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  poster?: string;
}

type ConnectionInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: ConnectionInfo;
};

/**
 * Короткое видео-превью товара в карточке каталога. Играет только пока
 * карточка видна во вьюпорте — вне видимости видео на паузе, чтобы на
 * странице категории не декодировались одновременно десятки скрытых видео.
 * Уважает prefers-reduced-motion / Data Saver / 2G, как VideoBackground в
 * полноэкранной витрине.
 */
export default function FoodItemVideo({ src, poster }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!isVisible) {
      v.pause();
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const conn = (navigator as NavigatorWithConnection).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return;
    v.play().catch(() => {});
  }, [isVisible]);

  return (
    <div ref={containerRef} className='absolute inset-0 rounded-2xl overflow-hidden'>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload='none'
        disablePictureInPicture
        disableRemotePlayback
        className='w-full h-full object-cover'
      />
    </div>
  );
}
