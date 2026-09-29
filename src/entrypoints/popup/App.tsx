import { ExternalLink, Settings } from 'lucide-react';
import { browser } from 'wxt/browser';
import { TRUCKS } from '../../data/trucks';
import { duration } from '../../lib/format';
import { enabledItem, truckIdItem } from '../../lib/state';
import { useItem } from '../../ui/useItem';
import { Wordmark } from '../../ui/Wordmark';

export function App() {
  const truckId = useItem(truckIdItem);
  const enabled = useItem(enabledItem);

  return (
    <div className="w-[340px] p-4">
      <Wordmark className="text-xl" />
      <p className="mt-1 text-xs text-ink-soft">Know if your truck should take the load, right inside the load board.</p>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Your truck</legend>
        <div className="mt-2 space-y-1.5">
          {TRUCKS.map((t) => {
            const hours = t.hos ? Math.min(t.hos.driveLeftMin, t.hos.windowLeftMin) : null;
            const checked = truckId === t.id;
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-150 ${checked ? 'border-purple bg-violet' : 'border-line hover:bg-wash'}`}
              >
                <input
                  type="radio"
                  name="truck"
                  className="mt-1 accent-[var(--c8-purple)]"
                  checked={checked}
                  onChange={() => truckIdItem.setValue(t.id)}
                />
                <span className="text-sm">
                  <span className="font-semibold">
                    Truck {t.unit} · {t.driver}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {t.location.city}, {t.location.state} · {t.equipment} ·{' '}
                    {hours == null ? 'ELD offline' : `${duration(hours)} driving left`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-sm">
        Show Class8 on load boards
        <input
          type="checkbox"
          role="switch"
          className="h-5 w-5 accent-[var(--c8-purple)]"
          checked={enabled ?? true}
          onChange={(e) => enabledItem.setValue(e.target.checked)}
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button type="button" className="btn btn-primary flex-1" onClick={() => browser.tabs.create({ url: __BOARD_URL__ })}>
          <ExternalLink size={16} aria-hidden="true" /> Open demo load board
        </button>
        <button type="button" className="btn" aria-label="Settings" title="Settings" onClick={() => browser.runtime.openOptionsPage()}>
          <Settings size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
