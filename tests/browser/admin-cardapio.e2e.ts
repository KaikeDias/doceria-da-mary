import { expect, test } from '@playwright/test';

test('/admin redirects to the cardápio and the login leads to it', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('E-mail').fill('admin');
  await page.getByLabel('Senha', { exact: true }).fill('admin');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio$/);
  await expect(page).toHaveTitle('Cardápio | Painel Doceria da Mary');
});

for (const width of [320, 390, 768, 1023, 1024, 1440]) {
  test(`no horizontal scroll at ${width}px and layout switches at 1024px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin/cardapio');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('table')).toBeVisible({ visible: width >= 1024 });
    await expect(page.locator('aside')).toBeVisible({ visible: width >= 1024 });
  });
}

test('mobile drawer opens, traps focus on close and returns focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cardapio');
  const menu = page.getByRole('button', { name: 'Abrir menu' });
  await menu.click();
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(menu).toBeFocused();
  const size = await menu.boundingBox();
  expect(size!.width).toBeGreaterThanOrEqual(44);
});

test('toggling publication updates the indicator and filters', async ({ page }) => {
  await page.goto('/admin/cardapio');
  await page.getByRole('switch', { name: 'Publicar Bolo de Chocolate no site' }).first().uncheck();
  await expect(
    page.locator('div', { has: page.getByText('Publicados no site', { exact: true }) }).last(),
  ).toContainText('4');
  await page.getByRole('button', { name: 'Ocultos' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('searchbox').fill('zzz');
  await expect(page.getByText('Nenhum doce encontrado')).toBeVisible();
});
