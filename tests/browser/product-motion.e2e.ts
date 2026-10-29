import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForFunction(() =>
    (window as any).ng?.getComponent(document.querySelector('app-home')),
  );
});

test('Animações CA01: hover amplia e eleva sem mover os vizinhos; saída restaura o card', async ({
  page,
}) => {
  const cards = page.locator('.product-card');
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const initial = await card.boundingBox();
  const neighbor = await cards.nth(1).boundingBox();
  const initialShadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);
  await expect(card).toHaveCSS('transition-duration', '0.22s');
  await card.hover();
  await card.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const hovered = await card.boundingBox();
  expect(hovered!.width).toBeCloseTo(initial!.width * 1.02, 1);
  expect(hovered!.y).toBeLessThan(initial!.y - 6);
  expect(await cards.nth(1).boundingBox()).toEqual(neighbor);
  expect(await card.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
    initialShadow,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.mouse.move(0, 0);
  await expect(card).toHaveCSS('transform', 'none');
  expect(await card.boundingBox()).toEqual(initial);
  await expect(card).toHaveCSS('box-shadow', initialShadow);
});

for (const width of [1440, 390]) {
  test(`Animações CA02–CA03: entrada gradual e reabertura em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    for (const selector of ['.product-photo', '.product-name']) {
      const trigger = page.locator(selector).first();
      await trigger.focus();
      await trigger.press('Enter');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Fechar detalhes' })).toBeFocused();
      const frames = await dialog.evaluate((element) => {
        const animations = element
          .getAnimations({ subtree: true })
          .filter((animation) => animation instanceof CSSAnimation);
        for (const animation of animations) animation.pause();
        const read = () => {
          const style = getComputedStyle(element);
          const matrix = new DOMMatrix(style.transform);
          return {
            opacity: Number(style.opacity),
            scale: matrix.a,
            y: matrix.f,
            backdrop: Number(getComputedStyle(element, '::backdrop').opacity),
          };
        };
        for (const animation of animations) animation.currentTime = 0;
        const start = read();
        for (const animation of animations) animation.currentTime = 140;
        const middle = read();
        for (const animation of animations) animation.finish();
        return {
          start,
          middle,
          end: read(),
          durations: animations.map((animation) => animation.effect!.getTiming().duration),
        };
      });
      expect(frames.durations).toEqual([280, 280]);
      expect(frames.start.opacity).toBe(0);
      expect(frames.start.backdrop).toBe(0);
      expect(frames.start.scale).toBeCloseTo(width === 390 ? 1 : 0.96);
      expect(frames.start.y).toBe(width === 390 ? 32 : 16);
      expect(frames.middle.opacity).toBeGreaterThan(0);
      expect(frames.middle.opacity).toBeLessThan(1);
      expect(frames.middle.backdrop).toBeGreaterThan(0);
      expect(frames.middle.backdrop).toBeLessThan(1);
      expect(frames.middle.y).toBeGreaterThan(0);
      expect(frames.middle.y).toBeLessThan(frames.start.y);
      expect(frames.end).toEqual({ opacity: 1, scale: 1, y: 0, backdrop: 1 });
      if (width === 390) {
        await expect(dialog.locator('.footer-price')).toBeInViewport();
        expect((await dialog.boundingBox())!.width).toBe(390);
      } else {
        expect((await dialog.boundingBox())!.width).toBe(1000);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.keyboard.press('Escape');
      await expect(page.locator('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  });
}

test('Animações CA02: fechar durante a entrada não espera a animação nem bloqueia o fundo', async ({
  page,
}) => {
  const trigger = page.locator('.product-name').first();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause();
      animation.currentTime = 100;
    }
  });
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
});

test('Animações CA03: toque não deixa hover de ampliação no card', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto('/');
  const card = page.locator('.product-card').first();
  await card.locator('.product-photo').tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(card).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: 'Fechar detalhes' }).tap();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(card).toHaveCSS('transform', 'none');
  await context.close();
});

test('Animações CA04: movimento reduzido desativa hover e entrada desktop/mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const card = page.locator('.product-card').first();
    await card.hover();
    await expect(card).toHaveCSS('transform', 'none');
    await expect(card).toHaveCSS('transition-duration', '0s');
    await card.locator('.product-name').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((element) => element.getAnimations().length)).toBe(0);
    await expect(dialog).toHaveCSS('opacity', '1');
    await expect(dialog).toHaveCSS('transform', 'none');
    expect(
      await dialog.evaluate((element) => getComputedStyle(element, '::backdrop').animationName),
    ).toBe('none');
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
  }
});
