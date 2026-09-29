import { ArrowDownWideNarrow, Clock, ListRestart, Truck as TruckIcon } from 'lucide-react';
import { duration } from '../lib/format';
import type { Truck } from '../lib/types';

interface Props {
  truck: Truck;
  trucks: Truck[];
  worthIt: number; // loads that aren't a skip
  total: number;
  sorted: boolean;
  onTruck(id: string): void;
  onSort(): void;
}

export function CopilotBar({ truck, trucks, worthIt, total, sorted, onTruck, onSort }: Props) {
  const hours = truck.hos ? Math.min(truck.hos.driveLeftMin, truck.hos.windowLeftMin) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-navy px-4 py-2.5 text-sm text-violet" role="region" aria-label="Class8 Copilot">
      <span className="display text-lg leading-none text-white">
        Class8 <span className="text-purple-light">Copilot</span>
      </span>

      <label className="inline-flex items-center gap-2">
        <TruckIcon size={16} aria-hidden="true" />
        <span className="sr-only">Truck</span>
        <select
          value={truck.id}
          onChange={(e) => onTruck(e.target.value)}
          className="rounded-md border border-purple bg-navy px-2 py-1 text-sm text-white"
        >
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              Truck {t.unit} · {t.driver} · {t.location.city}, {t.location.state}
            </option>
          ))}
        </select>
      </label>

      <span className="inline-flex items-center gap-1.5">
        <Clock size={16} aria-hidden="true" />
        {hours == null ? 'Hours unknown (ELD offline)' : hours === 0 ? 'Out of hours today' : `${duration(hours)} of driving left`}
      </span>

      <span className="num text-violet">
        {worthIt} of {total} loads work for this truck
      </span>

      <button
        type="button"
        onClick={onSort}
        aria-pressed={sorted}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-purple px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-purple"
      >
        {sorted ? <ListRestart size={14} aria-hidden="true" /> : <ArrowDownWideNarrow size={14} aria-hidden="true" />}
        {sorted ? 'Board order' : 'Best first'}
      </button>
    </div>
  );
}
