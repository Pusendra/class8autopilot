import type { Place } from '../lib/types';

/**
 * Tiny gazetteer for the cities on the demo board. A production adapter would
 * geocode with a real service; load boards only give "City, ST".
 */
const RAW: [string, string, number, number][] = [
  ['Dallas', 'TX', 32.78, -96.8], ['Fort Worth', 'TX', 32.75, -97.33], ['Houston', 'TX', 29.76, -95.37],
  ['San Antonio', 'TX', 29.42, -98.49], ['Austin', 'TX', 30.27, -97.74], ['Waco', 'TX', 31.55, -97.15],
  ['Denton', 'TX', 33.21, -97.13], ['Tyler', 'TX', 32.35, -95.3], ['Lubbock', 'TX', 33.58, -101.86],
  ['Laredo', 'TX', 27.51, -99.51], ['Lancaster', 'TX', 32.59, -96.76], ['Memphis', 'TN', 35.15, -90.05],
  ['Nashville', 'TN', 36.16, -86.78], ['Atlanta', 'GA', 33.75, -84.39], ['Marietta', 'GA', 33.95, -84.55],
  ['Denver', 'CO', 39.74, -104.99], ['Aurora', 'CO', 39.73, -104.83], ['Oklahoma City', 'OK', 35.47, -97.52],
  ['Norman', 'OK', 35.22, -97.44], ['Tulsa', 'OK', 36.15, -95.99], ['Chicago', 'IL', 41.88, -87.63],
  ['Joliet', 'IL', 41.53, -88.08], ['Little Rock', 'AR', 34.75, -92.29], ['West Memphis', 'AR', 35.15, -90.18],
  ['Shreveport', 'LA', 32.52, -93.75], ['New Orleans', 'LA', 29.95, -90.07], ['Phoenix', 'AZ', 33.45, -112.07],
  ['Kansas City', 'MO', 39.1, -94.58], ['St. Louis', 'MO', 38.63, -90.2], ['Olive Branch', 'MS', 34.96, -89.83],
  ['Birmingham', 'AL', 33.52, -86.8], ['Albuquerque', 'NM', 35.08, -106.65],
];

const INDEX = new Map(RAW.map(([city, state, lat, lng]) => [`${city}, ${state}`.toLowerCase(), { city, state, lat, lng }]));

/** "Dallas, TX" → Place, or null when we don't know the city. */
export function lookupCity(text: string): Place | null {
  return INDEX.get(text.replace(/\s+/g, ' ').trim().toLowerCase()) ?? null;
}
