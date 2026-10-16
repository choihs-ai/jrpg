// Playwright 공용 도우미
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
export const { chromium } = pw;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export async function launch(file = 'index.html', opts = {}) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: opts.viewport || { width: 960, height: 720 }, deviceScaleFactor: 1, hasTouch: !!opts.touch });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('willReadFrequently')) errors.push(m.type() + ': ' + m.text()); });
  await page.goto('file://' + path.join(ROOT, file));
  await page.waitForFunction(() => window.__jr && window.__jr.Engine);
  return { browser, page, errors };
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function key(page, k, hold = 60) { await page.keyboard.down(k); await sleep(hold); await page.keyboard.up(k); await sleep(40); }
