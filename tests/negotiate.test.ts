import { simulatedAgreement, targetRpm, templateEmail } from '../src/lib/negotiate';
import { DEFAULT_COSTS, scoreLoad } from '../src/lib/score';
import { NOW, load, truck } from './fixtures';

test('target beats market, posted, and the cost floor, in nickel steps', () => {
  const l = load({ rate: 1100 });
  const f = scoreLoad(l, truck, DEFAULT_COSTS, NOW);
  const t = targetRpm(l, f);
  expect(t).toBeGreaterThanOrEqual(f.marketRpm * 1.05);
  expect(t).toBeGreaterThan(f.postedRpm!);
  expect(t).toBeGreaterThan((f.fuelCost + f.driverPay + f.fixedCost) / l.tripMiles);
  expect(Math.round(t * 20)).toBeCloseTo(t * 20, 6);
});

test('agreement lands between posted and target', () => {
  const l = load({ rate: 1100 });
  const f = scoreLoad(l, truck, DEFAULT_COSTS, NOW);
  const a = simulatedAgreement(l, f);
  expect(a).toBeGreaterThan(f.postedRpm!);
  expect(a).toBeLessThanOrEqual(targetRpm(l, f));
});

test('template email names the lane, truck, and ask', () => {
  const l = load({ rate: null });
  const f = scoreLoad(l, truck, DEFAULT_COSTS, NOW);
  const e = templateEmail(l, f, truck);
  expect(e.subject).toContain('Dallas, TX → Memphis, TN');
  expect(e.body).toContain('Truck 214');
  expect(e.body).toContain(`$${targetRpm(l, f).toFixed(2)}/mi`);
  expect(e.body).not.toContain('posted');
});

test('agreement is a real concession, not our full ask', () => {
  const l = load(); // posted above market
  const f = scoreLoad(l, truck, DEFAULT_COSTS, NOW);
  expect(simulatedAgreement(l, f)).toBeLessThan(targetRpm(l, f));
});

test('above-market loads get a polite take-it email, below-market a counter', () => {
  const good = load();
  const goodFit = scoreLoad(good, truck, DEFAULT_COSTS, NOW);
  expect(templateEmail(good, goodFit, truck).body).toContain('We can take it at the posted $1,420');

  const cheap = load({ rate: 1000 });
  const cheapFit = scoreLoad(cheap, truck, DEFAULT_COSTS, NOW);
  expect(templateEmail(cheap, cheapFit, truck).body).toMatch(/Can you do \$[\d.]+\/mi/);
});
