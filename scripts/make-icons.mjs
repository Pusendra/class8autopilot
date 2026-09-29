// Renders the toolbar icon (a Class8-purple tile with "C8" in Anton) at each size WXT expects.
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';

const anton = readFileSync('public/fonts/anton-latin-400-normal.woff2').toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
for (const size of [16, 32, 48, 128]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>
    @font-face { font-family: Anton; src: url(data:font/woff2;base64,${anton}); }
    html, body { margin: 0; background: transparent; }
    div { width: ${size}px; height: ${size}px; border-radius: ${size * 0.22}px; background: #5f48f5; color: #fff;
          display: flex; align-items: center; justify-content: center; font: ${size * 0.5}px/1 Anton; letter-spacing: -0.02em; }
    span { color: #fd4747; }
  </style><div>C<span>8</span></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/icon/${size}.png`, omitBackground: true });
}
await browser.close();
