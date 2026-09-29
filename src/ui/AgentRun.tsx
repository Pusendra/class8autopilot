import { Check, CheckCheck, Circle, Loader2, PhoneCall } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { money, perMile } from '../lib/format';
import { simulatedAgreement, targetRpm } from '../lib/negotiate';
import type { Fit, Load } from '../lib/types';

type Phase = 'running' | 'waiting' | 'booked' | 'declined' | 'cancelled';

interface Step {
  title: string;
  said: string;
}

const STEP_MS = 1100;

/**
 * A stand-in for Class8's Voice AI: shows each step as it happens, can be
 * cancelled at any point, and never books without an explicit approval.
 */
export function AgentRun({ load, fit, onBook, onClose }: { load: Load; fit: Fit; onBook(rpm: number): void; onClose(): void }) {
  const start = fit.postedRpm ?? fit.marketRpm;
  const ask = targetRpm(load, fit);
  const [agreed, setAgreed] = useState(simulatedAgreement(load, fit));
  const [steps, setSteps] = useState<Step[]>(() => [
    {
      title: `Calling ${load.broker.name}`,
      said: `${load.broker.phone} · "Hi, this is Class8 calling for Lone Star Carriers about your ${load.origin.city} to ${load.destination.city} load."`,
    },
    {
      title: 'Confirming the details',
      said: `Pickup window, ${load.weightLbs?.toLocaleString('en-US') ?? '—'} lbs, ${load.equipment.toLowerCase()} — confirmed.`,
    },
    {
      title: 'Negotiating the rate',
      said: `${fit.rateSource === 'posted' ? `Posted ${perMile(start)}` : 'No rate posted'}. Asked ${perMile(ask)}. Broker came back at ${perMile(agreed)}.`,
    },
  ]);
  const [done, setDone] = useState(0); // steps completed
  const [phase, setPhase] = useState<Phase>('running');
  const timers = useRef<number[]>([]);

  const run = (from: number, total: number) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    for (let i = from; i < total; i++) {
      timers.current.push(window.setTimeout(() => setDone(i + 1), STEP_MS * (i - from + 1)));
    }
    timers.current.push(window.setTimeout(() => setPhase('waiting'), STEP_MS * (total - from) + 150));
  };

  useEffect(() => {
    run(0, steps.length);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    timers.current.forEach(clearTimeout);
    setPhase('cancelled');
  };

  const counter = () => {
    const counterRpm = Math.round((agreed + 0.1) * 100) / 100;
    const met = Math.round(((agreed + counterRpm) / 2) * 20) / 20;
    setSteps((s) => [...s, { title: `Countering at ${perMile(counterRpm)}`, said: `Broker met in the middle at ${perMile(met)}.` }]);
    setAgreed(met);
    setPhase('running');
    run(steps.length, steps.length + 1);
  };

  const status =
    phase === 'running'
      ? steps[Math.min(done, steps.length - 1)].title
      : phase === 'waiting'
        ? `Broker agreed to ${perMile(agreed)}. Waiting for your approval.`
        : phase === 'booked'
          ? 'Load booked.'
          : phase === 'declined'
            ? 'Declined. Nothing was booked.'
            : 'Call cancelled. Nothing was booked.';

  return (
    <section className="rounded-lg border border-line p-3" aria-label="Class8 Voice AI call">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet px-2.5 py-1 text-xs font-semibold text-purple-dark">
          <PhoneCall size={13} aria-hidden="true" /> Class8 Voice AI · simulated
        </span>
        {phase === 'running' && (
          <button type="button" className="btn btn-sm ml-auto" onClick={cancel}>
            Cancel call
          </button>
        )}
        {(phase === 'cancelled' || phase === 'declined') && (
          <button type="button" className="btn btn-sm ml-auto" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => {
          const state = i < done ? 'done' : i === done && phase === 'running' ? 'active' : 'todo';
          return (
            <li key={i} className={`flex gap-2.5 text-sm ${state === 'todo' ? 'text-ink-soft opacity-70' : 'text-ink'}`}>
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                {state === 'done' ? (
                  <Check size={16} className="text-good" />
                ) : state === 'active' ? (
                  <Loader2 size={16} className="animate-spin text-purple" />
                ) : (
                  <Circle size={16} className="text-line" />
                )}
              </span>
              <div>
                <div className={state === 'active' ? 'font-semibold text-purple' : 'font-semibold'}>{s.title}</div>
                {state === 'done' && <div className="mt-0.5 text-xs leading-relaxed text-ink-soft">{s.said}</div>}
              </div>
            </li>
          );
        })}
      </ol>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {phase === 'waiting' && (
        <div className="mt-3 rounded-lg bg-wash p-3">
          <p className="text-sm">
            Broker agreed to <span className="num font-semibold">{perMile(agreed)}</span> ({money(agreed * load.tripMiles)}). Book it?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPhase('booked');
                onBook(agreed);
              }}
            >
              Approve and book
            </button>
            <button type="button" className="btn" onClick={counter}>
              Counter
            </button>
            <button type="button" className="btn" onClick={() => setPhase('declined')}>
              Decline
            </button>
          </div>
        </div>
      )}

      {phase === 'booked' && (
        <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-good">
          <CheckCheck size={18} aria-hidden="true" className="shrink-0" />
          Booked at {perMile(agreed)} ({money(agreed * load.tripMiles)}). Rate confirmation sent to dispatch · Class8 fee $3.
        </p>
      )}
      {(phase === 'cancelled' || phase === 'declined') && <p className="mt-3 text-sm text-ink-soft">{status}</p>}
    </section>
  );
}
