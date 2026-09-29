import { storage } from 'wxt/utils/storage';
import { DEFAULT_COSTS } from './score';
import type { CostSettings, Load } from './types';

/** Loads cross extension contexts as JSON, so dates travel as ISO strings. */
export type WireLoad = Omit<Load, 'pickupStart' | 'pickupEnd'> & { pickupStart: string; pickupEnd: string };

export const toWire = (l: Load): WireLoad => ({ ...l, pickupStart: l.pickupStart.toISOString(), pickupEnd: l.pickupEnd.toISOString() });
export const fromWire = (l: WireLoad): Load => ({ ...l, pickupStart: new Date(l.pickupStart), pickupEnd: new Date(l.pickupEnd) });

export interface Selection {
  loadId: string;
  loads: WireLoad[]; // everything on the board, for "Chain it"
  board: string;
  at: number;
}

export interface Booking {
  rpm: number;
  total: number;
  at: number;
}

export const truckIdItem = storage.defineItem<string>('local:truckId', { fallback: 't214' });
export const enabledItem = storage.defineItem<boolean>('local:enabled', { fallback: true });
export const costsItem = storage.defineItem<CostSettings>('local:costs', { fallback: DEFAULT_COSTS });
export const claudeKeyItem = storage.defineItem<string>('local:claudeKey', { fallback: '' });
export const bookedItem = storage.defineItem<Record<string, Booking>>('local:booked', { fallback: {} });
export const selectionItem = storage.defineItem<Selection | null>('session:selection', { fallback: null });

/** Messages from the content script to the background worker. */
export type Message = { type: 'open-load'; selection: Omit<Selection, 'at'> };
