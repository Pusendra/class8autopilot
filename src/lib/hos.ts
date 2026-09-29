import type { HosClocks, HosResult } from './types';

/** Federal property-carrying limits (49 CFR 395.3), simplified for dispatch planning. */
export const DRIVE_LIMIT_MIN = 11 * 60;
export const RESET_MIN = 10 * 60;
/** Less than this much driving left at pickup = "tight". */
export const TIGHT_MARGIN_MIN = 60;

/**
 * Can this driver legally reach pickup before the window closes?
 * Plans one leg: drive now if the clocks allow, otherwise take a 10-hour
 * break first and drive on fresh clocks.
 */
export function checkHos(
  clocks: HosClocks | null,
  driveToPickupMin: number,
  pickupEnd: Date,
  now: Date,
): HosResult {
  const at = (min: number) => new Date(now.getTime() + min * 60_000);

  if (!clocks) {
    return { status: 'unknown', driveToPickupMin, arriveAt: at(driveToPickupMin), spareMin: null };
  }

  const available = Math.min(clocks.driveLeftMin, clocks.windowLeftMin);
  if (driveToPickupMin <= available) {
    const arriveAt = at(driveToPickupMin);
    if (arriveAt <= pickupEnd) {
      const spareMin = available - driveToPickupMin;
      return { status: spareMin < TIGHT_MARGIN_MIN ? 'tight' : 'ok', driveToPickupMin, arriveAt, spareMin };
    }
    return { status: 'missed', driveToPickupMin, arriveAt, spareMin: null };
  }

  // Not enough clock left: rest first, then drive (fresh clocks cover up to 11h).
  const arriveAt = at(RESET_MIN + driveToPickupMin);
  if (driveToPickupMin <= DRIVE_LIMIT_MIN && arriveAt <= pickupEnd) {
    return { status: 'reset', driveToPickupMin, arriveAt, spareMin: null };
  }
  return { status: 'missed', driveToPickupMin, arriveAt, spareMin: null };
}
