import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/api';

// 🔥 ОПТИМИЗАЦИЯ 1:
// Исключаем тяжелые массивы 'modificators' и 'categories' из типа элемента корзины.
// Они там не нужны, нам нужны только метаданные (название, цена, картинка).
export interface BasketItem
  extends Omit<Product, 'modificators' | 'categories'> {
  key: string;
  quantity: number;
  modifierId?: number;
  modifierName?: string;
}

interface BasketState {
  items: BasketItem[];

  addToBasket: (
    product: Product,
    quantity?: number,
    modifierId?: number
  ) => void;
  decrementItem: (key: string) => void;
  removeFromBasket: (key: string) => void;
  clearBasket: () => void;

  getProductQuantity: (id: number) => number;

  // Геттеры для UI
  getTotalPrice: () => number;
  getItemCount: () => number;

  incrementItem: (key: string) => void;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],

      addToBasket: (product, quantity = 1, modifierId) => {
        const items = get().items;

        let finalPrice = product.productPrice;
        let modifierName = undefined;

        if (modifierId && product.modificators) {
          const mod = product.modificators.find((m) => m.id === modifierId);
          if (mod) {
            finalPrice = mod.price;
            modifierName = mod.name;
          }
        }

        const uniqueKey = modifierId
          ? `${product.id}_${modifierId}`
          : `${product.id}`;

        const existingItemIndex = items.findIndex(
          (item) => item.key === uniqueKey
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // 🔥 ОПТИМИЗАЦИЯ 2:
          // Деструктуризация. Мы вытаскиваем modificators и categories в отдельные переменные (unused),
          // а всё остальное (id, name, photo, price) собираем в restProduct.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { modificators, categories, ...restProduct } = product;

          const newItem: BasketItem = {
            ...restProduct, // Тут теперь только легкие данные
            key: uniqueKey,
            quantity,
            modifierId,
            modifierName,
            productPrice: finalPrice,
          };
          set({ items: [...items, newItem] });
        }
      },

      decrementItem: (key) => {
        const items = get().items;
        const itemIndex = items.findIndex((i) => i.key === key);

        if (itemIndex !== -1) {
          const item = items[itemIndex];
          if (item.quantity > 1) {
            const updated = [...items];
            updated[itemIndex].quantity -= 1;
            set({ items: updated });
          } else {
            set({ items: items.filter((i) => i.key !== key) });
          }
        }
      },

      removeFromBasket: (key) => {
        set({ items: get().items.filter((item) => item.key !== key) });
      },

      clearBasket: () => set({ items: [] }),

      getProductQuantity: (id) => {
        return get()
          .items.filter((item) => item.id === id)
          .reduce((acc, item) => acc + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.productPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      incrementItem: (key) => {
        const items = get().items;
        const itemIndex = items.findIndex((i) => i.key === key);

        if (itemIndex !== -1) {
          const updatedItems = [...items];
          updatedItems[itemIndex].quantity += 1;
          set({ items: updatedItems });
        }
      },
    }),
    {
      name: 'basket-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
