import { AlertTriangle, CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import type { Tone } from '../lib/types';

/** Status is never color alone: every tone has its own icon and a text label. */
export const TONE_ICON = { good: CheckCircle2, neutral: CircleHelp, warn: AlertTriangle, bad: XCircle } as const;

export const TONE_CLASS: Record<Tone, string> = {
  good: 'bg-good-bg text-good',
  neutral: 'bg-violet text-purple-dark',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
};

export function StatusPill({ tone, label, className = '' }: { tone: Tone; label: string; className?: string }) {
  const Icon = TONE_ICON[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[tone]} ${className}`}>
      <Icon size={14} aria-hidden="true" strokeWidth={2.25} />
      {label}
    </span>
  );
}
