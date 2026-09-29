import { ChevronRight } from 'lucide-react';
import { money, perMile } from '../lib/format';
import type { CostSettings, Fit, Load, Truck } from '../lib/types';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1 ${strong ? 'mt-1 border-t border-line pt-2 font-semibold text-ink' : ''}`}>
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}

export function MathDisclosure({ load, fit, truck, costs }: { load: Load; fit: Fit; truck: Truck; costs: CostSettings }) {
  return (
    <details className="group rounded-lg border border-line px-3 py-2 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-purple">
        <ChevronRight size={16} aria-hidden="true" className="transition-transform duration-150 group-open:rotate-90" />
        See the math
      </summary>
      <div className="mt-2 text-ink-soft">
        <Row
          label={fit.rateSource === 'posted' ? `Posted rate (${perMile(fit.postedRpm!)})` : `Market estimate (${perMile(fit.marketRpm)})`}
          value={money(fit.revenue)}
        />
        <Row label={`Fuel · ${fit.totalMiles} mi at ${truck.mpg} mpg, $${costs.fuelPrice.toFixed(2)}/gal`} value={`−${money(fit.fuelCost)}`} />
        <Row label={`Driver pay · ${fit.totalMiles} mi × $${costs.driverPayPerMile.toFixed(2)}`} value={`−${money(fit.driverPay)}`} />
        <Row label={`Truck costs · ${fit.totalMiles} mi × $${costs.fixedCostPerMile.toFixed(2)}`} value={`−${money(fit.fixedCost)}`} />
        <Row label="Profit" value={money(fit.netProfit)} strong />
        <p className="mt-3 text-xs leading-relaxed">
          {fit.totalMiles} mi = {fit.deadheadMiles} empty + {load.tripMiles} loaded. Lane market rate {perMile(fit.marketRpm)}
          {fit.marketDeltaPct != null && ` (posted is ${fit.marketDeltaPct >= 0 ? '+' : ''}${fit.marketDeltaPct}%)`}. Truck
          position, hours, and fuel economy come from the ELD.
        </p>
      </div>
    </details>
  );
}
