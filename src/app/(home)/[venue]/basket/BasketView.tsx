'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { useBasket } from '@/store/basket';
import { useCreateOrderV2 } from '@/lib/api/queries';
import { useVenueQuery } from '@/store/venue';
import type { OrderCreate } from '@/lib/api/types';
import { useCheckout } from '@/store/checkout';

import { Contacts, Details, Header, Items, OrderType } from './_components';
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
  const phone = useCheckout((s) => s.phone);
  const setPhone = useCheckout((s) => s.setPhone);
  const address = useCheckout((s) => s.address);
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
      try { localStorage.removeItem('address'); } catch {}
    }
  }, [orderType, setAddress]);

  // Venue/table context and order mutation
  const { venue, tableId } = useVenueQuery();
  const createOrder = useCreateOrderV2();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  function extractBackendErrorMessage(err: unknown): string {
    const defaultMsg = 'Ошибка при создании заказа';
    try {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as any).message)
          : '';
      const idx = msg.indexOf('- ');
      const raw = idx >= 0 ? msg.slice(idx + 2).trim() : msg.trim();
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.error === 'string') return parsed.error;
        } catch {
          // not JSON
        }
        const m = raw.match(/\{"error"\s*:\s*"([^"]+)"\}/);
        if (m) return m[1];
      }
      return msg || defaultMsg;
    } catch {
      return defaultMsg;
    }
  }

  // venueSlug: prefer localStorage 'venueRoot', fallback to persisted 'venue' store, then route params
  const params = useParams();
  const [venueSlug, setVenueSlug] = useState<string>('');
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fromParams =
      typeof (params as any)?.venue === 'string'
        ? (params as any).venue
        : Array.isArray((params as any)?.venue)
        ? (params as any).venue[0]
        : '';

    const resolveVenueSlug = (): string => {
      try {
        const rawRoot = localStorage.getItem('venueRoot');
        if (rawRoot) {
          let v: string | undefined;
          const trimmed = rawRoot.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            const parsed = JSON.parse(rawRoot);
            v =
              parsed?.slug ??
              parsed?.venueSlug ??
              parsed?.venue_slug ??
              parsed?.venue?.slug ??
              '';
          } else {
            // treat as plain string, possibly like "/ustukan" or "ustukan"
            v = trimmed.split('/').filter(Boolean).pop() ?? trimmed;
          }
          if (typeof v === 'string' && v) return v;
        }
      } catch {}
      try {
        // persisted Zustand store name 'venue' from src/store/venue.ts
        const rawVenue = localStorage.getItem('venue');
        if (rawVenue) {
          const parsed = JSON.parse(rawVenue);
          const st = parsed?.state ?? parsed;
          const v =
            st?.venue?.slug ??
            st?.slug ??
            st?.venueSlug ??
            st?.venue_slug ??
            '';
          if (typeof v === 'string' && v) return v;
        }
      } catch {}
      const fromStore =
        typeof (venue as any)?.slug === 'string' ? (venue as any).slug : '';
      return fromParams || fromStore || '';
    };

    setVenueSlug(resolveVenueSlug());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Map UI order type to API serviceMode
  const serviceMode: 1 | 2 | 3 =
    orderType === 'dinein' ? 1 : orderType === 'delivery' ? 3 : 2;

  // Basic validation for submit enabling
  const isPhoneValid = phone.trim().length >= 5;
  const isAddressValid =
    orderType === 'delivery' ? address.trim().length > 0 : true;
  const canSubmit =
    hydrated &&
    !!venueSlug &&
    items.length > 0 &&
    isPhoneValid &&
    isAddressValid &&
    (orderType !== 'dinein' || !!tableId);

  async function handleSubmit() {
    try {
      setErrorMsg(null);

      if (!venueSlug) {
        setErrorMsg('Не найден venue_slug');
        return;
      }

      // Pre-submit validation per mode:
      // - Always require phone
      // - Additionally require address in "delivery" mode
      const phoneVal = phone.trim();
      if (phoneVal.length < 5) {
        setModal({ open: true, message: 'Укажите номер телефона' });
        return;
      }
      if (orderType === 'delivery' && !address.trim()) {
        setModal({ open: true, message: 'Укажите адрес доставки' });
        return;
      }
      if (orderType === 'dinein' && !tableId) {
        setModal({ open: true, message: 'Не указан номер стола' });
        return;
      }

      // Build items payload
      const orderProducts = items.map((it) => ({
        product: it.productId,
        count: it.quantity,
        modificator: it.modifierId ?? null,
      }));

      // Resolve table and spot
      let tableIdNum: number | null = null;
      if (orderType === 'dinein' && tableId != null) {
        const n =
          typeof tableId === 'string' ? Number.parseInt(tableId, 10) : tableId;
        tableIdNum = Number.isFinite(n as number) ? (n as number) : null;
      }

      const selectedSpotId = useCheckout((s) => s.selectedSpotId);
      const defaultSpotId = (venue as any)?.defaultDeliverySpot ?? null;
      const firstSpotId =
        Array.isArray((venue as any)?.spots) && (venue as any).spots.length > 0
          ? (venue as any).spots[0].id
          : null;
      const spotId = selectedSpotId ?? defaultSpotId ?? firstSpotId ?? null;

      const payload: OrderCreate = {
        phone: phone.trim(),
        serviceMode,
        address: orderType === 'delivery' ? address.trim() : null,
        spot: spotId,
        table: tableIdNum,
        orderProducts,
        isTgBot: false,
        useBonus: false,
      };

      const res = await createOrder.mutateAsync({ body: payload, venueSlug });
      console.log('order:create:success', res);
    } catch (e: any) {
      console.error('order:create:error', e);
      const msg = extractBackendErrorMessage(e);
      setErrorMsg(msg);
      setModal({ open: true, message: msg });
    }
  }

  return (
    <main className='px-2.5 bg-[#F8F6F7] min-h-[100svh] pb-20'>
      {/* Local header */}
      <Header />

      <section className='font-inter bg-white pt-4 mt-1.5 px-2 rounded-4xl lg:max-w-[1140px] lg:mx-auto pb-5'>
        {/* Тип заказа */}
        <OrderType orderType={orderType} setOrderType={setOrderType} />

        {/* Список товаров из корзины */}
        <Items />

        {/* Итого с деталями (раскрытие по нажатию) */}
        <Details orderType={orderType} />

        {/* Контакты */}
        <Contacts
          setPhone={setPhone}
          setAddress={setAddress}
          orderType={orderType}
          phone={phone}
          address={address}
        />
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
                className='h-10 px-4 rounded-[10px] text-white font-semibold'
                style={{ backgroundColor: '#FF7A00' }}
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
