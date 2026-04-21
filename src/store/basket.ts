import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/api';

export interface BasketGroupItemSelection {
  id: number; // GroupItem.id
  name: string;
  count: number;
  price: string; // decimal как пришло с бэка — для отображения
}

export interface BasketGroupSelection {
  groupId: number;
  groupName: string;
  items: BasketGroupItemSelection[];
}

// Легкая сущность корзины: без тяжёлых массивов из Product.
export interface BasketItem
  extends Omit<
    Product,
    'modificators' | 'categories' | 'groupModifications' | 'productType'
  > {
  key: string;
  quantity: number;

  // Выбор плоского модификатора (legacy) — заменяет productPrice абсолютом.
  flatModId?: number;
  flatModName?: string;

  // Выбор групповых модификаций — цены суммируются к базе.
  groupSelections?: BasketGroupSelection[];

  // Цена за одну единицу (продукт + все добавки), зафиксированная в момент добавления.
  lineUnitPrice: number;
}

export interface AddToBasketSelection {
  flatModId?: number;
  flatModName?: string;
  flatModPrice?: number; // абсолютная цена плоского модификатора
  groupSelections?: BasketGroupSelection[];
}

interface BasketState {
  items: BasketItem[];

  addToBasket: (
    product: Product,
    quantity: number,
    selection?: AddToBasketSelection,
  ) => void;
  decrementItem: (key: string) => void;
  removeFromBasket: (key: string) => void;
  clearBasket: () => void;

  getProductQuantity: (id: number) => number;

  getTotalPrice: () => number;
  getItemCount: () => number;

  incrementItem: (key: string) => void;
}

function buildKey(productId: number, selection?: AddToBasketSelection): string {
  const parts: string[] = [String(productId)];
  parts.push(`f${selection?.flatModId ?? ''}`);
  if (selection?.groupSelections?.length) {
    const groups = selection.groupSelections
      .map((g) => {
        const items = [...g.items]
          .sort((a, b) => a.id - b.id)
          .map((i) => `${i.id}*${i.count}`)
          .join(',');
        return `${g.groupId}[${items}]`;
      })
      .sort()
      .join('|');
    parts.push(`g:${groups}`);
  }
  return parts.join('|');
}

function computeLineUnitPrice(
  product: Product,
  selection?: AddToBasketSelection,
): number {
  const base =
    selection?.flatModId != null && selection.flatModPrice != null
      ? selection.flatModPrice
      : product.productPrice;

  const groupAdd =
    selection?.groupSelections?.reduce((acc, g) => {
      return (
        acc + g.items.reduce((s, i) => s + Number(i.price) * i.count, 0)
      );
    }, 0) ?? 0;

  return base + groupAdd;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],

      addToBasket: (product, quantity = 1, selection) => {
        const items = get().items;
        const uniqueKey = buildKey(product.id, selection);

        const existingIndex = items.findIndex((i) => i.key === uniqueKey);
        if (existingIndex !== -1) {
          const updated = [...items];
          updated[existingIndex].quantity += quantity;
          set({ items: updated });
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { modificators, categories, groupModifications, productType, ...rest } = product;

        const lineUnitPrice = computeLineUnitPrice(product, selection);

        const newItem: BasketItem = {
          ...rest,
          key: uniqueKey,
          quantity,
          flatModId: selection?.flatModId,
          flatModName: selection?.flatModName,
          groupSelections: selection?.groupSelections,
          lineUnitPrice,
          productPrice: lineUnitPrice,
        };
        set({ items: [...items, newItem] });
      },

      decrementItem: (key) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.key === key);
        if (idx === -1) return;

        const item = items[idx];
        if (item.quantity > 1) {
          const updated = [...items];
          updated[idx].quantity -= 1;
          set({ items: updated });
        } else {
          set({ items: items.filter((i) => i.key !== key) });
        }
      },

      removeFromBasket: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) });
      },

      clearBasket: () => set({ items: [] }),

      getProductQuantity: (id) => {
        return get()
          .items.filter((i) => i.id === id)
          .reduce((acc, i) => acc + i.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, i) => total + i.lineUnitPrice * i.quantity,
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce((c, i) => c + i.quantity, 0);
      },

      incrementItem: (key) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.key === key);
        if (idx === -1) return;
        const updated = [...items];
        updated[idx].quantity += 1;
        set({ items: updated });
      },
    }),
    {
      name: 'basket-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        // Старые basket items (v1) имели modifierId/modifierName и не имели lineUnitPrice.
        // Очищаем — проще, чем тащить несовместимый формат.
        if (!persisted || typeof persisted !== 'object') return persisted;
        const state = persisted as { items?: BasketItem[] };
        const hasLegacy =
          Array.isArray(state.items) &&
          state.items.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (i) => (i as any).modifierId !== undefined || i.lineUnitPrice === undefined,
          );
        if (hasLegacy) {
          return { items: [] };
        }
        return persisted;
      },
    },
  ),
);
