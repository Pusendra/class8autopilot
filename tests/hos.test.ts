import { checkHos } from '../src/lib/hos';
import { NOW, hoursFromNow } from './fixtures';

const clocks = { driveLeftMin: 380, windowLeftMin: 455 };

test('drives straight to pickup with time to spare', () => {
  const r = checkHos(clocks, 30, hoursFromNow(5), NOW);
  expect(r.status).toBe('ok');
  expect(r.spareMin).toBe(350);
});

test('tight when less than an hour of driving is left at pickup', () => {
  expect(checkHos(clocks, 340, hoursFromNow(8), NOW).status).toBe('tight');
});

test('the 14-hour window can be the binding clock', () => {
  const r = checkHos({ driveLeftMin: 600, windowLeftMin: 90 }, 60, hoursFromNow(5), NOW);
  expect(r.spareMin).toBe(30);
  expect(r.status).toBe('tight');
});

test('needs a 10-hour break when clocks are nearly out', () => {
  const r = checkHos({ driveLeftMin: 20, windowLeftMin: 40 }, 90, hoursFromNow(24), NOW);
  expect(r.status).toBe('reset');
  expect(r.arriveAt).toEqual(hoursFromNow(11.5));
});

test('missed when even a break cannot make the window', () => {
  expect(checkHos({ driveLeftMin: 0, windowLeftMin: 0 }, 60, hoursFromNow(4), NOW).status).toBe('missed');
});

test('missed when the window closes before arrival even with clock left', () => {
  expect(checkHos(clocks, 120, hoursFromNow(1), NOW).status).toBe('missed');
});

test('unknown when the ELD has not reported', () => {
  const r = checkHos(null, 45, hoursFromNow(5), NOW);
  expect(r.status).toBe('unknown');
  expect(r.spareMin).toBeNull();
});
