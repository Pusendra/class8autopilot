/** @jest-environment jsdom */
import { readFileSync } from 'fs';
import { join } from 'path';
import { demoBoardAdapter, parsePickup } from '../src/adapters/demoBoard';

const board = (f: string) => readFileSync(join(__dirname, '../demo-board', f), 'utf8');

beforeAll(() => {
  // Render the real demo board, scripts and all.
  const html = board('index.html');
  document.title = html.match(/<title>(.*)<\/title>/)![1];
  document.body.innerHTML = html.split('<body>')[1].split('<script')[0];
  window.eval(board('loads.js'));
  window.eval(board('board.js'));
});

test('recognises the board and finds every load row', () => {
  expect(demoBoardAdapter.matches(new URL('http://localhost:5174/'), document)).toBe(true);
  const table = demoBoardAdapter.findTable(document)!;
  const rows = demoBoardAdapter.findRows(table);
  expect(rows).toHaveLength((window as any).LOADLINE_LOADS.length);
});

test('parses every row into a complete load', () => {
  const table = demoBoardAdapter.findTable(document)!;
  const loads = demoBoardAdapter.findRows(table).map((r) => demoBoardAdapter.parseRow(r, new Date()));
  expect(loads.every(Boolean)).toBe(true);

  const memphis = loads.find((l) => l!.id === 'LL-48213')!;
  expect(memphis.origin.city).toBe('Dallas');
  expect(memphis.destination.state).toBe('TN');
  expect(memphis.equipment).toBe('Dry Van');
  expect(memphis.tripMiles).toBe(452);
  expect(memphis.rate).toBe(1420);
  expect(memphis.weightLbs).toBe(38000);
  expect(memphis.broker).toEqual({ name: 'Bluff City Brokerage', phone: '(901) 555-0142', email: 'loads@bluffcity.example' });
  expect(memphis.pickupEnd.getTime() - memphis.pickupStart.getTime()).toBe(3 * 3_600_000);

  const callForRate = loads.find((l) => l!.id === 'LL-48199')!;
  expect(callForRate.rate).toBeNull();
});

test('picks up rows added after load (Refresh results)', () => {
  const table = demoBoardAdapter.findTable(document)!;
  const before = demoBoardAdapter.findRows(table).length;
  (document.getElementById('refresh') as HTMLButtonElement).click();
  expect(demoBoardAdapter.findRows(table)).toHaveLength(before + 1);
});

test('pickup windows parse same-day and overnight', () => {
  const now = new Date(2026, 8, 30, 8, 0);
  const [s, e] = parsePickup('09/30 14:00–17:00', now)!;
  expect([s.getHours(), e.getHours()]).toEqual([14, 17]);
  const [, e2] = parsePickup('09/30 22:00–10/01 04:00', now)!;
  expect([e2.getMonth(), e2.getDate(), e2.getHours()]).toEqual([9, 1, 4]);
  expect(parsePickup('01/02 08:00–09:00', new Date(2026, 11, 30))![0].getFullYear()).toBe(2027);
  expect(parsePickup('tomorrow', now)).toBeNull();
});
