import { laneRatePerMile } from '../data/lanes';
import { duration } from './format';
import { driveMinutes, roadMiles } from './geo';
import { checkHos } from './hos';
import type { CostSettings, Fit, HosResult, Load, Tone, Truck, Verdict } from './types';

export const DEFAULT_COSTS: CostSettings = {
  fuelPrice: 3.85,
  driverPayPerMile: 0.62,
  fixedCostPerMile: 0.38,
  avgMph: 50,
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const HOS_POINTS: Record<HosResult['status'], number> = { ok: 25, tight: 15, unknown: 12, reset: 8, missed: 0 };

const TONE: Record<Verdict, Tone> = {
  great: 'good',
  good: 'good',
  fair: 'neutral',
  tight: 'warn',
  'low-pay': 'warn',
  skip: 'bad',
};

const LABEL: Record<Verdict, string> = {
  great: 'Great load',
  good: 'Good load',
  fair: 'Fair load',
  tight: 'Tight',
  'low-pay': 'Low pay',
  skip: 'Skip',
};

/**
 * Score one load for one truck. Pure: same inputs, same answer — the content
 * script, the side panel, and the tests all call this.
 */
export function scoreLoad(load: Load, truck: Truck, costs: CostSettings = DEFAULT_COSTS, now = new Date()): Fit {
  const deadheadMiles = roadMiles(truck.location, load.origin);
  const totalMiles = deadheadMiles + load.tripMiles;
  const hos = checkHos(truck.hos, driveMinutes(deadheadMiles, costs.avgMph), load.pickupEnd, now);

  const marketRpm = laneRatePerMile(load.origin.state, load.destination.state, load.tripMiles, load.equipment);
  const revenue = load.rate ?? Math.round(marketRpm * load.tripMiles);
  const postedRpm = load.rate != null ? load.rate / load.tripMiles : null;
  const marketDeltaPct = postedRpm != null ? Math.round((postedRpm / marketRpm - 1) * 100) : null;

  const fuelCost = (totalMiles / truck.mpg) * costs.fuelPrice;
  const driverPay = totalMiles * costs.driverPayPerMile;
  const fixedCost = totalMiles * costs.fixedCostPerMile;
  const netProfit = revenue - fuelCost - driverPay - fixedCost;

  const wrongTrailer = load.equipment !== truck.equipment;

  let score = 0;
  if (!wrongTrailer) {
    score += clamp01(netProfit / totalMiles / 1.5) * 40; // net per mile driven, $1.50 = full marks
    score += clamp01(((marketDeltaPct ?? 0) + 20) / 40) * 20; // -20%..+20% vs market
    score += clamp01(1 - deadheadMiles / 150) * 15; // empty miles
    score += HOS_POINTS[hos.status];
  }
  score = Math.round(score);

  const { verdict, reason } = judge({ wrongTrailer, hos, netProfit, marketDeltaPct, score, load, truck });

  return {
    loadId: load.id,
    score,
    verdict,
    tone: TONE[verdict],
    label: wrongTrailer ? 'Wrong trailer' : LABEL[verdict],
    reason,
    hos,
    deadheadMiles,
    totalMiles,
    revenue,
    rateSource: load.rate != null ? 'posted' : 'market',
    fuelCost,
    driverPay,
    fixedCost,
    netProfit,
    postedRpm,
    marketRpm,
    marketDeltaPct,
  };
}

function judge(x: {
  wrongTrailer: boolean;
  hos: HosResult;
  netProfit: number;
  marketDeltaPct: number | null;
  score: number;
  load: Load;
  truck: Truck;
}): { verdict: Verdict; reason: string } {
  const { hos, marketDeltaPct } = x;
  if (x.wrongTrailer) {
    return { verdict: 'skip', reason: `Needs a ${x.load.equipment.toLowerCase()}; this truck pulls a ${x.truck.equipment.toLowerCase()}` };
  }
  if (hos.status === 'missed') return { verdict: 'skip', reason: "Can't reach pickup before the window closes" };
  if (x.netProfit <= 0) return { verdict: 'skip', reason: 'Loses money after fuel, pay, and truck costs' };

  const market =
    marketDeltaPct == null
      ? 'no rate posted, so scored at market'
      : marketDeltaPct === 0
        ? 'pays market rate'
        : `pays ${Math.abs(marketDeltaPct)}% ${marketDeltaPct > 0 ? 'above' : 'under'} market`;

  if (hos.status === 'reset') return { verdict: 'tight', reason: `Needs a 10-hour break before pickup · ${market}` };
  if (marketDeltaPct != null && marketDeltaPct <= -10) return { verdict: 'low-pay', reason: `Easy to reach, but ${market}` };

  const hosText =
    hos.status === 'unknown'
      ? 'Hours unknown, check with the driver'
      : `Makes pickup with ${duration(hos.spareMin ?? 0)} of driving to spare`;
  const reason = `${hosText} · ${market}`;

  if (hos.status === 'tight') return { verdict: 'tight', reason };
  if (x.score >= 80) return { verdict: 'great', reason };
  if (x.score >= 60) return { verdict: 'good', reason };
  return { verdict: 'fair', reason };
}

/** The best load worth taking, or null if everything is a skip. */
export function topPick(fits: Fit[]): Fit | null {
  return fits.filter((f) => f.verdict !== 'skip').sort((a, b) => b.score - a.score)[0] ?? null;
}
