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
import { useSearchParams, usePathname, useParams } from 'next/navigation';

import {
  GroupModification,
  Modificator,
  Product,
} from '@/types/api';
import { useProductStore } from '@/store/product';
import {
  useBasketStore,
  BasketGroupSelection,
} from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import { useMounted } from '@/hooks/useMounted';
import { useVenueProducts } from '@/lib/api/queries';

import plusIcon from '@/assets/Goods/plus.svg';
import minusIcon from '@/assets/Goods/minus.svg';

type CountsState = Record<number, number>;

function sumGroupCount(group: GroupModification, counts: CountsState): number {
  return group.items.reduce((s, i) => s + (counts[i.id] ?? 0), 0);
}

function buildGroupSelections(
  product: Product,
  counts: CountsState,
): BasketGroupSelection[] {
  const groups = product.groupModifications ?? [];
  return groups
    .map((g) => ({
      groupId: g.id,
      groupName: g.name,
      items: g.items
        .filter((i) => (counts[i.id] ?? 0) > 0)
        .map((i) => ({
          id: i.id,
          name: i.name,
          count: counts[i.id],
          price: i.price,
        })),
    }))
    .filter((g) => g.items.length > 0);
}

const GroupSection = ({
  group,
  counts,
  onChange,
  error,
}: {
  group: GroupModification;
  counts: CountsState;
  onChange: (next: CountsState) => void;
  error: string | null;
}) => {
  const { type, min, max } = group.selection;
  const sum = sumGroupCount(group, counts);

  const badge =
    min === max
      ? `Ровно ${min}`
      : min > 0
        ? `Обязательно • до ${max}`
        : `До ${max}`;

  const handleSingle = (itemId: number) => {
    const current = counts[itemId] ?? 0;
    const next: CountsState = { ...counts };
    for (const it of group.items) next[it.id] = 0;
    // При min=0 повторный тап снимает выбор
    if (current > 0 && min === 0) {
      next[itemId] = 0;
    } else {
      next[itemId] = 1;
    }
    onChange(next);
  };

  const handleStep = (itemId: number, delta: number) => {
    const current = counts[itemId] ?? 0;
    const nextVal = Math.max(0, current + delta);
    if (delta > 0 && sum >= max) return; // достигнут max по группе
    onChange({ ...counts, [itemId]: nextVal });
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-2'>
        <div className='flex flex-col'>
          <span className='font-semibold'>{group.name}</span>
          <span className='text-xs text-gray-400'>
            Выбрано {sum}
            {max > 0 ? ` из ${max}` : ''}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            min > 0
              ? 'text-red-500 bg-red-50'
              : 'text-blue-500 bg-blue-50'
          }`}
        >
          {badge}
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {group.items.map((item) => {
          const count = counts[item.id] ?? 0;
          const selected = count > 0;
          const priceNum = Number(item.price);

          if (type === 'single') {
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => handleSingle(item.id)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                  selected
                    ? 'border-[#21201F] bg-[#21201F] text-white'
                    : 'border-gray-100 bg-gray-50 text-gray-800'
                }`}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  {item.thumbnail && (
                    <div className='relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10'>
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        className='object-cover'
                        sizes='40px'
                      />
                    </div>
                  )}
                  <div className='flex flex-col min-w-0'>
                    <span className='font-medium truncate'>{item.name}</span>
                    {Number(item.brutto) > 0 && (
                      <span
                        className={`text-xs ${selected ? 'text-gray-300' : 'text-gray-400'}`}
                      >
                        {Math.round(Number(item.brutto))} г
                      </span>
                    )}
                  </div>
                </div>
                <span className='text-sm font-semibold shrink-0'>
                  {priceNum > 0 ? `+${priceNum} с.` : 'включено'}
                </span>
              </button>
            );
          }

          // multiple
          const canInc = sum < max;
          return (
            <div
              key={item.id}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border ${
                selected
                  ? 'border-[#21201F] bg-gray-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className='flex items-center gap-3 min-w-0'>
                {item.thumbnail && (
                  <div className='relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white'>
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className='object-cover'
                      sizes='40px'
                    />
                  </div>
                )}
                <div className='flex flex-col min-w-0'>
                  <span className='font-medium truncate text-gray-800'>
                    {item.name}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {Number(item.brutto) > 0
                      ? `${Math.round(Number(item.brutto))} г · `
                      : ''}
                    {priceNum > 0 ? `+${priceNum} с.` : 'бесплатно'}
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => handleStep(item.id, -1)}
                  disabled={count === 0}
                  className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30'
                  aria-label='minus'
                >
                  <Image src={minusIcon} alt='' width={14} height={14} />
                </button>
                <span className='w-5 text-center font-semibold text-sm'>
                  {count}
                </span>
                <button
                  type='button'
                  onClick={() => handleStep(item.id, +1)}
                  disabled={!canInc}
                  className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30'
                  aria-label='plus'
                >
                  <Image src={plusIcon} alt='' width={14} height={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className='text-xs text-red-500 mt-2'>{error}</p>
      )}
    </div>
  );
};

const ProductContent = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const addToBasket = useBasketStore((s) => s.addToBasket);

  const groups = useMemo(
    () => product.groupModifications ?? [],
    [product.groupModifications],
  );
  const hasGroups = groups.length > 0;
  // Правило: если есть groupModifications, плоские modificators игнорируем.
  const flatMods: Modificator[] = hasGroups ? [] : product.modificators ?? [];

  const [qnty, setQnty] = useState(1);
  const [counts, setCounts] = useState<CountsState>({});
  const [selectedFlatId, setSelectedFlatId] = useState<number | null>(
    flatMods.length > 0 ? flatMods[0].id : null,
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  const selectedFlat = flatMods.find((m) => m.id === selectedFlatId) ?? null;

  const errors = useMemo(() => {
    const out: Record<number, string> = {};
    for (const g of groups) {
      const sum = sumGroupCount(g, counts);
      if (sum < g.selection.min) {
        out[g.id] =
          g.selection.min === g.selection.max
            ? `Нужно выбрать ${g.selection.min}`
            : `Нужно минимум ${g.selection.min}`;
      } else if (sum > g.selection.max) {
        out[g.id] = `Не более ${g.selection.max}`;
      }
    }
    return out;
  }, [groups, counts]);

  const isValid = Object.keys(errors).length === 0;

  const unitPrice = useMemo(() => {
    const base = selectedFlat?.price ?? product.productPrice;
    const add = groups.reduce(
      (acc, g) =>
        acc +
        g.items.reduce(
          (s, i) => s + Number(i.price) * (counts[i.id] ?? 0),
          0,
        ),
      0,
    );
    return base + add;
  }, [product, selectedFlat, groups, counts]);

  const totalPrice = unitPrice * qnty;

  const handleAdd = () => {
    if (!isValid) return;
    if (navigator.vibrate) navigator.vibrate(50);
    addToBasket(product, qnty, {
      flatModId: selectedFlat?.id,
      flatModName: selectedFlat?.name,
      flatModPrice: selectedFlat?.price,
      groupSelections: buildGroupSelections(product, counts),
    });
    onClose();
  };

  const weightLabel =
    product.weight > 0
      ? `${product.weight} ${product.unitDisplay || product.measureUnit || ''}`.trim()
      : null;

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
              {product.productDescription && (
                <p className='text-gray-500 text-sm leading-relaxed'>
                  {product.productDescription}
                </p>
              )}
              {weightLabel && (
                <p className='text-xs text-gray-400 mt-1'>Вес: {weightLabel}</p>
              )}
            </div>

            {flatMods.length > 0 && (
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-semibold'>Размер</span>
                  <span className='text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full'>
                    Обязательно
                  </span>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  {flatMods.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedFlatId(mod.id)}
                      className={`p-2.5 rounded-xl border text-sm transition-all ${
                        selectedFlatId === mod.id
                          ? 'border-[#21201F] bg-[#21201F] text-white shadow-md'
                          : 'border-gray-100 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className='font-medium'>{mod.name}</div>
                      <div
                        className={`text-xs ${
                          selectedFlatId === mod.id
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

            {groups.map((g) => (
              <GroupSection
                key={g.id}
                group={g}
                counts={counts}
                onChange={setCounts}
                error={errors[g.id] ?? null}
              />
            ))}
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
            disabled={!isValid}
            className='flex-1 bg-brand text-white font-bold rounded-2xl h-14 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100'
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

export default function ProductSheet() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = useParams();
  const venueSlug = (params?.venue as string) || null;
  const spotId = useVenueStore((s) => s.spotId);

  const closingRef = useRef(false);
  const productId = searchParams.get('product');

  const productFromStore = useProductStore((s) => s.selectedProduct);
  const setProductInStore = useProductStore((s) => s.setProduct);

  // Fallback-фетч на случай прямого открытия по ?product=X (reload, шаринг).
  // Грузим только если в сторе ничего нет и ID в URL существует.
  const shouldFallback = !!productId && !productFromStore;
  const { data: allProducts } = useVenueProducts(
    shouldFallback ? venueSlug : null,
    spotId,
  );

  const fallbackProduct = useMemo(() => {
    if (!shouldFallback || !allProducts || !productId) return null;
    return allProducts.find((p) => String(p.id) === productId) ?? null;
  }, [allProducts, productId, shouldFallback]);

  const activeProduct = productFromStore ?? fallbackProduct;

  // Один раз синкаем fallback в стор, чтобы не пересчитывать при ре-рендерах.
  useEffect(() => {
    if (fallbackProduct && !productFromStore && !closingRef.current) {
      setProductInStore(fallbackProduct);
    }
  }, [fallbackProduct, productFromStore, setProductInStore]);

  const isOpen = !!productFromStore || (!!productId && !!fallbackProduct);

  const handleClose = useCallback(() => {
    closingRef.current = true;
    setProductInStore(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);

    setTimeout(() => {
      closingRef.current = false;
    }, 100);
  }, [searchParams, pathname, setProductInStore]);

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

      <div
        className={`
          relative w-full md:w-[75%] md:max-w-2xl bg-white
          rounded-t-4xl md:rounded-4xl
          h-[85vh] md:h-auto md:max-h-[85vh]
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
