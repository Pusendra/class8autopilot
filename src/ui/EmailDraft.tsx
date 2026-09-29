import { Copy, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { browser } from 'wxt/browser';
import { useCallback, useEffect, useState } from 'react';
import { claudeEmail, describeClaudeError } from '../lib/claude';
import { emailPrompt, templateEmail } from '../lib/negotiate';
import type { Fit, Load, Truck } from '../lib/types';

type Source = 'claude' | 'template';

export function EmailDraft({ load, fit, truck, claudeKey }: { load: Load; fit: Fit; truck: Truck; claudeKey: string }) {
  const template = templateEmail(load, fit, truck);
  const [body, setBody] = useState(template.body);
  const [source, setSource] = useState<Source>('template');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const draft = useCallback(async () => {
    setNotice(null);
    if (!claudeKey) {
      setBody(templateEmail(load, fit, truck).body);
      setSource('template');
      return;
    }
    setBusy(true);
    try {
      setBody(await claudeEmail(claudeKey, emailPrompt(load, fit, truck)));
      setSource('claude');
    } catch (err) {
      setBody(templateEmail(load, fit, truck).body);
      setSource('template');
      setNotice(`${describeClaudeError(err)} Showing the built-in draft.`);
    } finally {
      setBusy(false);
    }
  }, [claudeKey, load, fit, truck]);

  useEffect(() => {
    void draft();
    // Draft once per load; Regenerate asks again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.id]);

  const mailto = `mailto:${load.broker.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section className="rounded-lg border border-line p-3" aria-label="Negotiation email">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet px-2.5 py-1 text-xs font-semibold text-purple-dark">
          <Sparkles size={13} aria-hidden="true" />
          {source === 'claude' ? 'Drafted by Claude · edit freely' : 'Built-in draft · edit freely'}
        </span>
        <button type="button" className="btn btn-sm ml-auto" onClick={() => void draft()} disabled={busy}>
          <RefreshCw size={13} aria-hidden="true" className={busy ? 'animate-spin' : ''} />
          {busy ? 'Drafting…' : 'Regenerate'}
        </button>
      </div>

      {notice && <p className="mt-2 text-xs text-warn">{notice}</p>}
      {!claudeKey && (
        <p className="mt-2 text-xs text-ink-soft">
          Add a Claude API key in{' '}
          <button type="button" className="font-semibold text-purple underline-offset-2 hover:underline" onClick={() => browser.runtime.openOptionsPage()}>
            Settings
          </button>{' '}
          for AI-written drafts.
        </p>
      )}

      <label className="mt-3 block">
        <span className="text-xs text-ink-soft">To {load.broker.email}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-busy={busy}
          rows={10}
          className="mt-1 w-full resize-y rounded-lg border border-line p-3 text-sm leading-relaxed text-ink focus:border-purple focus:outline-none"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <a className="btn btn-primary btn-sm" href={mailto}>
          <Mail size={14} aria-hidden="true" /> Open in email
        </a>
        <button
          type="button"
          className="btn btn-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(body);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <Copy size={14} aria-hidden="true" /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  );
}
