import { Route } from 'lucide-react';
import type { ChainSuggestion } from '../lib/chain';
import { money, place } from '../lib/format';

export function ChainHint({ chain, onOpen }: { chain: ChainSuggestion | null; onOpen(id: string): void }) {
  if (!chain) return null;
  const { next, nextFit, gapMiles } = chain;
  return (
    <section className="flex gap-3 rounded-lg border border-dashed border-purple-light px-3 py-2.5 text-sm" aria-label="Next load">
      <Route size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-purple" />
      <div>
        <p className="leading-snug">
          <span className="font-semibold">Then:</span> {place(next.origin)} → {place(next.destination)}, {gapMiles} mi from drop-off, adds{' '}
          <span className="num font-semibold">{money(nextFit.netProfit)}</span>.
        </p>
        <p className="num mt-0.5 text-xs text-ink-soft">Both loads: {money(chain.combinedNet)} profit</p>
        <button type="button" className="mt-1.5 text-xs font-semibold text-purple underline-offset-2 hover:underline" onClick={() => onOpen(next.id)}>
          View this load
        </button>
      </div>
    </section>
  );
}
