import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests.html');
  await page.waitForFunction(() => !!window.harness);
});

test('Strict Mode, nested sets, dynamic children, refs, and complete cleanup', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.evaluate(() => window.harness.scene(3));
  await expect(page.locator('svg')).toHaveCount(2);
  await expect(page.locator('circle')).toHaveCount(4);
  expect(await page.evaluate(() => window.harness.state())).toMatchObject({
    papers: 2,
    elements: 8,
    immediateRef: true,
    setLength: 1,
  });
  await page.evaluate(() => window.harness.scene(1, false));
  await expect(page.locator('circle')).toHaveCount(2);
  await expect(page.locator('circle').first()).toHaveAttribute('fill', '#00ff00');
  await page.evaluate(() => window.harness.scene(2, false));
  await expect(page.locator('circle').nth(1)).toHaveAttribute('fill', '#00ff00');
  await page.evaluate(() => window.harness.clear());
  await expect(page.locator('svg')).toHaveCount(0);
  expect(await page.evaluate(() => window.harness.state())).toMatchObject({
    papers: 0,
    elements: 0,
  });
  expect(errors).toEqual([]);
});

test('imperative values survive unchanged props; event removal and viewbox updates work', async ({
  page,
}) => {
  await page.evaluate(() => window.harness.scene());
  await page.locator('circle').first().click();
  expect((await page.evaluate(() => window.harness.state())).clicks).toBeGreaterThan(0);
  await page.evaluate(() => {
    window.harness.imperative();
    window.harness.scene();
  });
  expect(await page.evaluate(() => window.harness.state())).toMatchObject({
    circle: { cx: 91, fill: '#0000ff' },
    data: 99,
  });
  await page.evaluate(() => window.harness.scene(1, false, '0 0 800 400'));
  await expect(page.locator('svg').first()).toHaveAttribute('viewBox', '0 0 800 400');
  const before = (await page.evaluate(() => window.harness.state())).clicks;
  await page.locator('circle').first().click();
  expect((await page.evaluate(() => window.harness.state())).clicks).toBe(before);
  await page.evaluate(() => window.harness.scene(1, false, ''));
  await expect(page.locator('svg').first()).toHaveAttribute('viewBox', '0 0 400 200');
});

test('animation continues through rerenders and line endpoints reach zero', async ({ page }) => {
  await page.evaluate(() => window.harness.animated());
  await expect
    .poll(async () => Number(await page.locator('circle').getAttribute('cx')))
    .toBeGreaterThan(45);
  const before = Number(await page.locator('circle').getAttribute('cx'));
  await page.evaluate(() => window.harness.animated(true));
  expect(Number(await page.locator('circle').getAttribute('cx'))).toBeGreaterThanOrEqual(before);
  await page.evaluate(() => window.harness.clear());
  await page.evaluate(() => window.harness.line());
  await expect
    .poll(async () => (await page.locator('path').getAttribute('d'))?.replaceAll(' ', ''))
    .toBe('M0,30L0,60');
});

test('all primitives render; Print updates in place and glows are cleaned up', async ({ page }) => {
  await page.evaluate(() => window.harness.allShapes());
  await expect(page.locator('ellipse')).toHaveCount(1);
  await expect(page.locator('image')).toHaveCount(1);
  await expect(page.locator('path')).toHaveCount(3);
  await page.evaluate(() => window.harness.clear());
  await page.evaluate(() => window.harness.print('VECTOR'));
  const first = await page.locator('path').getAttribute('d');
  await page.evaluate(() => window.harness.print('V'));
  await expect(page.locator('path')).toHaveCount(1);
  expect(await page.locator('path').getAttribute('d')).not.toBe(first);
  await page.evaluate(() => window.harness.clear());
  await page.evaluate(() => window.harness.glow(true));
  expect(await page.locator('path').count()).toBeGreaterThan(0);
  await page.evaluate(() => window.harness.glow(false));
  await expect(page.locator('path')).toHaveCount(0);
  await page.evaluate(() => window.harness.clear());
  expect(await page.evaluate(() => window.harness.state())).toMatchObject({
    papers: 0,
    elements: 0,
  });
});
