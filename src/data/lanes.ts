import type { Equipment } from '../lib/types';

/**
 * Mock lane benchmark, standing in for the SONAR / Greenscreens feeds Class8
 * licenses. Outbound markets with more freight than trucks pay more; inbound
 * "backhaul" markets pay less.
 */
const OUTBOUND: Record<string, number> = {
  TX: 1.0, CA: 1.08, GA: 0.95, TN: 1.02, IL: 1.04, CO: 0.88, OK: 0.97, MS: 1.0, AR: 1.0,
  LA: 1.03, MO: 1.0, AL: 1.0, NM: 0.9, AZ: 0.92,
};
const INBOUND: Record<string, number> = {
  TX: 0.9, GA: 1.0, TN: 1.0, IL: 1.02, CO: 1.04, OK: 1.0, MS: 1.0, AR: 1.02, LA: 1.0,
  MO: 1.0, AL: 1.0, NM: 1.03, AZ: 1.05,
};
const EQUIPMENT_PREMIUM: Record<Equipment, number> = { 'Dry Van': 0, Reefer: 0.35, Flatbed: 0.45 };

export function laneRatePerMile(originState: string, destState: string, miles: number, equipment: Equipment): number {
  let base = 2.35;
  if (miles < 250) base += 0.75; // short hauls pay more per mile
  else if (miles < 500) base += 0.3;
  const rpm = (base + EQUIPMENT_PREMIUM[equipment]) * (OUTBOUND[originState] ?? 1) * (INBOUND[destState] ?? 1);
  return Math.round(rpm * 100) / 100;
}
