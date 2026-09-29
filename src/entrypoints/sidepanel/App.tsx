import { MousePointerClick, PhoneCall, Mail, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { findTruck } from '../../data/trucks';
import { suggestChain } from '../../lib/chain';
import { duration } from '../../lib/format';
import { scoreLoad } from '../../lib/score';
import { bookedItem, claudeKeyItem, costsItem, fromWire, selectionItem, truckIdItem } from '../../lib/state';
import { AgentRun } from '../../ui/AgentRun';
import { ChainHint } from '../../ui/ChainHint';
import { EmailDraft } from '../../ui/EmailDraft';
import { MathDisclosure } from '../../ui/MathDisclosure';
import { StatTiles } from '../../ui/StatTiles';
import { useItem } from '../../ui/useItem';
import { VerdictHeader } from '../../ui/VerdictHeader';
import { Wordmark } from '../../ui/Wordmark';

type Work = { kind: 'call' | 'email'; loadId: string; run: number } | null;

export function App() {
  const selection = useItem(selectionItem);
  const truckId = useItem(truckIdItem);
  const costs = useItem(costsItem);
  const booked = useItem(bookedItem);
  const claudeKey = useItem(claudeKeyItem);
  const [work, setWork] = useState<Work>(null);

  const truck = truckId ? findTruck(truckId) : null;
  const loads = useMemo(() => selection?.loads.map(fromWire) ?? [], [selection]);
  const load = loads.find((l) => l.id === selection?.loadId) ?? null;
  const fit = useMemo(() => (load && truck && costs ? scoreLoad(load, truck, costs) : null), [load, truck, costs]);
  const chain = useMemo(
    () => (load && fit && truck && costs ? suggestChain(load, fit, loads, truck, costs) : null),
    [load, fit, loads, truck, costs],
  );

  const hours = truck?.hos ? Math.min(truck.hos.driveLeftMin, truck.hos.windowLeftMin) : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <Wordmark className="text-lg" />
        {truck && (
          <span className="truncate text-xs text-ink-soft">
            Truck {truck.unit} · {truck.location.city} · {hours == null ? 'hours unknown' : `${duration(hours)} left`}
          </span>
        )}
      </div>

      <main className="flex-1 space-y-4 px-4 py-4">
        {!selection || !truck || !costs ? (
          <Empty />
        ) : !load || !fit ? (
          <p className="text-sm text-ink-soft">That load is no longer on the board. Pick another one.</p>
        ) : (
          <>
            <VerdictHeader load={load} fit={fit} />
            <StatTiles fit={fit} />

            {fit.verdict === 'skip' && (
              <p className="flex items-start gap-2 rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad">
                <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                Class8 suggests skipping this one. You can still call if you know something we don't.
              </p>
            )}

            {booked?.[load.id] ? (
              <p className="rounded-lg bg-good-bg px-3 py-2 text-sm font-semibold text-good">
                Booked at ${booked[load.id].rpm.toFixed(2)}/mi. Rate confirmation sent to dispatch.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => setWork({ kind: 'call', loadId: load.id, run: Date.now() })}
                >
                  <PhoneCall size={16} aria-hidden="true" /> Let Class8 call
                </button>
                <button type="button" className="btn" onClick={() => setWork({ kind: 'email', loadId: load.id, run: Date.now() })}>
                  <Mail size={16} aria-hidden="true" /> Draft email
                </button>
              </div>
            )}

            {work?.loadId === load.id && work.kind === 'call' && !booked?.[load.id] && (
              <AgentRun
                key={work.run}
                load={load}
                fit={fit}
                onClose={() => setWork(null)}
                onBook={(rpm) =>
                  bookedItem.setValue({ ...booked, [load.id]: { rpm, total: rpm * load.tripMiles, at: Date.now() } })
                }
              />
            )}
            {work?.loadId === load.id && work.kind === 'email' && (
              <EmailDraft key={work.run} load={load} fit={fit} truck={truck} claudeKey={claudeKey ?? ''} />
            )}

            <ChainHint chain={chain} onOpen={(id) => selectionItem.setValue({ ...selection, loadId: id, at: Date.now() })} />
            <MathDisclosure load={load} fit={fit} truck={truck} costs={costs} />
          </>
        )}
      </main>

      <footer className="border-t border-line px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
        Demo data: truck position and hours are a mock of Class8's ELD feed; lane rates are a mock benchmark. The Voice AI call is simulated.
      </footer>
    </div>
  );
}

function Empty() {
  return (
    <div className="pt-10 text-center">
      <MousePointerClick size={28} aria-hidden="true" className="mx-auto text-purple" />
      <h1 className="mt-3 text-base font-semibold">Pick a load on the board</h1>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-ink-soft">
        Class8 checks it against your truck's live location, driving hours, and costs, then tells you if it's worth taking.
      </p>
    </div>
  );
}
