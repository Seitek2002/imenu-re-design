// Временный флаг скрытия профиля. Чтобы вернуть личный кабинет —
// поставь PROFILE_IN_DEVELOPMENT в false. Используется в page.tsx
// самого профиля и в трёх вложенных роутах (payment/addresses/points),
// которые при включённом флаге редиректят на /[venue]/profile.
export const PROFILE_IN_DEVELOPMENT = false;
