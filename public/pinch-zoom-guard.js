// Блокирует pinch-zoom на iOS Safari — touch-action и viewport
// user-scalable=no там игнорируются. Загружается через next/script
// (strategy="beforeInteractive") вместо инлайнового <script>, чтобы не
// требовать 'unsafe-inline' в CSP script-src.
document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
document.addEventListener('touchmove', function (e) { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
