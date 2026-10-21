import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const root = process.env.TEST_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
await mkdir('test-results', { recursive: true });
const issues = [];
const results = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text; } } });
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
});
const page = await context.newPage();
page.on('pageerror', e => issues.push(e.message));
page.on('response', r => { if (r.status() >= 400) issues.push(`${r.status()} ${r.url()}`); });
const url = (search = '', hash = '') => `${root}${search}${hash}`;
async function ready() { await page.evaluate(() => document.fonts.ready); }
async function noOverflow(label) {
  const bounds = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(bounds.scroll <= bounds.viewport + 1, `${label} overflow: ${JSON.stringify(bounds)}`);
}
async function assetGeometry() {
  return page.locator('img').evaluateAll(images => images.map(i => ({ src: i.currentSrc || i.src, loaded: i.complete && i.naturalWidth > 0, natural: [i.naturalWidth, i.naturalHeight], bounds: [i.getBoundingClientRect().width, i.getBoundingClientRect().height] })));
}

try {
  for (const width of [352, 375, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url('?to=홍길동&company=ABC%20건축&lang=ko&from=heerim'));
    await ready(); await noOverflow(`cover ${width}`);
    assert.match(await page.locator('.cover-recipient').textContent(), /홍길동/);
    await page.screenshot({ path: `test-results/cover-${width}.png`, fullPage: true });
    const coverAssets = await assetGeometry();
    assert.ok(coverAssets.every(a => a.loaded && a.bounds[0] > 0 && a.bounds[1] > 0));
    await page.getByRole('button', { name: /새해 인사 열어보기/ }).click();
    await page.waitForURL('**#greeting');
    await page.getByRole('heading', { name: /새로운 해/ }).waitFor();
    await page.locator('.scenic-background-image').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.scenic-background-image')].every(i => i.complete && i.naturalWidth));
    await ready(); await noOverflow(`greeting ${width}`);
    await page.screenshot({ path: `test-results/greeting-${width}.png`, fullPage: true });
    const greetingAssets = await assetGeometry();
    assert.ok(greetingAssets.every(a => a.loaded && a.bounds[0] > 0));
    assert.ok(!(await page.locator('.personalized-message').innerText()).includes('2027'));
    results.push({ width, coverAssets, greetingAssets });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const lang of ['ko', 'en', 'ru', 'vi', 'az']) {
    await page.goto(url(`?to=Kim&company=ABC&lang=${lang}`, '#greeting'));
    await ready(); await noOverflow(lang);
    if (lang === 'ru') assert.match(await page.locator('h1').textContent(), /Поздравления/);
    if (lang === 'vi') assert.match(await page.locator('h1').textContent(), /Lời chúc/);
    assert.equal(await page.locator('.translation-notice, a[href="#generator"]').count(), 0);
    if (lang === 'en') assert.match(await page.locator('h1').textContent(), /Season/);
    if (lang === 'az') assert.match(await page.locator('h1').textContent(), /Yeni/);
  }
  await page.getByRole('button', { name: '한국어', exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get('lang'), 'ko');
  await page.goto(url(`?to=${encodeURIComponent('<script>alert(1)</script>')}&company=${'W'.repeat(100)}&lang=en`, '#greeting'));
  await noOverflow('long content / XSS');
  assert.match(await page.locator('.to-line').textContent(), /<script>/);
  assert.equal(await page.locator('script').evaluateAll(nodes => nodes.some(n => n.textContent === 'alert(1)')), false);

  await page.goto(url('', '#generator'));
  await ready(); await noOverflow('generator');
  await page.screenshot({ path: 'test-results/generator.png', fullPage: true });
  assert.equal(await page.locator('#to, #company').count(), 0);
  await page.getByText('아제르바이잔어', { exact: true }).click();
  await page.getByLabel('02  보내는 분').selectOption('custom');
  await page.getByLabel('보내는 분 이름 또는 소속').fill('홍길동');
  await page.getByLabel('직책 (선택)').fill('대표이사');
  await page.getByRole('button', { name: /맞춤 연하장 링크 생성/ }).click();
  const modal = page.getByRole('dialog');
  await modal.waitFor({ state: 'visible' });
  await page.screenshot({ path: 'test-results/completion-modal.png', fullPage: false });
  await modal.getByRole('button', { name: '링크 복사', exact: true }).click();
  assert.match(await modal.locator('[role=status]').textContent(), /복사했습니다/);
  const generated = new URL(await page.evaluate(() => window.__copied));
  assert.equal(generated.pathname, new URL(root).pathname);
  assert.equal(generated.hash, '');
  assert.equal(generated.searchParams.has('to'), false);
  assert.equal(generated.searchParams.has('company'), false);
  assert.equal(generated.searchParams.get('lang'), 'az');
  assert.equal(generated.searchParams.get('senderName'), '홍길동');
  await modal.getByRole('button', { name: '연하장 링크 공유', exact: true }).click();
  assert.match(await modal.locator('[role=status]').textContent(), /공유 대신/);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } });
    document.execCommand = () => false;
  });
  await modal.getByRole('button', { name: '링크 복사', exact: true }).click();
  assert.match(await modal.locator('[role=status]').textContent(), /직접 복사/);
  await page.keyboard.press('Escape');
  assert.equal(await modal.isVisible(), false);
  assert.equal(await page.getByRole('button', { name: /맞춤 연하장 링크 생성/ }).evaluate(n => n === document.activeElement), true);
  await page.getByRole('button', { name: /연하장 미리보기 열기/ }).click();
  await page.frameLocator('iframe').locator('.cover-recipient').waitFor();
  assert.equal(await page.frameLocator('iframe').locator('.cover-recipient').textContent(), '');
  await page.goto(`${generated.href}#greeting`);
  await page.reload();
  assert.match(await page.locator('.sender-name').textContent(), /홍길동/);
  assert.equal(await page.locator('.sender-title').textContent(), '대표이사');
  await noOverflow('shared custom sender');

  const animated = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'no-preference' });
  const animatedPage = await animated.newPage();
  await animatedPage.goto(root);
  await animatedPage.getByRole('button', { name: /새해 인사 열어보기/ }).click();
  await animatedPage.locator('.is-opening').waitFor();
  await animatedPage.waitForURL('**#greeting');
  await animated.close();
  assert.deepEqual(issues, []);
  await writeFile('test-results/browser-results.json', JSON.stringify({ status: 'passed', url: root, results, consoleErrors: issues, checks: ['mobile widths', 'asset geometry', 'long content', 'URL encoding', 'XSS text rendering', 'all locales', 'pending translation fallback', 'form errors', 'custom sender', 'copy/share fallback', 'clipboard denial', 'native dialog Escape and focus', 'iframe preview', 'refresh', 'envelope animation', 'reduced motion'] }, null, 2));
  console.log('PASS: 5 viewports, 5 locales, personalization, assets, form, modal, clipboard/share, preview and refresh.');
} finally {
  await browser.close();
}
