'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import { Product } from '@/types/api';
import { useProductStore } from '@/store/product';
import { useBasketStore } from '@/store/basket';
import { useMounted } from '@/hooks/useMounted';

import plusIcon from '@/assets/Goods/plus.svg';
import minusIcon from '@/assets/Goods/minus.svg';

// --- MOCK API ---
const fetchProductById = async (id: string): Promise<Product> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: Number(id),
    productName: `Загружено с сервера #${id}`,
    productDescription:
      'Данные загрузились автоматически, без лишних ре-рендеров.',
    productPrice: 450,
    productPhoto: '/placeholder-dish.svg',
    weight: 400,
    measureUnit: 'г',
    modificators: [
      { id: 1, name: 'Маленький', price: 450 },
      { id: 2, name: 'Большой', price: 650 },
    ],
    categories: [],
  };
};

// --- ВНУТРЕННИЙ КОМПОНЕНТ ---
const ProductContent = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const [qnty, setQnty] = useState(1);
  const [selectedModId, setSelectedModId] = useState<number | null>(
    product.modificators && product.modificators.length > 0
      ? product.modificators[0].id
      : null,
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  const addToBasket = useBasketStore((state) => state.addToBasket);

  const currentPrice = useMemo(() => {
    if (
      selectedModId &&
      product.modificators &&
      product.modificators.length > 0
    ) {
      const mod = product.modificators.find((m) => m.id === selectedModId);
      return mod ? mod.price : product.productPrice;
    }
    return product.productPrice;
  }, [product, selectedModId]);

  const totalPrice = currentPrice * qnty;

  const handleAdd = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    addToBasket(product, qnty, selectedModId ?? undefined);
    onClose();
  };

  return (
    <>
      <div className='flex-1 overflow-y-auto overscroll-contain pb-20 md:pb-0'>
        <div className='md:flex items-start md:p-6'>
          <div className='relative w-full aspect-4/3 md:w-1/2 md:rounded-2xl overflow-hidden shrink-0'>
            <Image
              src={product.productPhoto || '/placeholder-dish.svg'}
              alt={product.productName}
              fill
              className={`object-cover transition-opacity duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes='(max-width: 768px) 100vw, 500px'
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          <div className='p-5 md:py-0 md:px-6 flex flex-col gap-5 w-full'>
            <div>
              <h2 className='text-2xl font-bold leading-tight mb-2'>
                {product.productName}
              </h2>
              <p className='text-gray-500 text-sm leading-relaxed'>
                {product.productDescription}
              </p>
              {product.measureUnit && (
                <p className='text-xs text-gray-400 mt-1'>
                  Вес: {product.weight} {product.measureUnit}
                </p>
              )}
            </div>

            {product.modificators && product.modificators.length > 0 && (
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-semibold'>Размер</span>
                  <span className='text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full'>
                    Обязательно
                  </span>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  {product.modificators.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModId(mod.id)}
                      className={`
                        p-2.5 rounded-xl border text-sm transition-all
                        ${
                          selectedModId === mod.id
                            ? 'border-[#21201F] bg-[#21201F] text-white shadow-md'
                            : 'border-gray-100 bg-gray-50 text-gray-700'
                        }
                      `}
                    >
                      <div className='font-medium'>{mod.name}</div>
                      <div
                        className={`text-xs ${
                          selectedModId === mod.id
                            ? 'text-gray-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {mod.price} с.
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='p-4 border-t border-gray-100 bg-white md:bg-transparent md:border-none'>
        <div className='flex gap-3'>
          <div className='flex items-center gap-4 bg-[#F5F5F5] rounded-2xl px-4 py-3 h-14'>
            <button
              onClick={() => setQnty((q) => Math.max(1, q - 1))}
              className='active:scale-90 transition-transform'
            >
              <Image src={minusIcon} alt='minus' />
            </button>
            <span className='font-bold text-lg w-4 text-center'>{qnty}</span>
            <button
              onClick={() => setQnty((q) => q + 1)}
              className='active:scale-90 transition-transform'
            >
              <Image src={plusIcon} alt='plus' />
            </button>
          </div>

          <button
            className='flex-1 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2'
            onClick={handleAdd}
          >
            <span>Добавить</span>
            <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
              {totalPrice} с.
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function ProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 🔥 ССЫЛКА-БЛОКИРАТОР. Поможет избежать гонки состояний при закрытии
  const closingRef = useRef(false);

  const productId = searchParams.get('product');

  const productFromStore = useProductStore((state) => state.selectedProduct);
  const setProductInStore = useProductStore((state) => state.setProduct);

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);

  const isOpen = !!productFromStore || !!productId;

  const activeProduct =
    productFromStore ||
    (fetchedProduct && fetchedProduct.id.toString() === productId
      ? fetchedProduct
      : null);

  const handleClose = useCallback(() => {
    // 1. Говорим useEffect'у: "Мы закрываемся, ничего не скачивай!"
    closingRef.current = true;

    // 2. Очищаем стор и локальный стейт скачанного товара
    setProductInStore(null);
    setFetchedProduct(null);

    // 3. Тихо убираем ID из URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);

    // 4. Снимаем блокировку через 100мс (этого достаточно, чтобы Next.js обновил URL)
    setTimeout(() => {
      closingRef.current = false;
    }, 100);
  }, [searchParams, pathname, setProductInStore]);

  useEffect(() => {
    if (!productId) return;
    if (closingRef.current) return; // 🔥 БЛОКИРУЕМ ЛИШНИЙ ЗАПРОС ПРИ ЗАКРЫТИИ
    if (activeProduct) return;

    fetchProductById(productId)
      .then((data) => {
        setFetchedProduct(data);
        setProductInStore(data);
      })
      .catch((err) => console.error(err));
  }, [productId, activeProduct, setProductInStore]);

  useEffect(() => {
    if (!mounted) return;
    const bodyStyle = document.body.style;

    if (isOpen) {
      bodyStyle.overflow = 'hidden';
      bodyStyle.touchAction = 'none';
    } else {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    }

    return () => {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    };
  }, [isOpen, mounted]);

  const startY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.currentTarget.scrollTop === 0) {
      startY.current = e.touches?.[0]?.clientY ?? null;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const endY = e.changedTouches?.[0]?.clientY ?? 0;
    const delta = endY - startY.current;
    if (delta > 100) handleClose();
    startY.current = null;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex justify-center items-end md:items-center pointer-events-none ${isOpen ? 'active-modal' : ''}`}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
{/* Aw~VsLF1F~cjl|5 */}
      <div
        className={`
          relative w-full md:w-[75%] md:max-w-2xl bg-white 
          rounded-t-4xl md:rounded-4xl 
          h-[70vh] md:h-auto md:max-h-[85vh]
          shadow-2xl overflow-hidden flex flex-col
          transition-transform duration-300 cubic-bezier(0.32, 0.72, 0, 1) pointer-events-auto
          ${
            isOpen
              ? 'translate-y-0'
              : 'translate-y-full md:translate-y-5 md:opacity-0'
          }
        `}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className='w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 cursor-grab active:cursor-grabbing'
          onClick={handleClose}
        >
          <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
        </div>

        <button
          type='button'
          className='flex absolute leading-0 top-4 right-4 z-10 h-8 w-8 rounded-full items-center justify-center text-xl bg-white shadow-sm border border-gray-200 hover:bg-gray-50'
          onClick={handleClose}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {!activeProduct ? (
          <div className=''></div>
        ) : (
          <ProductContent
            key={activeProduct.id}
            product={activeProduct}
            onClose={handleClose}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
