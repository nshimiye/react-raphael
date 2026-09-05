import { expect, test } from '@playwright/test';

test('gallery, animation controls, code, and interactions', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-shape]')).toHaveCount(9);
  for (const shape of [
    'Circle',
    'Ellipse',
    'Rect',
    'Path',
    'Line',
    'Text',
    'Image',
    'Print',
    'Set',
  ])
    await expect(page.locator(`[data-shape="${shape}"] svg`)).toBeVisible();
  expect(
    (await page.locator('[data-shape="Print"] path').getAttribute('d'))?.length,
  ).toBeGreaterThan(200);
  await page.screenshot({ path: testInfo.outputPath('playground.png'), fullPage: true });
  await page.getByRole('button', { name: 'Pause' }).click();
  const ball = page.locator('[data-testid="animation-stage"] circle').first();
  const paused = await ball.getAttribute('cx');
  // Wait two animation frames, not an arbitrary animation duration.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await ball.getAttribute('cx')).toBe(paused);
  await page.getByLabel('Easing').selectOption('bounce');
  await page.getByLabel('Duration').fill('1400');
  await page.getByRole('button', { name: 'Replay' }).click();
  await expect(ball).toHaveAttribute('cx', '125');
  await page.getByRole('button', { name: 'Play', exact: false }).first().click();
  await expect.poll(async () => Number(await ball.getAttribute('cx'))).toBeGreaterThan(140);
  await page.getByRole('button', { name: 'Click me' }).click();
  await expect(page.locator('.count')).toHaveText('1');
  const reset = page.getByRole('button', { name: 'Reset position' });
  await reset.focus();
  await page.keyboard.press('ArrowRight');
  const rect = page.locator('.interaction-card rect');
  await expect(rect).toHaveAttribute('x', '135');
  await reset.click();
  await expect(rect).toHaveAttribute('x', '125');
  const box = await rect.boundingBox();
  if (!box) throw new Error('Missing drag shape');
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 40, { steps: 5 });
  await page.mouse.up();
  await expect(rect).toHaveAttribute('x', '165');
  await page.locator('[data-shape="Circle"] summary').click();
  await expect(page.locator('[data-shape="Circle"] pre')).toContainText('<Circle');
  expect(errors).toEqual([]);
});

test('mobile layout and reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play', exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('[data-shape="Set"] svg')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
});
