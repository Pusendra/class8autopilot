import type { Load } from '../lib/types';

/**
 * One adapter per load board. The content script only talks to this
 * interface, so supporting DAT or Truckstop means writing one more file.
 */
export interface LoadBoardAdapter {
  id: string;
  name: string;
  matches(url: URL, doc: Document): boolean;
  /** The results table, once it exists. */
  findTable(doc: Document): HTMLTableElement | null;
  findRows(table: HTMLTableElement): HTMLTableRowElement[];
  /** Read one row into a Load. Returns null for rows we can't understand. */
  parseRow(row: HTMLTableRowElement, now: Date): Load | null;
}
