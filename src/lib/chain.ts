import { driveMinutes, roadMiles } from './geo';
import { DRIVE_LIMIT_MIN, RESET_MIN } from './hos';
import { scoreLoad } from './score';
import type { CostSettings, Fit, HosClocks, Load, Truck } from './types';

export const CHAIN_RADIUS_MI = 75;
const DOCK_MIN = 60; // loading or unloading

const addMin = (d: Date, min: number) => new Date(d.getTime() + min * 60_000);

/** When the truck is empty at the destination, and how much clock it has left. */
export function planDelivery(load: Load, fit: Fit, costs: CostSettings): { deliveredAt: Date; clocks: HosClocks } {
  const tripDrive = driveMinutes(load.tripMiles, costs.avgMph);
  let t = addMin(new Date(Math.max(fit.hos.arriveAt.getTime(), load.pickupStart.getTime())), DOCK_MIN);
  let available =
    fit.hos.spareMin ?? (fit.hos.status === 'reset' ? DRIVE_LIMIT_MIN - fit.hos.driveToPickupMin : DRIVE_LIMIT_MIN);

  let remaining = tripDrive;
  while (remaining > available) {
    remaining -= available;
    t = addMin(t, available + RESET_MIN);
    available = DRIVE_LIMIT_MIN;
  }
  t = addMin(t, remaining + DOCK_MIN);
  available -= remaining;
  return { deliveredAt: t, clocks: { driveLeftMin: available, windowLeftMin: available + DOCK_MIN } };
}

export interface ChainSuggestion {
  next: Load;
  nextFit: Fit;
  gapMiles: number;
  combinedNet: number;
}

/** Best follow-on load that starts near this load's destination after it delivers. */
export function suggestChain(
  selected: Load,
  selectedFit: Fit,
  all: Load[],
  truck: Truck,
  costs: CostSettings,
): ChainSuggestion | null {
  if (selectedFit.verdict === 'skip') return null;
  const { deliveredAt, clocks } = planDelivery(selected, selectedFit, costs);
  const emptyTruck: Truck = { ...truck, location: selected.destination, hos: clocks };

  let best: ChainSuggestion | null = null;
  for (const next of all) {
    if (next.id === selected.id || next.equipment !== truck.equipment) continue;
    const gapMiles = roadMiles(selected.destination, next.origin);
    if (gapMiles > CHAIN_RADIUS_MI || next.pickupEnd < deliveredAt) continue;
    const nextFit = scoreLoad(next, emptyTruck, costs, deliveredAt);
    if (nextFit.verdict === 'skip') continue;
    if (!best || nextFit.netProfit > best.nextFit.netProfit) {
      best = { next, nextFit, gapMiles, combinedNet: selectedFit.netProfit + nextFit.netProfit };
    }
  }
  return best;
}
