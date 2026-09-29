# Class8 Copilot

Chrome extension (WXT, MV3, React 19, TypeScript, Tailwind 3) — a job-application demo for Class8.
Scores load-board loads using (mock) Class8 ELD truck data; side panel hands off to (simulated) Voice AI.

- `npm test` (Jest, logic + adapter) · `npm run build` · `npm run board` (demo board :5174) · `npm run e2e` (needs a build first)
- All numbers come from pure functions in `src/lib`; keep UI free of math.
- Adapters must ignore cells marked `data-c8` (the ones we inject).
- Brand tokens live in `src/ui/tokens.css`; components use Tailwind names (navy, purple, coral, good/warn/bad), never raw hex.
- `<td>` can't host a shadow root — mount into a span inside it.
- Claude calls use `@anthropic-ai/sdk` from the side panel only (`src/lib/claude.ts`), model `claude-opus-5-5`.
