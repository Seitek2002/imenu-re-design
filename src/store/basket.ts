import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Product } from '@/lib/api/types';

export type CartItem = {
  key: string; // productId,modifierId
  productId: number;
  modifierId?: number | null;
  name: string;
  modifierName?: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type BasketState = {
  items: Record<string, CartItem>;
  // derived
  getItemsArray: () => CartItem[];
  getQuantity: (productId: number, modifierId?: number | null) => number;
  getSubtotal: () => number;

  // actions
  add: (product: Product, options?: { modifierId?: number | null; modifierName?: string; priceOverride?: number; quantity?: number; image?: string }) => void;
  increment: (productId: number, modifierId?: number | null, qty?: number) => void;
  decrement: (productId: number, modifierId?: number | null, qty?: number) => void;
  remove: (productId: number, modifierId?: number | null) => void;
  clear: () => void;
};

export const buildKey = (productId: number, modifierId?: number | null) =>
  `${productId},${modifierId ?? 0}`;

const parseNumber = (v: unknown, fallback = 0): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export const useBasket = create<BasketState>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: {},

        getItemsArray: () => Object.values(get().items),

        getQuantity: (productId, modifierId) => {
          const key = buildKey(productId, modifierId);
          return get().items[key]?.quantity ?? 0;
        },

        getSubtotal: () => {
          return Object.values(get().items).reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
        },

        add: (product, options) => {
          const modifierId = options?.modifierId ?? null;
          const key = buildKey(product.id, modifierId);
          const modifierName = options?.modifierName;

          // try to resolve price
          let unitPrice =
            options?.priceOverride ??
            (() => {
              const mods = product?.modificators as
                | Array<{ id: number; name?: string; price?: number | string }>
                | undefined;
              if (modifierId && Array.isArray(mods)) {
                const m = mods.find((x) => x.id === modifierId);
                if (m && m.price != null) return parseNumber(m.price, 0);
              }
              return parseNumber(product.productPrice, 0);
            })();

          const image =
            options?.image ??
            product.productPhotoSmall ??
            product.productPhoto ??
            product.productPhotoLarge ??
            undefined;

          const name = product.productName ?? 'Товар';
          const qty = Math.max(1, options?.quantity ?? 1);

          set((state) => {
            const prev = state.items[key];
            if (prev) {
              prev.quantity += qty;
            } else {
              state.items[key] = {
                key,
                productId: product.id,
                modifierId,
                name,
                modifierName,
                unitPrice,
                quantity: qty,
                image,
              };
            }
          });
        },

        increment: (productId, modifierId, qty = 1) => {
          const key = buildKey(productId, modifierId);
          set((state) => {
            const item = state.items[key];
            if (!item) return;
            item.quantity += Math.max(1, qty);
          });
        },

        decrement: (productId, modifierId, qty = 1) => {
          const key = buildKey(productId, modifierId);
          set((state) => {
            const item = state.items[key];
            if (!item) return;
            item.quantity -= Math.max(1, qty);
            if (item.quantity <= 0) {
              delete state.items[key];
            }
          });
        },

        remove: (productId, modifierId) => {
          const key = buildKey(productId, modifierId);
          set((state) => {
            delete state.items[key];
          });
        },

        clear: () => {
          set((state) => {
            state.items = {};
          });
        },
      })),
      {
        name: 'imenu-basket',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        partialize: (s) => ({ items: s.items }),
      }
    ),
    { name: 'imenu-basket' }
  )
);
