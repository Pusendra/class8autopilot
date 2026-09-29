import type { Place } from './types';

/** Roads are longer than the crow flies; 1.18 is a common circuity factor for US freight. */
export const ROAD_FACTOR = 1.18;

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMiles(a: Pick<Place, 'lat' | 'lng'>, b: Pick<Place, 'lat' | 'lng'>): number {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function roadMiles(a: Pick<Place, 'lat' | 'lng'>, b: Pick<Place, 'lat' | 'lng'>): number {
  return Math.round(haversineMiles(a, b) * ROAD_FACTOR);
}

export function driveMinutes(miles: number, avgMph: number): number {
  return Math.round((miles / avgMph) * 60);
}
