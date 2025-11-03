let __lastHapticAt = 0;
const HAPTIC_MIN_INTERVAL_MS = 60;

export function hapticClick(pattern: number | number[] = 12) {
  const now = Date.now();
  if (now - __lastHapticAt < HAPTIC_MIN_INTERVAL_MS) return;
  __lastHapticAt = now;
  try {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // Normalize to pattern array; small pulse by default
      const vib: any = (navigator as any).vibrate;
      if (typeof vib === 'function') {
        vib(Array.isArray(pattern) ? pattern : [pattern]);
      }
    }
  } catch {
    // noop
  }
}

export function hapticError() {
  // Longer pattern for errors (aligns with prior usage in project)
  hapticClick([80, 80, 120]);
}
