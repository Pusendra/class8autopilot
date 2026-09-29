import { lookupCity } from '../src/data/cities';
import type { Load, Truck } from '../src/lib/types';

export const NOW = new Date('2026-09-30T08:00:00');
export const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 3_600_000);

export const truck: Truck = {
  id: 't1',
  unit: '214',
  driver: 'Marco Ruiz',
  location: lookupCity('Dallas, TX')!,
  equipment: 'Dry Van',
  mpg: 6.8,
  hos: { driveLeftMin: 380, windowLeftMin: 455 },
};

export function load(over: Partial<Load> & { from?: string; to?: string } = {}): Load {
  const { from = 'Dallas, TX', to = 'Memphis, TN', ...rest } = over;
  return {
    id: 'L1',
    origin: lookupCity(from)!,
    destination: lookupCity(to)!,
    pickupStart: hoursFromNow(2),
    pickupEnd: hoursFromNow(5),
    equipment: 'Dry Van',
    tripMiles: 452,
    rate: 1420,
    lengthFt: 48,
    weightLbs: 38000,
    broker: { name: 'Bluff City Brokerage', phone: '(901) 555-0142', email: 'loads@bluffcity.example' },
    ...rest,
  };
}
