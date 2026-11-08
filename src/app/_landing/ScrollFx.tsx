'use client';

import { useEffect } from 'react';

/**
 * Единый движок scroll-анимаций лендинга.
 *
 * Элементы с `data-fx` получают CSS-переменную `--p` (0…1) — прогресс скролла,
 * сглаженный lerp'ом, поэтому даже «ступенчатое» колесо мыши даёт плавное
 * движение. Вся анимация дальше живёт в CSS через calc(var(--p)), React на
 * скролле не перерисовывается.
 *
 *   data-fx="pin"  — секция со sticky-содержимым: 0, когда верх секции у верха
 *                    экрана, 1 — когда низ секции у низа экрана.
 *   data-fx="view" — 0, когда элемент входит снизу, 1 — когда уходит наверх.
 *   data-fx="read" — для текста: 0, когда верх на 85% высоты экрана,
 *                    1 — когда низ поднялся до 40%.
 *
 * Внутри pin-секции `[data-fx-track]` — горизонтальная лента: движок
 * выставляет секции `--rail` (на сколько px ленту нужно сдвинуть).
 *
 * `[data-tilt]` получает `--mx`/`--my` (-1…1) от положения курсора
 * (только мышь, не тач).
 *
 * Позиции меряются при ресайзе, а не в каждом кадре, поэтому цикл не читает
 * layout. Когда всё «доехало», rAF останавливается до следующего события.
 */

type Mode = 'pin' | 'view' | 'read';

interface FxItem {
  el: HTMLElement;
  mode: Mode;
  track: HTMLElement | null;
  top: number;
  height: number;
  value: number;
  written: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function ScrollFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-lp-root]');
    if (!root) return;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMq.matches) {
      root.dataset.fx = 'static';
      return;
    }
    root.dataset.fx = 'on';

    const items: FxItem[] = Array.from(
      root.querySelectorAll<HTMLElement>('[data-fx]'),
    ).map((el) => ({
      el,
      mode: (el.dataset.fx as Mode) || 'view',
      track: el.querySelector<HTMLElement>('[data-fx-track]'),
      top: 0,
      height: 0,
      value: -1,
      written: '',
    }));
    const tilts = Array.from(root.querySelectorAll<HTMLElement>('[data-tilt]'));

    let vh = window.innerHeight;
    let raf = 0;
    let last = 0;

    const pointer = { tx: 0, ty: 0, x: 0, y: 0, written: '' };
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const progress = (it: FxItem, sy: number) => {
      const top = it.top - sy;
      switch (it.mode) {
        case 'pin': {
          const range = it.height - vh;
          return range > 40 ? clamp01(-top / range) : clamp01(-top / (vh * 0.6));
        }
        case 'read':
          return clamp01((vh * 0.85 - top) / (it.height + vh * 0.45));
        default:
          return clamp01((vh - top) / (it.height + vh));
      }
    };

    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 16.7;
      last = t;
      // Скорость сглаживания не зависит от частоты кадров (60/120 Гц).
      const k = 1 - Math.pow(1 - 0.16, dt / 16.7);
      const sy = window.scrollY;
      let moving = false;

      for (const it of items) {
        const target = progress(it, sy);
        if (it.value < 0) it.value = target;
        const d = target - it.value;
        if (Math.abs(d) > 0.0004) {
          it.value += d * k;
          moving = true;
        } else {
          it.value = target;
        }
        const s = it.value.toFixed(4);
        if (s !== it.written) {
          it.el.style.setProperty('--p', s);
          it.written = s;
        }
      }

      if (tilts.length) {
        const dx = pointer.tx - pointer.x;
        const dy = pointer.ty - pointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.001) {
          pointer.x += dx * k * 0.6;
          pointer.y += dy * k * 0.6;
          moving = true;
        }
        const s = `${pointer.x.toFixed(3)}|${pointer.y.toFixed(3)}`;
        if (s !== pointer.written) {
          for (const el of tilts) {
            el.style.setProperty('--mx', pointer.x.toFixed(3));
            el.style.setProperty('--my', pointer.y.toFixed(3));
          }
          pointer.written = s;
        }
      }

      if (moving) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      vh = window.innerHeight;
      // Сначала ленты: от их длины зависит высота pin-секций.
      for (const it of items) {
        if (!it.track) continue;
        const viewport = it.track.parentElement?.clientWidth ?? window.innerWidth;
        const distance = Math.max(0, it.track.scrollWidth - viewport);
        it.el.style.setProperty('--rail', `${distance}px`);
      }
      const sy = window.scrollY;
      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        it.top = r.top + sy;
        it.height = r.height;
      }
      kick();
    };

    const onPointer = (e: PointerEvent) => {
      if (!finePointer.matches || e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    // Шрифты и картинки догружаются и меняют высоту секций — перемеряем.
    const ro = new ResizeObserver(onResize);
    ro.observe(root);
    document.fonts?.ready.then(onResize).catch(() => {});

    const onReduceChange = () => {
      if (reduceMq.matches) root.dataset.fx = 'static';
    };
    reduceMq.addEventListener('change', onReduceChange);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      reduceMq.removeEventListener('change', onReduceChange);
      ro.disconnect();
    };
  }, []);

  return null;
}
