import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { FLOWS } from '../js/data/flows.js';
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
async function snapshot(page, selector) {
  return page.locator(selector).evaluate(root => {
    const origin = root.getBoundingClientRect();
    return { html: root.innerHTML, layout: [root, ...root.querySelectorAll('*')].map(node => {
      const r = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return [node.tagName, r.width || r.height ? +(r.x-origin.x).toFixed(3) : 0, r.width || r.height ? +(r.y-origin.y).toFixed(3) : 0, r.width, r.height,
        Array.from(style).sort().map(key => key + ':' + style.getPropertyValue(key)).join(';')];
    }) };
  });
}

try {
  for (const [width, height] of [[1440,900],[1024,768],[768,1024],[390,844]].filter(([w]) => !process.env.VIEWPORT_WIDTH || w === Number(process.env.VIEWPORT_WIDTH))) {
    const page = await open(url, width, height);
    assert.equal(await page.locator('.flow-card').count(), 7);
    assert.equal(await page.locator('.plan-2027-card').count(),6);
    assert.equal(await page.locator('.organization-card').count(),4);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const text of ['Ver organigrama','Ver plan 2027']) {
      const link = page.getByRole('link',{name:text, exact:true});
      assert.equal(await link.getAttribute('target'),'_blank');
      assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
      assert.ok((await link.getAttribute('href')).startsWith('https://docs.google.com/document/d/'));
      await link.focus();
      assert.equal(await link.evaluate(n => n === document.activeElement),true);
    }
    await page.locator('.organization-card summary').first().click();
    assert.equal(await page.locator('.organization-card details[open]').count(),1);
    await page.locator('.organization-card summary').first().click();
    if (baseline) {
      const before = await open(baseline, width, height);
      // Compare each protected flow independently of added sections below the map.
      await page.addStyleTag({content: '.site-nav, .back-top, .skip-link { visibility: hidden; }'});
      await before.addStyleTag({content: '.site-nav, .back-top, .skip-link { visibility: hidden; }'});
      await page.mouse.move(0,0);
      await before.mouse.move(0,0);
      for (const n of [2,4,6]) {
        const selector = '#flujo-' + n;
        const current = await snapshot(page,selector), original = await snapshot(before,selector);
        if (JSON.stringify(current)!==JSON.stringify(original)) {
          await writeFile('test-results/current.json',JSON.stringify(current));
          await writeFile('test-results/original.json',JSON.stringify(original));
        }
        assert.ok(JSON.stringify(current) === JSON.stringify(original), `datos/DOM/estilos/geometría flujo ${n}, ${width}`);
        const a = await before.locator(selector).screenshot({animations:'disabled'});
        const b = await page.locator(selector).screenshot({animations:'disabled'});
        await writeFile(`test-results/before-${width}-flow-${n}.png`, a);
        await writeFile(`test-results/after-${width}-flow-${n}.png`, b);
        const maxDifference = await page.evaluate(async ({a,b}) => {
          async function pixels(encoded) {
            const bytes = Uint8Array.from(atob(encoded), ch => ch.charCodeAt(0));
            const bitmap = await createImageBitmap(new Blob([bytes],{type:'image/png'}));
            const canvas = document.createElement('canvas'); canvas.width=bitmap.width; canvas.height=bitmap.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap,0,0);
            return ctx.getImageData(0,0,canvas.width,canvas.height).data;
          }
          const [x,y] = await Promise.all([pixels(a),pixels(b)]);
          if(x.length!==y.length) return 255;
          let max=0; for(let i=0;i<x.length;i++) max=Math.max(max,Math.abs(x[i]-y[i]));
          return max;
        }, {a:a.toString('base64'),b:b.toString('base64')});
        // Up to 3/255 for Chromium raster rounding; DOM/style/geometry must match exactly.
        assert.ok(maxDifference <= 3, `regresión visual flujo ${n}, ${width}: diferencia máxima ${maxDifference}`);
      }
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
  await page.locator('#trigger-people').click();
  await page.locator('[data-filter="people"][data-value="yesely"]').click();
  await page.locator('[data-filter="people"][data-value="lucero"]').click();
  await page.locator('#trigger-systems').click();
  await page.locator('[data-filter="systems"][data-value="imaging"]').click();
  await page.locator('[data-filter="systems"][data-value="sheets"]').click();
  const expected = FLOWS.filter(f => f.people.some(id => ['yesely','lucero'].includes(id)) && f.systems.some(id => ['imaging','sheets'].includes(id))).map(f => f.n);
  assert.deepEqual(await page.locator('.flow-card:not([hidden])').evaluateAll(nodes => nodes.map(n => Number(n.dataset.flow))), expected);
  await page.locator('#resetFilters').click();
  assert.match(await page.locator('#flujo-7 .progress-dial').getAttribute('aria-label'), /100%/);
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
  assert.ok(await page.locator('.organization-card details li').last().evaluate(n => n.getBoundingClientRect().height > 0));
  assert.equal(await page.locator('.plan-2027-card').count(),6);
  await page.pdf({ path: 'test-results/flows.pdf', printBackground: true });
  if (baseline) {
    const printed = await open(url,1440,900);
    const before = await open(baseline,1440,900);
    for (const target of [printed,before]) {
      await target.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      await target.emulateMedia({ media:'print' });
      await target.mouse.move(0,0);
    }
    for (const n of [2,4,6]) {
      assert.ok(JSON.stringify(await snapshot(printed,'#flujo-'+n)) === JSON.stringify(await snapshot(before,'#flujo-'+n)), `impresión intacta flujo ${n}`);
    }
    await printed.close();
    await before.close();
  }
  assert.deepEqual(failures, []);
  console.log(`OK ${steps.length} tarjetas, filtros, equipo, modal, enlaces, scroll, expandir/contraer y PDF`);
} finally { await browser.close(); }
