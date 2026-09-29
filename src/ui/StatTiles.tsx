import { duration, money } from '../lib/format';
import type { Fit } from '../lib/types';

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-wash px-3 py-2.5">
      <div className="num text-lg font-semibold leading-tight">{value}</div>
      <div className="mt-0.5 text-xs leading-snug text-ink-soft">{label}</div>
    </div>
  );
}

export function StatTiles({ fit }: { fit: Fit }) {
  const spare =
    fit.hos.status === 'ok' || fit.hos.status === 'tight'
      ? duration(fit.hos.spareMin ?? 0)
      : fit.hos.status === 'reset'
        ? '10h break'
        : fit.hos.status === 'unknown'
          ? 'Unknown'
          : 'None';
  return (
    <div className="grid grid-cols-3 gap-2">
      <Tile value={money(fit.netProfit)} label="Profit after costs" />
      <Tile value={`${fit.deadheadMiles} mi`} label="Empty to pickup" />
      <Tile value={spare} label="Driving time to spare" />
    </div>
  );
}
