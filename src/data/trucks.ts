import type { Truck } from '../lib/types';
import { lookupCity } from './cities';

const at = (name: string, dLat = 0, dLng = 0) => {
  const p = lookupCity(name)!;
  return { ...p, lat: p.lat + dLat, lng: p.lng + dLng };
};

/**
 * Mock of what Class8 reads from the OEM-embedded ELD: live position,
 * trailer, fuel economy, and hours-of-service clocks.
 */
export const TRUCKS: Truck[] = [
  {
    id: 't214',
    unit: '214',
    driver: 'Marco Ruiz',
    location: at('Lancaster, TX'),
    equipment: 'Dry Van',
    mpg: 6.8,
    hos: { driveLeftMin: 380, windowLeftMin: 455 },
  },
  {
    id: 't118',
    unit: '118',
    driver: 'Aisha Bello',
    location: at('Fort Worth, TX', 0.04, -0.05),
    equipment: 'Dry Van',
    mpg: 7.1,
    hos: { driveLeftMin: 50, windowLeftMin: 95 },
  },
  {
    id: 't305',
    unit: '305',
    driver: 'Tomasz Nowak',
    location: at('Houston, TX', 0.06, 0.08),
    equipment: 'Flatbed',
    mpg: 6.4,
    hos: null,
  },
];

export const findTruck = (id: string) => TRUCKS.find((t) => t.id === id) ?? TRUCKS[0];
