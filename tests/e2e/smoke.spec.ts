import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

// Run `npm run build` first. Loads the built extension into Chromium.
const EXT = resolve('.output/chrome-mv3');
const SHOTS = resolve('docs/screenshots');

let context: BrowserContext;
let extensionId: string;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'c8-')), {
    channel: 'chromium',
    viewport: { width: 1440, height: 900 },
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  extensionId = new URL(worker.url()).host;
});

test.afterAll(async () => context?.close());

const chips = (page: Page) => page.locator('td[data-c8-col] > span');

test('adds a Class8 verdict to every load and marks the top pick', async () => {
  const page = await context.newPage();
  await page.goto('http://localhost:5174/');
  await expect(page.getByRole('region', { name: 'Class8 Copilot' })).toBeVisible();

  const rowCount = await page.locator('#loads tbody tr').count();
  await expect(chips(page)).toHaveCount(rowCount);
  await expect(page.locator('tr[data-c8-top]')).toHaveCount(1);
  await expect(page.getByText('Top pick')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/board.png` });

  // Best first puts the top pick in the first row.
  const topId = await page.locator('tr[data-c8-top]').getAttribute('data-load-id');
  await page.getByRole('button', { name: 'Best first' }).click();
  await expect(page.locator('#loads tbody tr').first()).toHaveAttribute('data-load-id', topId!);
  await page.screenshot({ path: `${SHOTS}/board-sorted.png` });

  // New posts get scored without a reload.
  await page.getByRole('button', { name: 'Refresh results' }).click();
  await expect(chips(page)).toHaveCount(rowCount + 1);

  // Switching trucks rescores: Aisha has 50 min of driving left.
  await page.getByRole('combobox').selectOption('t118');
  await expect(page.getByText('50m of driving left')).toBeVisible();
  await page.close();
});

test('side panel: verdict, math, Voice AI approval, email draft', async () => {
  // The side panel page, driven directly with a selection like the board sends.
  const board = await context.newPage();
  await board.goto('http://localhost:5174/');
  await expect(chips(board)).not.toHaveCount(0);
  const worker = context.serviceWorkers()[0];
  await worker.evaluate(() => chrome.storage.local.set({ truckId: 't214', booked: {} }));

  const panel = await context.newPage();
  await panel.setViewportSize({ width: 400, height: 1150 });
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(panel.getByText('Pick a load on the board')).toBeVisible();
  await panel.waitForTimeout(300);
  await panel.screenshot({ path: `${SHOTS}/panel-empty.png` });

  // Click the Memphis load's chip on the board → selection lands in session storage.
  await board.bringToFront();
  await board.locator('tr[data-load-id="LL-48213"] td[data-c8-col] button').first().click();
  await panel.bringToFront();
  await expect(panel.getByRole('heading', { level: 1 })).toContainText('profit');
  await expect(panel.getByText('Dallas, TX → Memphis, TN')).toBeVisible();
  await panel.getByText('See the math').click();
  await panel.waitForTimeout(300);
  await panel.screenshot({ path: `${SHOTS}/panel-verdict.png` });

  // Voice AI: runs its steps, stops for approval, books only on approve.
  await panel.getByRole('button', { name: 'Let Class8 call' }).click();
  await expect(panel.getByRole('button', { name: 'Approve and book' })).toBeVisible({ timeout: 10_000 });
  await panel.screenshot({ path: `${SHOTS}/panel-voice-ai.png` });
  await panel.getByRole('button', { name: 'Approve and book' }).click();
  await expect(panel.getByText(/Booked at/).first()).toBeVisible();
  await board.bringToFront();
  await expect(board.locator('tr[data-load-id="LL-48213"]').getByText('Booked')).toBeVisible();

  // Email draft without a key falls back to the built-in template.
  await panel.bringToFront();
  await board.locator('tr[data-load-id="LL-48181"] td[data-c8-col] button').first().click();
  await panel.getByRole('button', { name: 'Draft email' }).click();
  await expect(panel.getByText('Built-in draft · edit freely')).toBeVisible();
  await expect(panel.getByRole('textbox')).toContainText('Truck 214');
  await panel.screenshot({ path: `${SHOTS}/panel-email.png` });
});

test('cancel stops the call and books nothing', async () => {
  const panel = await context.newPage();
  await panel.setViewportSize({ width: 400, height: 1150 });
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await panel.getByRole('button', { name: 'Let Class8 call' }).click();
  await panel.getByRole('button', { name: 'Cancel call' }).click();
  await expect(panel.getByText('Call cancelled. Nothing was booked.').last()).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Approve and book' })).toHaveCount(0);
});

test('popup lists the ELD trucks', async () => {
  const popup = await context.newPage();
  await popup.setViewportSize({ width: 360, height: 520 });
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByText('Truck 214 · Marco Ruiz')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Open demo load board' })).toBeVisible();
  await popup.screenshot({ path: `${SHOTS}/popup.png` });
});

test('no serious accessibility violations in the side panel and popup', async () => {
  for (const path of ['sidepanel.html', 'popup.html', 'options.html']) {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/${path}`);
    await page.waitForLoadState('networkidle');
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${path}: ${v.id} — ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    await page.close();
  }
});

test('sorting puts every skip below every load worth taking', async () => {
  const page = await context.newPage();
  await page.goto('http://localhost:5174/');
  await page.getByRole('button', { name: 'Best first' }).click();
  const labels = await page.locator('td[data-c8-col] button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
  const firstSkip = labels.findIndex((l) => /^(Skip|Wrong trailer)/.test(l));
  expect(labels.slice(firstSkip).every((l) => /^(Skip|Wrong trailer)/.test(l))).toBe(true);
  await page.close();
});
