import { expect, Page, test } from '@playwright/test';

const details = (page: Page) => page.getByRole('dialog');

async function finishOpening(page: Page) {
  await expect(details(page)).toBeVisible();
  await details(page).evaluate(async (dialog) => {
    await Promise.all(
      dialog.getAnimations({ subtree: true }).map((animation) => animation.finished),
    );
  });
}

// Use Angular's development hooks only to supply optional test data, without a production test route.
async function addTestData(page: Page, longContent = false) {
  await expect(page.locator('dialog')).toHaveCount(0);
  await page.evaluate((longContent) => {
    const ng = (window as any).ng;
    const home = ng.getComponent(document.querySelector('app-home'));
    const card = ng.getComponent(document.querySelector('app-product-card'));
    home.selectedProduct.set({
      ...card.product(),
      details: longContent
        ? 'Descrição extensa para testar rolagem e quebra de texto. '.repeat(70)
        : card.product().details,
      additionalImages: Array.from({ length: longContent ? 12 : 2 }, (_, index) => ({
        src: `test-photo-${index}.svg`,
        alt: `Foto de teste ${index + 2}`,
      })),
      information: [
        { icon: 'clock', text: 'Informação de teste sobre encomenda' },
        { icon: 'snowflake', text: 'Informação de teste sobre conservação' },
        { icon: 'info', text: 'Última informação de teste' },
      ],
    });
    ng.applyChanges(home);
  }, longContent);
  await finishOpening(page);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/test-photo-*.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f0d2c8"/><text x="40" y="200" fill="#5a3a2e">Foto de teste</text></svg>',
    }),
  );
  await page.goto('/');
  await page.waitForFunction(() =>
    (window as any).ng?.getComponent(document.querySelector('app-home')),
  );
});

test('CA01–CA02–CA09: seis produtos abrem por teclado e preservam pedido direto', async ({
  page,
}) => {
  await expect(details(page)).toHaveCount(0);
  for (const card of await page.locator('app-product-card').all()) {
    const name = await card.locator('h3').innerText();
    for (const trigger of [card.locator('.product-photo'), card.locator('.product-name')]) {
      await trigger.focus();
      await trigger.press('Enter');
      await expect(details(page)).toHaveCount(1);
      await expect(details(page)).toHaveAccessibleName(name);
      const link = details(page).locator('.details-order');
      expect(
        new URL((await link.getAttribute('href'))!, 'http://localhost').searchParams.get('text'),
      ).toContain(name);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await page.keyboard.press('Escape');
      await expect(details(page)).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    // Block external navigation while checking that the existing CTA does not open details.
    await card
      .locator('.product-order')
      .evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()));
    await card.locator('.product-order').click();
    await expect(details(page)).toHaveCount(0);
  }
});

test('CA03–CA04–CA10: galeria, seleção acessível e falha de imagem', async ({ page }) => {
  await addTestData(page);
  await expect(details(page).locator('.photo-count')).toHaveText('1 / 3');
  await details(page).getByRole('button', { name: 'Foto anterior', exact: true }).click();
  await expect(details(page).locator('.photo-count')).toHaveText('3 / 3');
  await details(page).getByRole('button', { name: 'Próxima foto', exact: true }).click();
  await expect(details(page).locator('.photo-count')).toHaveText('1 / 3');
  const second = details(page).getByRole('button', {
    name: 'Ver foto 2 de Bolo de Chocolate',
    exact: true,
  });
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await expect(details(page).locator('.product-image')).toHaveAttribute('alt', 'Foto de teste 2');
  await details(page)
    .locator('.product-image')
    .evaluate((image) => image.dispatchEvent(new Event('error')));
  await expect(
    details(page).getByRole('img', { name: 'Foto de teste 2 — imagem indisponível', exact: true }),
  ).toBeVisible();
  await details(page).getByRole('button', { name: 'Próxima foto', exact: true }).click();
  await expect(details(page).locator('.product-image')).toBeVisible();
  await details(page).getByRole('button', { name: 'Fechar detalhes' }).click();
  await addTestData(page);
  await expect(details(page).locator('.photo-count')).toHaveText('1 / 3');
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`CA05–CA07–CA10: layout e conteúdo longo em ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width <= 700 ? 844 : 900 });
    await page.locator('.product-name').first().click();
    await finishOpening(page);
    await expect(details(page).locator('.content-price span')).toHaveText('A partir de');
    await expect(details(page).locator('.price-note')).toHaveText(
      'Valor varia conforme tamanho e decoração',
    );
    await expect(details(page).locator('.good-to-know, .thumbnails, .photo-count')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`variable-${width}.png`) });
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Ver detalhes de Brownie Recheado', exact: true })
      .last()
      .click();
    await expect(details(page).locator('.price-note')).toHaveCount(0);
    await expect(details(page).locator('.content-price span')).toHaveText('Preço');
    await expect(details(page).locator('.footer-price strong')).toHaveText('R$ 18,00');
    await finishOpening(page);
    await page.screenshot({ path: testInfo.outputPath(`fixed-${width}.png`) });
    const gallery = await details(page).locator('.gallery').boundingBox();
    const content = await details(page).locator('.product-information').boundingBox();
    if (width > 700) expect(content!.x).toBeGreaterThanOrEqual(gallery!.x + gallery!.width);
    else expect(content!.y).toBeGreaterThanOrEqual(gallery!.y + gallery!.height);
    await page.keyboard.press('Escape');
    await addTestData(page, true);
    const scrollSelector = width <= 700 ? '.details-scroll' : '.product-information';
    const footer = await details(page).locator('.details-footer').boundingBox();
    await details(page)
      .locator(scrollSelector)
      .evaluate((element) => (element.scrollTop = element.scrollHeight));
    await expect(details(page).getByText('Última informação de teste')).toBeInViewport();
    const lastItem = await details(page).getByText('Última informação de teste').boundingBox();
    expect(lastItem!.y + lastItem!.height).toBeLessThanOrEqual(footer!.y);
    expect(await details(page).locator('.details-footer').boundingBox()).toEqual(footer);
    const overflow = await details(page).evaluate((dialog) => ({
      page: document.documentElement.scrollWidth > window.innerWidth,
      panel: dialog.scrollWidth > dialog.clientWidth,
      box: dialog.getBoundingClientRect().toJSON(),
    }));
    expect(overflow.page).toBe(false);
    expect(overflow.panel).toBe(false);
    expect(overflow.box.x).toBeGreaterThanOrEqual(0);
    expect(overflow.box.right).toBeLessThanOrEqual(width);
    expect(overflow.box.bottom).toBeLessThanOrEqual(width <= 700 ? 844 : 900);
    for (const control of await details(page).locator('button:visible, a:visible').all()) {
      const box = await control.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    if (width <= 700) {
      await details(page)
        .locator('.thumbnails')
        .evaluate((element) => (element.scrollLeft = element.scrollWidth));
      await details(page)
        .getByRole('button', { name: 'Ver foto 13 de Bolo de Chocolate', exact: true })
        .click();
      await expect(details(page).locator('.photo-count')).toHaveText('13 / 13');
    }
    await page.screenshot({ path: testInfo.outputPath(`long-content-${width}.png`) });
  });
}

test('CA08–CA10: foco contido, fundo inerte, três formas de fechar e contexto preservado', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Bolos', exact: true }).click();
  const trigger = page.locator('.product-name').first();
  await trigger.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await trigger.click();
  const close = details(page).getByRole('button', { name: 'Fechar detalhes' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(details(page).locator('.details-order')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await expect(close).toHaveCSS('outline-style', 'solid');
  await page
    .locator('.filter-group button')
    .first()
    .evaluate((button: HTMLElement) => button.focus());
  expect(await details(page).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(
    true,
  );
  await page.mouse.wheel(0, 500);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await details(page).locator('h2').click();
  await expect(details(page)).toBeVisible();
  await close.click();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(page.getByRole('button', { name: 'Bolos', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await trigger.click();
  await expect(details(page)).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(details(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press('Space');
  await expect(details(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(details(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(details(page)).toBeVisible();
  await trigger.evaluate((button) => button.remove());
  await page.keyboard.press('Escape');
  await expect(page.locator('.filter-group button').first()).toBeFocused();
});

test('CA07: orientação horizontal, toque e texto ampliado mantêm ações acessíveis', async ({
  page,
}) => {
  for (const viewport of [
    { width: 667, height: 375 },
    { width: 1024, height: 320 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await addTestData(page, true);
    await details(page).evaluate((dialog) => {
      for (const element of dialog.querySelectorAll<HTMLElement>('p, h2, h3, a, li')) {
        element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`;
      }
    });
    await expect(details(page).locator('.details-order')).toBeInViewport();
    await expect(details(page).getByRole('button', { name: 'Fechar detalhes' })).toBeInViewport();
    expect(await details(page).evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)).toBe(
      true,
    );
    await details(page).getByRole('button', { name: 'Fechar detalhes' }).click();
  }
});

test('CA06–CA08: toque mobile abre e fecha o painel', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.product-photo').first().tap();
  await expect(details(page)).toBeVisible();
  await expect(details(page).locator('.footer-price')).toBeVisible();
  await details(page).getByRole('button', { name: 'Fechar detalhes' }).tap();
  await expect(details(page)).toHaveCount(0);
  await context.close();
});
