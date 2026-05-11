import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Идентичность клиента, сохранённая только после успешного оформления заказа.
 * Это отдельный от useCheckout стор: тот живёт ради формы оформления и сбрасывается,
 * этот — ради «кто я» на профиле/истории. Авторизации в системе нет, ключ — телефон.
 */
interface ClientState {
  phone: string;
  countryId: string;
  savedAt: number | null;
  saveClient: (data: { phone: string; countryId: string }) => void;
  clear: () => void;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      phone: '',
      countryId: 'KG',
      savedAt: null,
      saveClient: ({ phone, countryId }) =>
        set({ phone, countryId, savedAt: Date.now() }),
      clear: () => set({ phone: '', countryId: 'KG', savedAt: null }),
    }),
    {
      name: 'imenu-client',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
