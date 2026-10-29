import { expect, Locator, Page, test } from '@playwright/test';

async function settle(control: Locator) {
  await control.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished),
    );
  });
}

async function appearance(control: Locator) {
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      border: style.borderColor,
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
    };
  });
}

async function checkHover(page: Page, control: Locator) {
  await page.mouse.move(0, 0);
  await control.scrollIntoViewIfNeeded();
  await settle(control);
  const initial = await appearance(control);
  await control.hover();
  await settle(control);
  const hovered = await appearance(control);
  expect([hovered.background, hovered.color]).not.toEqual([initial.background, initial.color]);
  expect([hovered.width, hovered.height]).toEqual([initial.width, initial.height]);
  await page.mouse.move(0, 0);
  await settle(control);
  expect(await appearance(control)).toEqual(initial);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForFunction(() =>
    (window as any).ng?.getComponent(document.querySelector('app-home')),
  );
});

test('Hover CA01: CTAs, filtros e ações textuais mudam de cor e restauram seu estado', async ({
  page,
}) => {
  for (const selector of [
    '.header-order',
    '.hero-actions .btn-primary',
    '.contact-outline',
    '.orders-inner .btn',
    '.filter-group .active',
    '.filter-group [aria-pressed="false"]',
    '.product-name',
    '.product-order',
  ])
    await checkHover(page, page.locator(selector).first());
  await page.locator('.product-name').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await settle(page.getByRole('dialog'));
  await checkHover(page, page.locator('.close-button'));
  await checkHover(page, page.locator('.details-order'));
});

test('Hover CA01–CA03: padrão cobre botão sem classe e preserva controles indisponíveis', async ({
  page,
}) => {
  await page.locator('.mary-site').evaluate((site) => {
    const fixture = document.createElement('div');
    fixture.innerHTML =
      '<button id="default-hover">Nova ação</button><button id="disabled-hover" disabled>Indisponível</button><a id="aria-disabled-hover" class="btn btn-primary" aria-disabled="true">WhatsApp indisponível</a>';
    site.append(fixture);
  });
  await checkHover(page, page.locator('#default-hover'));
  for (const selector of ['#disabled-hover', '#aria-disabled-hover']) {
    const control = page.locator(selector);
    await page.mouse.move(0, 0);
    await control.scrollIntoViewIfNeeded();
    const initial = await appearance(control);
    const box = (await control.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await settle(control);
    expect(await appearance(control)).toEqual(initial);
  }
});

test('Hover CA02: fotos e miniaturas escurecem; seleção e ações permanecem disponíveis', async ({
  page,
}) => {
  const photo = page.locator('.product-photo').first();
  await photo.hover();
  await expect(photo.locator('img')).toHaveCSS('filter', 'brightness(0.9)');
  await page.mouse.move(0, 0);
  await expect(photo.locator('img')).toHaveCSS('filter', 'none');
  await photo.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await settle(dialog);
  await page.route('**/hover-test.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f0d2c8"/></svg>',
    }),
  );
  await page.evaluate(() => {
    const ng = (window as any).ng;
    const home = ng.getComponent(document.querySelector('app-home'));
    const card = ng.getComponent(document.querySelector('app-product-card'));
    home.selectedProduct.set({
      ...card.product(),
      additionalImages: [{ src: 'hover-test.svg', alt: 'Foto de teste' }],
    });
    ng.applyChanges(home);
  });
  for (const selector of ['.previous', '.next', '.thumbnails button'])
    await checkHover(page, dialog.locator(selector).first());
  const thumbnail = dialog.locator('.thumbnails button').last();
  await thumbnail.hover();
  await expect(thumbnail.locator('img')).toHaveCSS('filter', 'brightness(0.9)');
  await thumbnail.click();
  await expect(thumbnail).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.locator('.thumbnails [aria-pressed="true"]')).toHaveCount(1);
  await expect(dialog.locator('.photo-count')).toHaveText('2 / 2');
});

test('Hover CA03: movimento reduzido mantém a mudança de cor sem animar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const control = page.locator('.header-order');
  const initial = await appearance(control);
  await control.hover();
  await expect(control).toHaveCSS('transition-duration', '0s');
  expect((await appearance(control)).background).not.toBe(initial.background);
  expect(await control.evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('Hover CA03: toque em filtro ativo não deixa cor de hover persistente', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  const filter = page.getByRole('button', { name: 'Todos', exact: true });
  const initial = await appearance(filter);
  await filter.tap();
  expect(await appearance(filter)).toEqual(initial);
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await context.close();
});
