import { laneRatePerMile } from '../src/data/lanes';
import { roadMiles } from '../src/lib/geo';
import { scoreLoad, topPick, DEFAULT_COSTS } from '../src/lib/score';
import { NOW, hoursFromNow, load, truck } from './fixtures';

test('costs and profit add up by hand', () => {
  const l = load({ from: 'Fort Worth, TX' });
  const f = scoreLoad(l, truck, DEFAULT_COSTS, NOW);
  const dh = roadMiles(truck.location, l.origin);
  const total = dh + 452;
  expect(f.deadheadMiles).toBe(dh);
  expect(f.totalMiles).toBe(total);
  expect(f.fuelCost).toBeCloseTo((total / 6.8) * 3.85, 6);
  expect(f.driverPay).toBeCloseTo(total * 0.62, 6);
  expect(f.fixedCost).toBeCloseTo(total * 0.38, 6);
  expect(f.netProfit).toBeCloseTo(1420 - f.fuelCost - f.driverPay - f.fixedCost, 6);
});

test('a well-paid, nearby, reachable load is a great load', () => {
  const f = scoreLoad(load(), truck, DEFAULT_COSTS, NOW);
  expect(f.verdict).toBe('great');
  expect(f.tone).toBe('good');
  expect(f.reason).toMatch(/Makes pickup with .* to spare · pays \d+% above market/);
  expect(f.score).toBeGreaterThanOrEqual(80);
  expect(f.score).toBeLessThanOrEqual(100);
});

test('no posted rate is scored at the market rate', () => {
  const f = scoreLoad(load({ rate: null }), truck, DEFAULT_COSTS, NOW);
  expect(f.rateSource).toBe('market');
  expect(f.revenue).toBe(Math.round(laneRatePerMile('TX', 'TN', 452, 'Dry Van') * 452));
  expect(f.marketDeltaPct).toBeNull();
  expect(f.reason).toMatch(/scored at market/);
});

test('far under market is low pay', () => {
  const f = scoreLoad(load({ rate: 900 }), truck, DEFAULT_COSTS, NOW);
  expect(f.verdict).toBe('low-pay');
  expect(f.label).toBe('Low pay');
});

test('wrong trailer is always a skip with zero score', () => {
  const f = scoreLoad(load({ equipment: 'Reefer' }), truck, DEFAULT_COSTS, NOW);
  expect(f.verdict).toBe('skip');
  expect(f.label).toBe('Wrong trailer');
  expect(f.score).toBe(0);
});

test('zero hours left and a short window is a skip', () => {
  const tired = { ...truck, hos: { driveLeftMin: 0, windowLeftMin: 0 } };
  const f = scoreLoad(load({ from: 'Fort Worth, TX', pickupEnd: hoursFromNow(3) }), tired, DEFAULT_COSTS, NOW);
  expect(f.verdict).toBe('skip');
  expect(f.reason).toMatch(/Can't reach pickup/);
});

test('pickup window already closed is a skip', () => {
  const f = scoreLoad(load({ pickupStart: hoursFromNow(-4), pickupEnd: hoursFromNow(-1) }), truck, DEFAULT_COSTS, NOW);
  expect(f.verdict).toBe('skip');
});

test('money-losing load is a skip', () => {
  const f = scoreLoad(load({ rate: 300 }), truck, DEFAULT_COSTS, NOW);
  expect(f.netProfit).toBeLessThan(0);
  expect(f.verdict).toBe('skip');
});

test('top pick ignores skips', () => {
  const fits = [
    scoreLoad(load({ id: 'a', equipment: 'Reefer' }), truck, DEFAULT_COSTS, NOW),
    scoreLoad(load({ id: 'b' }), truck, DEFAULT_COSTS, NOW),
    scoreLoad(load({ id: 'c', rate: 1000 }), truck, DEFAULT_COSTS, NOW),
  ];
  expect(topPick(fits)?.loadId).toBe('b');
  expect(topPick([fits[0]])).toBeNull();
});
