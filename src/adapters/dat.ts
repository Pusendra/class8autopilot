import type { LoadBoardAdapter } from './types';

/**
 * DAT One adapter — intentionally a stub.
 *
 * Reading a customer's own DAT session in their own browser is how extensions
 * like Numeo Spot work, but the selectors are not public and we don't have a
 * DAT account to build against. The real version would:
 *   1. match one.dat.com/search-loads*
 *   2. wait for the results grid (it renders async — MutationObserver)
 *   3. read origin / destination / pickup / equipment / trip / rate / contact
 *      from each result row, exactly like demoBoard.ts
 * Everything downstream (scoring, side panel, Voice AI handoff) is unchanged.
 */
export const datAdapter: LoadBoardAdapter = {
  id: 'dat',
  name: 'DAT One',
  matches: (url) => url.hostname === 'one.dat.com' && false, // disabled until built against a real account
  findTable: () => null,
  findRows: () => [],
  parseRow: () => null,
};
