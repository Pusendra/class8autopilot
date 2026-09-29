import { datAdapter } from './dat';
import { demoBoardAdapter } from './demoBoard';
import type { LoadBoardAdapter } from './types';

export const ADAPTERS: LoadBoardAdapter[] = [demoBoardAdapter, datAdapter];

export const findAdapter = (url: URL, doc: Document) => ADAPTERS.find((a) => a.matches(url, doc)) ?? null;
