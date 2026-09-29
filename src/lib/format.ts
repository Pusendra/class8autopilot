export const money = (n: number) =>
  (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');

export const perMile = (n: number) => `$${n.toFixed(2)}/mi`;

export function duration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}

export function clock(d: Date, now: Date): string {
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d.getTime() - day.getTime()) / 86_400_000);
  if (diffDays === 0) return `today ${time}`;
  if (diffDays === 1) return `tomorrow ${time}`;
  return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`;
}

export const place = (p: { city: string; state: string }) => `${p.city}, ${p.state}`;
