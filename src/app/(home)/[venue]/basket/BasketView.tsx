'use client';

import { useState, useEffect } from 'react';

import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';
import { useCheckout } from '@/store/checkout';

import { Details, Header, Items, OrderType } from './_components';
import DrawerCheckout from './_components/Drawer/DrawerCheckout';

export default function BasketView() {
  const { getItemsArray } = useBasket();
  const items = getItemsArray();
  const { sheetOpen, closeSheet } = useCheckout();

  // Close on Escape
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen, closeSheet]);

  // UI state (local only, no requests)
  const [orderType, setOrderType] = useState<'takeout' | 'dinein' | 'delivery'>(
    'takeout'
  );
  const setCheckoutOrderType = useCheckout((s) => s.setOrderType);
  useEffect(() => {
    setCheckoutOrderType(orderType);
  }, [orderType, setCheckoutOrderType]);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Inputs synced with checkout store
  const setPhone = useCheckout((s) => s.setPhone);
  const setAddress = useCheckout((s) => s.setAddress);

  // Prefill from localStorage on hydrate; address only for delivery
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const p = localStorage.getItem('phone');
      if (p && p.trim()) setPhone(p);
      const a = localStorage.getItem('address');
      if (orderType === 'delivery' && a && a.trim()) {
        setAddress(a);
      } else {
        // ensure we don't keep address for non-delivery
        localStorage.removeItem('address');
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // When switching away from delivery, clear address in store and storage
  useEffect(() => {
    if (orderType !== 'delivery') {
      setAddress('');
      try {
        localStorage.removeItem('address');
      } catch {}
    }
  }, [orderType, setAddress]);

  // Venue/table context and order mutation
  const { tableId } = useVenueQuery();

  // Force dine-in when table is assigned; switching is locked in UI
  useEffect(() => {
    if (tableId) setOrderType('dinein');
  }, [tableId]);

  const [modal, setModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-[100svh] pb-20'>
      {/* Local header */}
      <Header />

      <section
        className={`font-inter bg-white pt-4 mt-1.5 px-2 rounded-4xl lg:max-w-[1140px] lg:mx-auto ${
          items.length > 4 ? 'pb-28' : 'pb-5'
        }`}
      >
        {/* Тип заказа */}
        {!tableId && (
          <OrderType
            orderType={orderType}
            setOrderType={setOrderType}
            locked={!!tableId}
          />
        )}

        {/* Список товаров из корзины */}
        <Items />

        {/* Итого с деталями (раскрытие по нажатию) */}
        {hydrated && items.length > 0 && <Details orderType={orderType} />}

        {/* Контакты */}
        {/* <Contacts
          setPhone={setPhone}
          setAddress={setAddress}
          orderType={orderType}
          phone={phone}
          address={address}
        /> */}
      </section>

      {modal.open && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
        >
          <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-xl'>
            <div className='text-base text-[#111111]'>{modal.message}</div>
            <div className='mt-4 flex justify-end'>
              <button
                type='button'
                onClick={() => setModal({ open: false, message: '' })}
                className='h-10 px-4 rounded-[10px] text-white font-semibold bg-brand'
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}

      <DrawerCheckout sheetOpen={sheetOpen} closeSheet={closeSheet} />
    </main>
  );
}
