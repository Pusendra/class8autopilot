import { money, place } from '../lib/format';
import type { Fit, Load } from '../lib/types';
import { StatusPill } from './status';

export function VerdictHeader({ load, fit }: { load: Load; fit: Fit }) {
  const loss = fit.netProfit < 0;
  return (
    <header>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={fit.tone} label={fit.label} />
        <span className="text-xs text-ink-soft">
          Class8 score <span className="num font-semibold text-purple">{fit.score}</span>
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold">
        {place(load.origin)} → {place(load.destination)}
      </p>
      <h1 className="display num mt-1 text-[40px] leading-[1.05]">
        {loss ? `${money(fit.netProfit)} loss` : `${money(fit.netProfit)} profit`}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{fit.reason}</p>
    </header>
  );
}
