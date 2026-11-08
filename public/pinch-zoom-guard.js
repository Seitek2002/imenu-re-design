// Блокирует pinch-zoom на iOS Safari — touch-action и viewport
// user-scalable=no там игнорируются. Подключается в src/app/layout.tsx как
// внешний <script async nonce> вместо инлайнового, чтобы не требовать
// 'unsafe-inline' в CSP script-src.
document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
document.addEventListener('touchmove', function (e) { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
