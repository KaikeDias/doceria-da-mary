import { expect, test } from '@playwright/test';

test('creates a product with a photo and shows it in the list', async ({ page }) => {
  await page.goto('/admin/cardapio');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Adicionar produto' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio\/novo$/);
  await expect(page).toHaveTitle('Novo produto | Painel Doceria da Mary');
  await page.getByRole('button', { name: 'Salvar produto' }).click();
  await expect(page.getByLabel('Nome do produto')).toBeFocused();
  await page.getByLabel('Nome do produto').fill('Pudim');
  await page.getByLabel('Categoria').selectOption('sobremesas');
  await page.getByLabel('Preço em reais').fill('25,50');
  await page.locator('input[type=file]').setInputFiles({
    name: 'pudim.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.locator('form aside')).toContainText('Pudim');
  await expect(page.locator('form aside')).toContainText('R$ 25,50');
  await expect(page.locator('form aside img')).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: 'Salvar produto' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio$/);
  await expect(page.locator('tbody tr')).toHaveCount(7);
  await expect(page.locator('tbody tr').last()).toContainText('Pudim');
  await expect(page.getByRole('status')).toContainText('Pudim foi adicionado ao cardápio.');
});

test('edits a product from the list', async ({ page }) => {
  await page.goto('/admin/cardapio');
  await page.waitForLoadState('networkidle');
  await page.locator('tbody').getByRole('link', { name: 'Editar Brownie Recheado' }).click();
  await expect(page.getByLabel('Nome do produto')).toHaveValue('Brownie Recheado');
  await page.getByLabel('Nome do produto').fill('Brownie Duplo');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.locator('tbody tr').nth(2)).toContainText('Brownie Duplo');
  await expect(page.getByRole('status')).toContainText('Alterações em Brownie Duplo salvas.');
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`form has no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/admin/cardapio/bolo-chocolate/editar');
    await expect(page.locator('h1')).toHaveText('Editar produto');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('form aside')).toBeVisible({ visible: width >= 1024 });
  });
}

test('mobile: back link, collapsible preview and 44px targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cardapio/novo');
  await page.waitForLoadState('networkidle');
  const save = page.getByRole('button', { name: 'Salvar produto' });
  await expect(save).toBeInViewport();
  for (const target of [
    page.getByRole('link', { name: 'Voltar ao cardápio' }),
    page.getByRole('link', { name: 'Cancelar' }),
    save,
  ]) {
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const details = page.locator('details');
  await expect(details.getByText('Nome do doce')).toBeHidden();
  await details.locator('summary').click();
  await expect(details.getByText('Nome do doce')).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao cardápio' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio$/);
});

test('the price field keeps at most 5 whole digits while typing', async ({ page }) => {
  await page.goto('/admin/cardapio/novo');
  await page.waitForLoadState('networkidle');
  const price = page.getByLabel('Preço em reais');
  await price.pressSequentially('1234567,891');
  await expect(price).toHaveValue('12345,89');
});
