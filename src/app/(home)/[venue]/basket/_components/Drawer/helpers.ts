export type Spot = {
  id: number;
  name?: string;
  address?: string;
  locality?: string;
  village?: string;
};

export function formatSpotTitle(s: Spot): string {
  const name = s?.name?.trim() ?? '';
  const addr = s?.address?.trim() ?? '';
  const title = [name, addr].filter(Boolean).join(', ');
  return title || 'Филиал';
}

export function formatSpotSubtitle(s: Spot): string | null {
  const sub = (s?.locality ?? s?.village ?? '').trim();
  return sub ? sub : null;
}

export function nextNearest15Min(d: Date = new Date()): string {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() + 15 - (copy.getMinutes() % 15), 0, 0);
  const hh = String(copy.getHours()).padStart(2, '0');
  const mm = String(copy.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function generateTimeSlots(opts?: {
  start?: Date;
  stepMinutes?: number;
  count?: number;
}): string[] {
  const start = opts?.start ?? new Date();
  const step = opts?.stepMinutes ?? 15;
  const count = opts?.count ?? 20;

  // start from next nearest
  const first = new Date(start);
  first.setMinutes(first.getMinutes() + step - (first.getMinutes() % step), 0, 0);

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(first);
    dt.setMinutes(first.getMinutes() + i * step);
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    out.push(`${hh}:${mm}`);
  }
  return out;
}
