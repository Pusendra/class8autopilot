import { planDelivery, suggestChain } from '../src/lib/chain';
import { DEFAULT_COSTS, scoreLoad } from '../src/lib/score';
import { NOW, hoursFromNow, load, truck } from './fixtures';

const first = load();
const firstFit = scoreLoad(first, truck, DEFAULT_COSTS, NOW);

test('delivery includes a 10-hour break when the trip outruns the clock', () => {
  const { deliveredAt } = planDelivery(first, firstFit, DEFAULT_COSTS);
  // arrive at pickup, 1h load, ~9h drive with a break partway, 1h unload
  expect(deliveredAt.getTime()).toBeGreaterThan(hoursFromNow(2 + 1 + 9 + 10).getTime());
});

test('suggests the best nearby load after delivery', () => {
  const near = load({ id: 'near', from: 'Olive Branch, MS', to: 'Dallas, TX', tripMiles: 460, rate: 1480, pickupStart: hoursFromNow(24), pickupEnd: hoursFromNow(34) });
  const tooEarly = load({ id: 'early', from: 'West Memphis, AR', to: 'Nashville, TN', tripMiles: 215, rate: 690, pickupStart: hoursFromNow(1), pickupEnd: hoursFromNow(3) });
  const tooFar = load({ id: 'far', from: 'Atlanta, GA', to: 'Dallas, TX', tripMiles: 800, rate: 2500, pickupStart: hoursFromNow(30), pickupEnd: hoursFromNow(40) });
  const s = suggestChain(first, firstFit, [first, near, tooEarly, tooFar], truck, DEFAULT_COSTS);
  expect(s?.next.id).toBe('near');
  expect(s!.gapMiles).toBeLessThanOrEqual(75);
  expect(s!.combinedNet).toBeCloseTo(firstFit.netProfit + s!.nextFit.netProfit, 6);
});

test('no chain for a skipped load', () => {
  const skip = scoreLoad(load({ equipment: 'Reefer' }), truck, DEFAULT_COSTS, NOW);
  expect(suggestChain(first, skip, [first], truck, DEFAULT_COSTS)).toBeNull();
});
