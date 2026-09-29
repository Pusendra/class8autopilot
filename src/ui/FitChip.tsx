import { CheckCheck } from 'lucide-react';
import type { Booking } from '../lib/state';
import type { Fit } from '../lib/types';
import { TONE_CLASS, TONE_ICON } from './status';

interface Props {
  fit: Fit | null; // null = row we couldn't read
  isTop: boolean;
  booking?: Booking;
  selected: boolean;
  onOpen(): void;
}

/** The one thing we add to each board row: a verdict you can click. */
export function FitChip({ fit, isTop, booking, selected, onOpen }: Props) {
  if (!fit) {
    return <span className="text-xs text-ink-soft">Can't read this row</span>;
  }
  if (booking) {
    return (
      <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">
        <CheckCheck size={14} aria-hidden="true" /> Booked
      </button>
    );
  }
  const Icon = TONE_ICON[fit.tone];
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={selected}
        aria-label={`${fit.label}, Class8 score ${fit.score}${isTop ? ', top pick' : ''}. Open details`}
        className={`inline-flex min-h-[28px] items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-2.5 pr-1 text-xs font-semibold transition-shadow duration-150 hover:shadow-[0_0_0_2px_var(--c8-purple-light)] ${TONE_CLASS[fit.tone]} ${selected ? 'shadow-[0_0_0_2px_var(--c8-purple)]' : ''}`}
      >
        <Icon size={14} aria-hidden="true" strokeWidth={2.25} />
        {fit.label}
        <span className="num ml-0.5 rounded-full bg-white px-1.5 py-px text-[11px] text-purple">{fit.score}</span>
      </button>
      {isTop && (
        <span className="whitespace-nowrap rounded bg-coral px-1.5 py-px text-[11px] font-semibold text-navy">Top pick</span>
      )}
    </span>
  );
}
