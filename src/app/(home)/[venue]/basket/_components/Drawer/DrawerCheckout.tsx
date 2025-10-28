import { FC, useEffect, useState, useRef } from 'react';
import { useBasketTotals } from '@/lib/hooks/use-basket-totals';
import TakeOut from './TakeOut';

import elqr from '@/assets/Basket/Drawer/elqr.svg';
import Image from 'next/image';
import { useCheckout } from '@/store/checkout';

interface IProps {
  sheetOpen: boolean;
  closeSheet: () => void;
}

const DrawerCheckout: FC<IProps> = ({ sheetOpen, closeSheet }) => {
  const [sheetAnim, setSheetAnim] = useState(false);

  // Resizable bottom sheet state (in vh)
  const [heightPct, setHeightPct] = useState(70);
  const minPct = 30;
  const maxPct = 92;

  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(70);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const { total } = useBasketTotals();
  const phone = useCheckout((s) => s.phone);
  const setPhone = useCheckout((s) => s.setPhone);

  useEffect(() => {
    if (sheetOpen) {
      const id = requestAnimationFrame(() => setSheetAnim(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSheetAnim(false);
      setDragging(false);
      setHeightPct(70); // reset to default when hiding
    }
  }, [sheetOpen]);

  // Pointer handlers for drag-to-resize
  const onPointerMove = (e: PointerEvent) => {
    // prevent page scroll on mobile while dragging
    if (e.cancelable) e.preventDefault();
    const deltaY = startYRef.current - e.clientY; // up is positive
    const deltaPct = (deltaY / window.innerHeight) * 100;
    const next = clamp(startHeightRef.current + deltaPct, 12, maxPct);
    setHeightPct(next);
  };

  const onPointerUp = (_e: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMove as any);
    window.removeEventListener('pointerup', onPointerUp as any);
    setDragging(false);
    if (heightPct <= minPct) {
      // close if dragged far down
      closeSheet();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Primary pointer only; block native scroll
    // @ts-ignore
    if (typeof e.isPrimary !== 'undefined' && e.isPrimary === false) return;
    e.preventDefault();
    setDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = heightPct;
    // Use window listeners to avoid losing events outside handle
    window.addEventListener('pointermove', onPointerMove as any, {
      passive: false,
    });
    window.addEventListener('pointerup', onPointerUp as any, { passive: true });
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      className={`fixed inset-0 z-50 ${
        sheetOpen || sheetAnim ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          sheetAnim ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeSheet}
      />
      {/* Sheet */}
      <div
        className='absolute inset-x-0 bottom-0'
        aria-label='Checkout bottom sheet'
      >
        <div
          className={`w-full bg-[#F5F5F5] rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out ${
            sheetAnim
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          } ${dragging ? 'cursor-grabbing' : ''}`}
          data-total={total}
          style={{ height: `${heightPct}vh` }}
        >
          <div
            className={`fixed -top-8 right-0 left-0 mx-auto h-8 w-full flex items-center justify-center ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            } select-none`}
            onPointerDown={onPointerDown}
            style={{ touchAction: 'none' }}
          >
            <div className='h-1 w-16 rounded-full bg-[#fff]' />
          </div>
          <div className='h-[calc(100%)] overflow-y-auto flex flex-col justify-between'>
            <div>
              <div className='rounded-2xl bg-white p-5'>
                <TakeOut />
                <label
                  htmlFor='phoneNumber'
                  className='bg-[#F5F5F5] flex flex-col rounded-lg mt-2 py-2 px-4'
                >
                  <span className='text-[#A4A4A4] text-[8px]'>
                    Номер телефона
                  </span>
                  <input
                    id='phoneNumber'
                    type='text'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='bg-transparent'
                  />
                </label>
                <div className='text-[#FF8128] text-[12px] font-medium mt-2'>
                  +добавить комментарий к заказу
                </div>
              </div>
              <div className='rounded-2xl bg-white p-5 flex items-center justify-between mt-1'>
                <div className='flex items-center'>
                  <Image src={elqr} alt='elqr' />
                  <span className='text-[14px] font-medium'>ELQR</span>
                </div>
                <span className='text-[14px] font-medium'>
                  Оплата доступна любым банком КР
                </span>
              </div>
            </div>
            <div>
              <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'>
                <div className='total-price'>
                  <div className='font-semibold text-xl'>
                    {Math.round(total * 100) / 100} с
                  </div>
                  <div className='text-[#939393] text-xs'>Итого</div>
                </div>
                <button
                  className='bg-[#FF8127] py-4 text-white rounded-3xl flex-1 font-medium'
                  onClick={() => {}}
                >
                  Оплатить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawerCheckout;
