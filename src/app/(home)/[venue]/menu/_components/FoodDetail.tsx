'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import plusIcon from '@/assets/Goods/plus.svg';
import minusIcon from '@/assets/Goods/minus.svg';
import type { Product } from '@/lib/api/types';
import { useBasket } from '@/store/basket';

type Props = {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
};

export default function FoodDetail({ open, product, onClose }: Props) {
  const startY = useRef<number | null>(null);

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches?.[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const endY = e.changedTouches?.[0]?.clientY ?? 0;
    const delta = endY - startY.current;
    if (delta > 100) onClose();
    startY.current = null;
  };

  const { add } = useBasket();

  const sizes = product?.modificators ?? [];
  const hasSizes = sizes.length > 0;

  const [selectedId, setSelectedId] = useState<number | null>(
    sizes[0]?.id ?? null
  );
  const [qnty, setQnty] = useState(1);

  useEffect(() => {
    const firstId = product?.modificators?.[0]?.id ?? null;
    setSelectedId((firstId ?? null) as number | null);
    setQnty(1);
  }, [product]);

  return (
    <>
      <div
        className={`fixed inset-0 w-full z-10 transition-all duration-500 ${
          open
            ? 'h-full bg-[rgba(0,0,0,0.5)]'
            : 'h-0 bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 z-[100] overflow-y-auto bg-white rounded-t-[24px] md:rounded-[10px] w-full h-[calc(100%-14px)] transition-all duration-500
          ${open ? 'top-[14px]' : 'top-[100%]'}
          md:w-[75%] md:h-[75%] md:left-1/2 md:top-1/2 md:-translate-x-1/2 ${
            open ? 'md:-translate-y-1/2' : 'md:translate-y-[100%]'
          }`}
        role='dialog'
        aria-modal='true'
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Close button (no logic beyond onClose) */}
        <button
          type='button'
          aria-label='close'
          className='absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center text-[20px] leading-none bg-white shadow-sm border border-gray-200'
          onClick={onClose}
        >
          ×
        </button>

        <div className='md:flex items-start md:pt-[30px] md:px-[16px]'>
          <div className='rounded-t-[24px] overflow-hidden flex items-center justify-center relative md:rounded-[24px] md:max-w-[40%] md:flex-1 md:h-auto md:sticky top-0 w-full'>
            <div className='w-full'>
              <div className='relative w-full aspect-[3/2] rounded-2xl overflow-hidden'>
                {!imgLoaded && (
                  <div className='absolute inset-0 bg-gray-200 animate-pulse' />
                )}
                <Image
                  src={product?.productPhotoLarge || '/placeholder-dish.svg'}
                  alt={product?.productName || 'product'}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 50vw'
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-4 flex flex-col gap-6 md:max-w-[60%] w-full'>
            {/* Description */}
            <div className='flex flex-col gap-2'>
              <h2 className='text-[16px] font-semibold'>
                {product?.productName || 'Название блюда'}
              </h2>
              {product?.productDescription ? (
                <p className='text-[14px] text-[#181818]/80'>
                  {product.productDescription}
                </p>
              ) : (
                <p className='text-[14px] text-[#181818]/60'>
                  Описание отсутствует.
                </p>
              )}
            </div>

            {/* Sizes (optional; static UI only) */}
            {hasSizes && (
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-[16px] font-semibold'>Размер</h2>
                  <div className='text-[12px] text-[#0D6EFD]'>Обязательно</div>
                </div>

                <div className='grid grid-cols-3 gap-2 text-center'>
                  {sizes.map((s, i) => {
                    const isActive = (s.id ?? i) === selectedId;
                    return (
                      <button
                        type='button'
                        key={`${s.id ?? i}`}
                        onClick={() =>
                          setSelectedId((s.id ?? null) as number | null)
                        }
                        className={`p-3 rounded-[8px] mt-2 transition-colors ${
                          isActive
                            ? 'bg-white border border-[#0D6EFD]'
                            : 'bg-[#F1F2F3]'
                        }`}
                      >
                        <span className='block text-[14px]'>
                          {s.name ?? 'Опция'}
                        </span>
                        <div className='text-[14px]'>
                          {s.price != null ? `${s.price} c` : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

// Footer: counter + add (показываем всегда, даже без модификаторов)
              <footer className='grid grid-cols-2 items-center gap-3 pt-8 pb-10 sticky bottom-0 md:static bg-white'>
                <div className='flex items-center justify-between gap-8 px-2 py-4 rounded-[12px] font-semibold bg-[#F1F2F3]'>
                  <button
                    type='button'
                    aria-label='minus'
                    onClick={() => setQnty((v) => Math.max(1, v - 1))}
                  >
                    <Image src={minusIcon} alt='minus' width={24} height={24} />
                  </button>
                  <span className='text-[16px]'>{qnty}</span>
                  <button
                    type='button'
                    aria-label='plus'
                    onClick={() => setQnty((v) => v + 1)}
                  >
                    <Image src={plusIcon} alt='plus' width={24} height={24} />
                  </button>
                </div>
                <div className='rounded-[12px]'>
                  <button
                    type='button'
                    className='w-full font-semibold py-4 rounded-[12px] text-white bg-brand'
                    onClick={() => {
                      const modId = selectedId ?? null;
                      const modName =
                        sizes.find((m) => m.id === selectedId)?.name ??
                        undefined;
                      if (product) {
                        add(product, {
                          modifierId: modId,
                          modifierName: modName,
                          quantity: qnty,
                        });
                      }
                      onClose();
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </footer>
          </div>
        </div>
      </div>
    </>
  );
}
