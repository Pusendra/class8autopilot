import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_MODEL = 'claude-opus-5-5';

/**
 * Draft a negotiation email with Claude. Called only from the extension's own
 * side panel with a key the user pasted into Settings, so the key never
 * touches the load board page. Throws on any API problem; callers fall back
 * to the template.
 */
export async function claudeEmail(apiKey: string, prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 30_000 });

  const response = await client.beta.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    output_config: { effort: 'low' }, // a short email doesn't need deep reasoning
    // Re-run on a fallback model if a safety classifier declines.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.stop_reason === 'refusal') throw new Error('Claude declined to draft this email');

  const text = response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('')
    .trim();
  if (!text) throw new Error('Claude returned an empty draft');
  return text;
}

/** Plain-language message for the side panel. Never shows raw exception text. */
export function describeClaudeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return 'Your Claude API key was rejected. Check it in Settings.';
  if (err instanceof Anthropic.RateLimitError) return 'Claude is rate limited right now.';
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach Claude.";
  if (err instanceof Anthropic.APIError) return `Claude returned an error (${err.status}).`;
  return 'Claude could not draft this email.';
}
