# How AI was used to build this

The job post asks for an AI-first engineer who still owns the code. This is an honest account of how that went here.

## What Claude Code did
- **Research first.** It read class8.com, the Daimler / Volvo / Mack announcements, stopcallingbrokers.com, and competitor extensions (Numeo Spot, Loadex, LoadConnect). The research found the gap this project targets: every load-board extension scores loads without knowing where the truck is or how many driving hours it has left. Class8 does know, because its ELD is built into the truck.
- **Design before code.** Two clickable prototypes came before any build. The second used Class8's real brand tokens, which were pulled from their Webflow stylesheet (`#01031E`, `#5F48F5`, `#FD4747`, Anton and Sora). It was shaped by two UI skills: a design-system search tool and a UX-guidelines reference. That round is why each row shows one verdict, why the side panel has one primary action, and why the math sits behind a disclosure.
- **Implementation:** the scoring engine, driving-hours check, chaining, adapter layer, React UI and tests.

## What I reviewed and changed
- **Negotiation copy.** The first email asked a broker for more money on a load that already paid 14% above market. No dispatcher would send that. The template now accepts the posted rate politely and only asks for a nudge to cover empty miles.
- **The simulated call.** At first the broker "came back" at exactly our ask, because both numbers were rounded up to the nearest nickel. The agreement now rounds down and always lands below the ask.
- **Sort order.** "Best first" originally ranked a Skip (44) above a Tight (29). Skips now always sink.
- **Shadow DOM.** The first build tried to attach shadow roots to `<td>` elements, which the browser doesn't allow. Chips now mount in a `<span>` host inside the cell.
- **Tests.** An edge-case test first put the truck in the same city as the pickup, so it "passed" for the wrong reason. The test now moves the pickup so the driving-hours rule is actually exercised.

## Guardrails I kept
- Every number the UI shows comes from pure functions in `src/lib`, and each is covered by Jest.
- The Playwright smoke test loads the real built extension into Chromium and runs axe for accessibility on every extension page.
- The Claude key lives only in `chrome.storage.local` and is used only from the extension's side panel, never on the load-board page. If Claude fails, the side panel quietly falls back to the built-in template.
