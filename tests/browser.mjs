import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const url = process.env.APP_URL || 'http://127.0.0.1:8000/flujograma-vista/';
const baseline = process.env.BASELINE_URL;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
await mkdir('test-results', { recursive: true });
const failures = [];
async function open(target, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.url().startsWith(target) && response.status() >= 400) failures.push(response.url()); });
  // Compare deterministic local rendering, independent of external CDN availability.
  await page.route('**/*', route => [url, baseline].filter(Boolean).some(base => new URL(route.request().url()).origin === new URL(base).origin) ? route.continue() : route.abort());
  await page.goto(target);
  await page.waitForSelector('#flowsList .flow-card');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  return page;
}
async function snapshot(page) {
  return page.evaluate(() => {
    const roots = ['flowsList', 'teamGrid', 'flowIndexList', 'filterChips', 'dialogContent'];
    const html = roots.map(id => document.getElementById(id)?.innerHTML);
    const layout = [...document.body.querySelectorAll('*')].map(node => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      let hash = 2166136261;
      const values = Array.from(style).sort().map(key => key + ':' + style.getPropertyValue(key)).join(';');
      for (let i = 0; i < values.length; i++) hash = Math.imul(hash ^ values.charCodeAt(i), 16777619);
      return [node.tagName, rect.x, rect.y, rect.width, rect.height, hash >>> 0];
    });
    return { html, layout };
  });
}
try {
  for (const [width, height] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
    const page = await open(url, width, height);
    assert.equal(await page.locator('.flow-card').count(), 7);
    if (baseline) {
      const before = await open(baseline, width, height);
      // Script elements have changed intentionally; exclude them from computed layout snapshots.
      await before.locator('script').evaluateAll(nodes => nodes.forEach(n => n.remove()));
      await page.locator('script').evaluateAll(nodes => nodes.forEach(n => n.remove()));
      assert.ok(JSON.stringify(await snapshot(page)) === JSON.stringify(await snapshot(before)), `DOM/estilos/geometría ${width}`);
      const a = await before.screenshot({ fullPage: true, animations: 'disabled' });
      const b = await page.screenshot({ fullPage: true, animations: 'disabled' });
      await writeFile(`test-results/before-${width}.png`, a);
      await writeFile(`test-results/after-${width}.png`, b);
      assert.ok(a.equals(b), `capturas idénticas ${width}`);
      await before.close();
    }
    await page.close();
    console.log(`OK responsive y comparación ${width}×${height}`);
  }
  const page = await open(url, 1440, 900);
  await page.locator('#collapseAll').click();
  assert.equal(await page.locator('.flow-card[open]').count(), 0);
  await page.locator('#expandAll').click();
  assert.equal(await page.locator('.flow-card[open]').count(), 7);
  // Every rendered step button, including owner/number overrides and decision routes.
  const steps = await page.locator('[data-step-id]').evaluateAll(nodes => nodes.map(n => ({ id:n.dataset.stepId, owner:n.dataset.owner, n:n.dataset.n })));
  for (const step of steps) {
    await page.evaluate(step => {
      const button = [...document.querySelectorAll('[data-step-id]')].find(n => n.dataset.stepId === step.id && n.dataset.owner === step.owner && n.dataset.n === step.n);
      button.click();
    }, step);
    assert.equal(await page.locator('#stepDialog').evaluate(d => d.open), true);
    await page.locator('#dialogClose').click();
  }
  await page.locator('#systemsDialogTrigger').click();
  assert.equal(await page.locator('#stepDialog').evaluate(d => d.open), true);
  await page.keyboard.press('Escape');
  await page.locator('#trigger-process').click();
  await page.locator('[data-filter="process"][data-value="solicitudes"]').click();
  assert.ok(await page.locator('.flow-card:not([hidden])').count() < 7);
  await page.locator('#resetFilters').click();
  assert.equal(await page.locator('.flow-card:not([hidden])').count(), 7);
  await page.locator('[data-person-filter="adriana"]').click();
  assert.ok(await page.locator('.flow-card:not([hidden])').count() < 7);
  await page.locator('#resetFilters').click();
  await page.locator('[data-goto-flow]').first().click();
  assert.equal(await page.locator('#flujo-2').evaluate(d => d.open), true);
  const shell = page.locator('[data-track-shell]').filter({ has: page.locator('[data-track-next]:not([disabled])') }).first();
  assert.ok(await shell.count());
  const track = shell.locator('.flow-track');
  await shell.locator('[data-track-next]').click();
  await page.waitForTimeout(100);
  assert.ok(await track.evaluate(t => t.scrollLeft > 0));
  await page.locator('#collapseAll').click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('.flow-card[open]').count(), 7);
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  assert.equal(await page.locator('.flow-card[open]').count(), 0);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: 'test-results/flows.pdf', printBackground: true });
  if (baseline) {
    const before = await open(baseline,1440,900);
    await before.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await before.emulateMedia({ media: 'print' });
    await page.locator('script').evaluateAll(nodes => nodes.forEach(n => n.remove()));
    await before.locator('script').evaluateAll(nodes => nodes.forEach(n => n.remove()));
    // Active navigation classes depend on prior scrolling; compare print CSS rules directly.
    const rules = p => p.evaluate(() => {
      function collect(sheet) { return [...sheet.cssRules].flatMap(rule => rule.styleSheet ? collect(rule.styleSheet) : [rule.cssText]); }
      return [...document.styleSheets].filter(s => s.href?.startsWith(location.origin)).flatMap(collect);
    });
    assert.deepEqual(await rules(page), await rules(before), 'orden y contenido CSS exactos');
    await before.close();
  }
  assert.deepEqual(failures, []);
  console.log(`OK ${steps.length} tarjetas, filtros, equipo, modal, enlaces, scroll, expandir/contraer y PDF`);
} finally { await browser.close(); }
