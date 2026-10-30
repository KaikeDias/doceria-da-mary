import { expect, test } from '@playwright/test';
import { credentials, mockSupabase } from './supabase-mock';

test('/admin redirects to the cardápio and the login leads to it', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await page.waitForLoadState('networkidle');
  await page.getByLabel('E-mail').fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio$/);
  await expect(page).toHaveTitle('Cardápio | Painel Doceria da Mary');
});

for (const width of [320, 390, 768, 1023, 1024, 1440]) {
  test(`no horizontal scroll at ${width}px and layout switches at 1024px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockSupabase(page, { session: true });
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
  await mockSupabase(page, { session: true });
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

test('mobile drawer slides in from the left and slides back out before hiding', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/cardapio');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const drawer = page.locator('dialog[aria-label="Menu do painel"]');
  expect(await drawer.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0.3s');
  await expect.poll(async () => (await drawer.boundingBox())!.x).toBe(0);
  await page.keyboard.press('Escape');
  // Durante a saída a gaveta continua na tela, indo para a esquerda.
  await expect(drawer).toBeVisible();
  await expect.poll(async () => (await drawer.boundingBox())?.x ?? -1).toBeLessThan(0);
  await expect(drawer).toBeHidden();
});

test('mobile drawer has no transition with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/cardapio');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const drawer = page.locator('dialog[aria-label="Menu do painel"]');
  expect(await drawer.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
});

test('toggling publication updates the indicator and filters', async ({ page }) => {
  await mockSupabase(page, { session: true });
  await page.goto('/admin/cardapio');
  const toggle = page.getByRole('switch', { name: 'Publicar Bolo de Chocolate no site' }).first();
  // A chave só muda quando a gravação termina.
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expect(
    page.locator('div', { has: page.getByText('Publicados no site', { exact: true }) }).last(),
  ).toContainText('4');
  await page.getByRole('button', { name: 'Ocultos' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('searchbox').fill('zzz');
  await expect(page.getByText('Nenhum doce encontrado')).toBeVisible();
});

test('delete confirmation focuses Cancelar, closes on Escape and deletes on confirm', async ({
  page,
}) => {
  await mockSupabase(page, { session: true });
  await page.goto('/admin/cardapio');
  await page.waitForLoadState('networkidle');
  const ask = page.locator('tbody').getByRole('button', { name: 'Excluir Brownie Recheado' });
  await ask.click();
  const dialog = page.getByRole('dialog', { name: 'Excluir Brownie Recheado?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(ask).toBeFocused();
  await ask.click();
  await dialog.getByRole('button', { name: 'Sim, excluir' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await expect(page.getByRole('status')).toContainText(
    'Brownie Recheado foi excluído do cardápio.',
  );
});

test('toggling shows the saving state and then a closable success message', async ({ page }) => {
  await mockSupabase(page, { session: true });
  // Gravação lenta para observar o estado de salvamento.
  await page.route('**/rest/v1/produtos?*', async (route) => {
    if (route.request().method() === 'PATCH') await new Promise((done) => setTimeout(done, 500));
    await route.fallback();
  });
  await page.goto('/admin/cardapio');
  await page.waitForLoadState('networkidle');
  const row = page.locator('tbody tr', { hasText: 'Caixa de Docinhos' });
  await row.getByRole('switch').click();
  await expect(row).toContainText('Salvando…');
  await expect(page.getByRole('status')).toContainText('Salvando alterações…');
  await expect(row).toContainText('Publicado');
  const status = page.getByRole('status');
  await expect(status).toContainText('Caixa de Docinhos agora aparece no site.');
  await status.getByRole('button', { name: 'Fechar aviso' }).click();
  await expect(status).toBeEmpty();
});

for (const width of [320, 1440]) {
  test(`modal and messages fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockSupabase(page, { session: true });
    await page.goto('/admin/cardapio');
    await page.waitForLoadState('networkidle');
    const noScroll = async () =>
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    await page.getByRole('switch').first().click();
    await expect(page.getByRole('status')).toContainText('saiu do site.');
    await noScroll();
    if (width < 1024) {
      const close = page.getByRole('button', { name: 'Fechar aviso' });
      // Espera a animação de entrada do aviso terminar antes de medir.
      await expect.poll(async () => (await close.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page
      .getByRole('button', { name: /^Excluir / })
      .locator('visible=true')
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await noScroll();
    const cancel = await page.getByRole('button', { name: 'Cancelar' }).boundingBox();
    expect(cancel!.height).toBeGreaterThanOrEqual(44);
  });
}

test('wrong credentials stay on /login and "Sair" ends the session', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('E-mail').fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill('errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos.');
  await page.getByLabel('Senha', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/cardapio$/);
  await page.locator('aside').getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/admin/cardapio');
  await expect(page).toHaveURL(/\/login$/);
});

test('hiding a product in the panel removes it from the landing', async ({ page }) => {
  await mockSupabase(page, { session: true });
  await page.goto('/admin/cardapio');
  const toggle = page.getByRole('switch', { name: 'Publicar Brownie Recheado no site' }).first();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await page.goto('/');
  await expect(page.locator('app-product-card')).toHaveCount(4);
  await expect(page.locator('app-product-card', { hasText: 'Brownie Recheado' })).toHaveCount(0);
});
