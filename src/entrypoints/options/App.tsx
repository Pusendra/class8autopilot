import { useEffect, useState } from 'react';
import { DEFAULT_COSTS } from '../../lib/score';
import { claudeKeyItem, costsItem } from '../../lib/state';
import type { CostSettings } from '../../lib/types';
import { Wordmark } from '../../ui/Wordmark';

const FIELDS: { key: keyof CostSettings; label: string; hint: string; step: string }[] = [
  { key: 'fuelPrice', label: 'Diesel price ($/gal)', hint: 'Used with each truck’s fuel economy from the ELD.', step: '0.01' },
  { key: 'driverPayPerMile', label: 'Driver pay ($/mi)', hint: 'Paid on every mile, empty or loaded.', step: '0.01' },
  { key: 'fixedCostPerMile', label: 'Truck costs ($/mi)', hint: 'Payment, insurance, maintenance.', step: '0.01' },
];

export function App() {
  const [costs, setCosts] = useState<CostSettings>(DEFAULT_COSTS);
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    costsItem.getValue().then(setCosts);
    claudeKeyItem.getValue().then(setKey);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = FIELDS.find((f) => !(costs[f.key] > 0));
    if (bad) {
      setError(`Enter a number above 0 for ${bad.label.toLowerCase()}.`);
      return;
    }
    if (key && !key.startsWith('sk-ant-')) {
      setError('That doesn’t look like a Claude API key. Keys start with sk-ant-.');
      return;
    }
    setError(null);
    await Promise.all([costsItem.setValue(costs), claudeKeyItem.setValue(key.trim())]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-lg space-y-6 p-8">
      <header>
        <Wordmark className="text-2xl" />
        <h1 className="mt-2 text-lg font-semibold">Settings</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Your costs</h2>
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-semibold">{f.label}</span>
            <input
              type="number"
              min="0"
              step={f.step}
              value={costs[f.key]}
              onChange={(e) => setCosts({ ...costs, [f.key]: Number(e.target.value) })}
              className="num mt-1 block w-40 rounded-lg border border-line px-3 py-2 text-sm focus:border-purple focus:outline-none"
            />
            <span className="mt-1 block text-xs text-ink-soft">{f.hint}</span>
          </label>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">AI email drafts (optional)</h2>
        <label className="block">
          <span className="text-sm font-semibold">Claude API key</span>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-…"
            className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-purple focus:outline-none"
          />
          <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
            Stored only in this browser and sent only to Anthropic. Without a key, Copilot uses its built-in draft.
          </span>
        </label>
      </section>

      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary">
          Save settings
        </button>
        <span role="status" className="text-sm text-good">
          {saved ? 'Saved' : ''}
        </span>
      </div>
    </form>
  );
}
