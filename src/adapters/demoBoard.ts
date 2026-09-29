import { lookupCity } from '../data/cities';
import type { Equipment, Load } from '../lib/types';
import type { LoadBoardAdapter } from './types';

const EQUIPMENT: Record<string, Equipment> = { van: 'Dry Van', 'dry van': 'Dry Van', reefer: 'Reefer', flatbed: 'Flatbed' };

const num = (s: string | undefined) => {
  const n = Number((s ?? '').replace(/[^0-9.]/g, ''));
  return s && /\d/.test(s) && Number.isFinite(n) ? n : null;
};

/** "09/30 14:00–17:00" or "09/30 22:00–10/01 04:00" → [start, end]. */
export function parsePickup(text: string, now: Date): [Date, Date] | null {
  const m = text.trim().match(/^(\d{2})\/(\d{2}) (\d{2}):(\d{2})\s*[–-]\s*(?:(\d{2})\/(\d{2}) )?(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, mo, d, h, mi, mo2, d2, h2, mi2] = m;
  const date = (month: string, day: string, hh: string, mm: string) => {
    let year = now.getFullYear();
    if (Number(month) - 1 < now.getMonth() - 6) year += 1; // board shows next January in December
    return new Date(year, Number(month) - 1, Number(day), Number(hh), Number(mm));
  };
  return [date(mo, d, h, mi), date(mo2 ?? mo, d2 ?? d, h2, mi2)];
}

/** Cells the board owns — skips anything Class8 injected (marked data-c8). */
const own = <T extends HTMLElement>(cells: Iterable<T>) => Array.from(cells).filter((c) => !('c8' in c.dataset));

/** Map header text → column index so column order changes don't break us. */
function columns(table: HTMLTableElement): Record<string, number> {
  const map: Record<string, number> = {};
  own(table.querySelectorAll<HTMLTableCellElement>('thead th')).forEach((th, i) => {
    const key = th.textContent?.trim().toLowerCase();
    if (key) map[key] = i;
  });
  return map;
}

export const demoBoardAdapter: LoadBoardAdapter = {
  id: 'loadline',
  name: 'LoadLine (demo board)',

  matches: (_url, doc) => doc.title.startsWith('LoadLine') && !!doc.querySelector('table#loads'),

  findTable: (doc) => doc.querySelector<HTMLTableElement>('table#loads'),

  findRows: (table) => Array.from(table.tBodies[0]?.rows ?? []).filter((r) => r.dataset.loadId),

  parseRow(row, now) {
    const table = row.closest('table');
    if (!table) return null;
    const col = columns(table);
    const cells = own(row.cells);
    const cell = (name: string) => cells[col[name]];
    const text = (name: string) => cell(name)?.textContent?.trim() ?? '';

    const origin = lookupCity(text('origin'));
    const destination = lookupCity(text('destination'));
    const pickup = parsePickup(text('pickup'), now);
    const equipment = EQUIPMENT[text('equip').toLowerCase()];
    const tripMiles = num(text('trip'));
    if (!origin || !destination || !pickup || !equipment || !tripMiles) return null;

    const contact = cell('contact');
    return {
      id: row.dataset.loadId!,
      origin,
      destination,
      pickupStart: pickup[0],
      pickupEnd: pickup[1],
      equipment,
      tripMiles,
      rate: num(text('rate')),
      lengthFt: num(text('length')),
      weightLbs: num(text('weight')),
      broker: {
        name: text('company'),
        phone: contact?.querySelector('a[href^="tel:"]')?.textContent?.trim() ?? '',
        email: contact?.querySelector('a[href^="mailto:"]')?.textContent?.trim() ?? '',
      },
    };
  },
};
