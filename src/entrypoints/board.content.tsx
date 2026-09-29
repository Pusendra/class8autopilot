import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { findAdapter } from '../adapters';
import type { LoadBoardAdapter } from '../adapters/types';
import { TRUCKS, findTruck } from '../data/trucks';
import { scoreLoad, topPick } from '../lib/score';
import { bookedItem, costsItem, enabledItem, toWire, truckIdItem, type Booking, type Message } from '../lib/state';
import type { CostSettings, Fit, Load, Truck } from '../lib/types';
import { CopilotBar } from '../ui/CopilotBar';
import { FitChip } from '../ui/FitChip';
import css from '../ui/tokens.css?inline';

export default defineContentScript({
  // The demo board in dev and on GitHub Pages. Real boards get their own adapter.
  matches: ['http://localhost/*', 'http://127.0.0.1/*', 'https://*.github.io/*'],
  runAt: 'document_idle',
  async main() {
    const adapter = findAdapter(new URL(location.href), document);
    if (!adapter) return;
    const table = adapter.findTable(document);
    if (!table) return;
    new BoardCopilot(adapter, table).start();
  },
});

// ---------------------------------------------------------------------------

interface State {
  truck: Truck;
  costs: CostSettings;
  fits: Record<string, Fit | null>;
  topId: string | null;
  sorted: boolean;
  selectedId: string | null;
  booked: Record<string, Booking>;
}

function createStore<T extends object>(initial: T) {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(patch: Partial<T>) {
      state = { ...state, ...patch };
      subs.forEach((f) => f());
    },
    subscribe(f: () => void) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

/** Page-level styles for the rows themselves (outside our shadow roots). */
const PAGE_CSS = `
  html[data-c8-off] [data-c8] { display: none !important; }
  tr[data-c8-top] > td:first-child { box-shadow: inset 4px 0 0 #fd4747; }
  tr[data-c8-selected] > td { background: #e7defd !important; }
  [data-c8-col] { width: 1%; white-space: nowrap; }
`;

const FONTS: [family: string, file: string, weight: string][] = [
  ['Sora', 'sora-latin-400-normal.woff2', '400'],
  ['Sora', 'sora-latin-600-normal.woff2', '600'],
  ['Anton', 'anton-latin-400-normal.woff2', '400'],
];

class BoardCopilot {
  private loads = new Map<string, Load>();
  private rows = new Map<string, HTMLTableRowElement>();
  private boardOrder: HTMLTableRowElement[] = [];
  private sheet: CSSStyleSheet | null = null;
  private store = createStore<State>({
    truck: TRUCKS[0],
    costs: costsItem.fallback,
    fits: {},
    topId: null,
    sorted: false,
    selectedId: null,
    booked: {},
  });

  constructor(
    private adapter: LoadBoardAdapter,
    private table: HTMLTableElement,
  ) {}

  async start() {
    const [truckId, costs, booked, enabled] = await Promise.all([
      truckIdItem.getValue(),
      costsItem.getValue(),
      bookedItem.getValue(),
      enabledItem.getValue(),
    ]);
    this.store.set({ truck: findTruck(truckId), costs, booked });
    this.setEnabled(enabled);

    this.injectPageStyles();
    this.mountBar();
    this.addHeaderCell();
    this.adapter.findRows(this.table).forEach((r) => this.adopt(r));
    this.rescore();

    truckIdItem.watch((id) => {
      this.store.set({ truck: findTruck(id) });
      this.rescore();
    });
    costsItem.watch((c) => {
      this.store.set({ costs: c });
      this.rescore();
    });
    bookedItem.watch((b) => this.store.set({ booked: b }));
    enabledItem.watch((on) => this.setEnabled(on));

    // Boards add and remove rows as new loads post; keep up without a reload.
    new MutationObserver(() => this.sync()).observe(this.table.tBodies[0], { childList: true });
  }

  // --- rows -----------------------------------------------------------------

  private sync() {
    let changed = false;
    for (const [id, row] of this.rows) {
      if (!row.isConnected) {
        this.rows.delete(id);
        this.loads.delete(id);
        this.boardOrder = this.boardOrder.filter((r) => r !== row);
        changed = true;
      }
    }
    for (const row of this.adapter.findRows(this.table)) {
      if (!this.rows.has(row.dataset.loadId!)) {
        this.adopt(row, true);
        changed = true;
      }
    }
    if (changed) this.rescore();
  }

  /** Read a row, remember it, and give it a Class8 cell. */
  private adopt(row: HTMLTableRowElement, isNew = false) {
    const load = this.adapter.parseRow(row, new Date());
    const id = row.dataset.loadId!;
    this.rows.set(id, row);
    if (load) this.loads.set(id, load);
    if (isNew) this.boardOrder.unshift(row);
    else this.boardOrder.push(row);

    const td = document.createElement('td');
    td.dataset.c8 = '';
    td.dataset.c8Col = '';
    row.insertBefore(td, row.cells[0] ?? null);
    const host = td.appendChild(document.createElement('span')); // <td> can't host a shadow root
    this.mount(host, <Chip id={id} store={this.store} onOpen={() => this.open(id)} />);

    // Clicking anywhere on the row opens it too (but not the phone/email links).
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a, button, input, select') || e.composedPath().includes(host)) return;
      this.open(id);
    });
    row.style.cursor = 'pointer';
  }

  private rescore() {
    const { truck, costs, sorted } = this.store.get();
    const now = new Date();
    const fits: Record<string, Fit | null> = {};
    for (const id of this.rows.keys()) {
      const load = this.loads.get(id);
      fits[id] = load ? scoreLoad(load, truck, costs, now) : null;
    }
    const top = topPick(Object.values(fits).filter((f): f is Fit => !!f));
    this.store.set({ fits, topId: top?.loadId ?? null });

    for (const [id, row] of this.rows) {
      row.toggleAttribute('data-c8-top', id === top?.loadId);
    }
    if (sorted) this.applyOrder(true);
  }

  private applyOrder(sorted: boolean) {
    const body = this.table.tBodies[0];
    const { fits } = this.store.get();
    const rows = [...this.boardOrder];
    // Skips always sink below loads worth taking, whatever their score.
    const rank = (r: HTMLTableRowElement) => {
      const f = fits[r.dataset.loadId!];
      return !f ? -1000 : f.verdict === 'skip' ? f.score - 500 : f.score;
    };
    if (sorted) rows.sort((a, b) => rank(b) - rank(a));
    rows.forEach((r) => body.appendChild(r));
  }

  private toggleSort() {
    const sorted = !this.store.get().sorted;
    this.store.set({ sorted });
    this.applyOrder(sorted);
  }

  // --- side panel -----------------------------------------------------------

  private open(id: string) {
    const message: Message = {
      type: 'open-load',
      selection: { loadId: id, loads: [...this.loads.values()].map(toWire), board: location.href },
    };
    // Must be sent straight from the click: Chrome only opens the side panel on a user gesture.
    void browser.runtime.sendMessage(message);
    const prev = this.store.get().selectedId;
    if (prev) this.rows.get(prev)?.removeAttribute('data-c8-selected');
    this.rows.get(id)?.setAttribute('data-c8-selected', '');
    this.store.set({ selectedId: id });
  }

  // --- mounting -------------------------------------------------------------

  private setEnabled(on: boolean) {
    document.documentElement.toggleAttribute('data-c8-off', !on);
  }

  private injectPageStyles() {
    const style = document.createElement('style');
    style.dataset.c8Styles = '';
    style.textContent = PAGE_CSS;
    document.head.appendChild(style);
    // @font-face doesn't work inside a shadow root, so fonts register on the page.
    for (const [family, file, weight] of FONTS) {
      const url = browser.runtime.getURL(`/fonts/${file}` as '/fonts/sora-latin-400-normal.woff2');
      const face = new FontFace(family, `url(${url})`, { weight, display: 'swap' });
      document.fonts.add(face);
      face.load().catch(() => {});
    }
  }

  private mountBar() {
    const host = document.createElement('div');
    host.dataset.c8 = '';
    this.table.before(host);
    this.mount(
      host,
      <Bar
        store={this.store}
        onTruck={(id) => truckIdItem.setValue(id)}
        onSort={() => this.toggleSort()}
      />,
    );
  }

  private addHeaderCell() {
    const th = document.createElement('th');
    th.dataset.c8 = '';
    th.dataset.c8Col = '';
    th.textContent = 'Class8';
    th.style.color = '#5f48f5';
    const headRow = this.table.tHead?.rows[0];
    headRow?.insertBefore(th, headRow.cells[0] ?? null);
  }

  /** Render React into a shadow root so the board's CSS and ours never collide. */
  private mount(host: HTMLElement, node: ReactNode) {
    const shadow = host.attachShadow({ mode: 'open' });
    try {
      this.sheet ??= (() => {
        const s = new CSSStyleSheet();
        s.replaceSync(css);
        return s;
      })();
      shadow.adoptedStyleSheets = [this.sheet];
    } catch {
      const style = document.createElement('style');
      style.textContent = css;
      shadow.appendChild(style);
    }
    const root = document.createElement('div');
    shadow.appendChild(root);
    createRoot(root).render(node);
  }
}

// --- connected components ----------------------------------------------------

type Store = ReturnType<typeof createStore<State>>;
const useStore = (store: Store) => useSyncExternalStore(store.subscribe, store.get);

function Chip({ id, store, onOpen }: { id: string; store: Store; onOpen(): void }) {
  const s = useStore(store);
  return <FitChip fit={s.fits[id] ?? null} isTop={s.topId === id} booking={s.booked[id]} selected={s.selectedId === id} onOpen={onOpen} />;
}

function Bar({ store, onTruck, onSort }: { store: Store; onTruck(id: string): void; onSort(): void }) {
  const s = useStore(store);
  const fits = Object.values(s.fits);
  const worthIt = fits.filter((f) => f && f.verdict !== 'skip').length;
  return <CopilotBar truck={s.truck} trucks={TRUCKS} worthIt={worthIt} total={fits.length} sorted={s.sorted} onTruck={onTruck} onSort={onSort} />;
}
