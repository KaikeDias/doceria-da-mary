import { expect, test } from '@playwright/test';
import { mockSupabase } from './supabase-mock';

for (const width of [320, 390, 768, 1023, 1024, 1440]) {
  test(`categorias: no horizontal scroll at ${width}px and layout switches at 1024px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockSupabase(page, { session: true });
    await page.goto('/admin/categorias');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('table')).toBeVisible({ visible: width >= 1024 });
    await expect(page.locator('main ul')).toBeVisible({ visible: width < 1024 });
  });
}

test('categorias: mobile targets are at least 44px and the drawer highlights Categorias', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  for (const target of await page.locator('main ul button, main ul label').all()) {
    const box = (await target.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Categorias' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('categorias: switch toggles by keyboard with visible focus', async ({ page }) => {
  await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  await page.waitForLoadState('networkidle');
  const toggle = page.getByRole('switch', { name: 'Exibir Bolos no site' }).first();
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect(page.locator('tbody tr').first()).toContainText('Oculta');
  await expect(page.locator('tbody tr')).toHaveCount(5);
});

// PNG 1×1 válido para o upload.
const png = {
  name: 'capa.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
};

test('categorias: cria, renomeia e exclui uma categoria', async ({ page }) => {
  const db = await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  await page.getByRole('button', { name: 'Adicionar categoria' }).click();
  const form = page.getByRole('dialog', { name: 'Nova categoria' });
  await expect(form).toBeVisible();
  await form.getByRole('button', { name: 'Salvar categoria' }).click();
  await expect(form).toContainText('Informe o nome da categoria.');
  await expect(form).toContainText('Escolha uma imagem para a categoria.');
  await expect(form.getByLabel('Nome da categoria')).toBeFocused();
  await form.getByLabel('Nome da categoria').fill('Datas comemorativas');
  await form.locator('#categoria-image').setInputFiles(png);
  await expect(form.getByRole('img', { name: 'Imagem da categoria' })).toBeVisible();
  await form.getByRole('button', { name: 'Salvar categoria' }).click();
  await expect(form).toBeHidden();
  await expect(page.getByRole('status')).toContainText(
    'Datas comemorativas foi adicionada às categorias.',
  );
  const row = page.locator('tbody tr', { hasText: 'Datas comemorativas' });
  await expect(row.locator('img')).toBeVisible();
  const created = db.categories.find((c) => c.slug === 'datas-comemorativas')!;
  expect(created).toMatchObject({ nome: 'Datas comemorativas', rotulo: 'Datas comemorativas' });
  expect(created.imagem_url).toMatch(/^categorias\/c-datas-comemorativas\/.+\.png$/);

  await row.getByRole('button', { name: 'Editar Datas comemorativas' }).click();
  const edit = page.getByRole('dialog', { name: 'Editar categoria' });
  await edit.getByLabel('Nome da categoria').fill('bolos');
  await edit.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(edit).toContainText('Já existe uma categoria com esse nome.');
  await edit.getByLabel('Nome da categoria').fill('Festas');
  await edit.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações em Festas salvas.');
  expect(created).toMatchObject({ nome: 'Festas', rotulo: 'Festas', slug: 'datas-comemorativas' });

  await page.getByRole('button', { name: 'Editar Festas' }).first().click();
  await edit.getByRole('button', { name: 'Excluir categoria' }).click();
  const confirm = page.getByRole('dialog', { name: 'Excluir a categoria Festas?' });
  await expect(confirm).toContainText('Ela não tem produtos.');
  await confirm.getByRole('button', { name: 'Sim, excluir' }).click();
  await expect(page.getByRole('status')).toContainText('Festas foi excluída.');
  await expect(edit).toBeHidden();
  await expect(page.locator('tbody tr')).toHaveCount(5);
});

test('categorias: exclusão bloqueada com produtos publicados; Esc fecha e devolve o foco', async ({
  page,
}) => {
  await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  const remove = page.getByRole('button', { name: 'Excluir Bolos' }).first();
  await remove.click();
  const blocked = page.getByRole('dialog', { name: 'Não é possível excluir Bolos' });
  await expect(blocked).toContainText('Ela tem 2 produtos ativos no cardápio.');
  await blocked.getByRole('button', { name: 'Entendi' }).click();
  await expect(blocked).toBeHidden();

  const edit = page.getByRole('button', { name: 'Editar Docinhos' }).first();
  await edit.click();
  await expect(page.getByRole('dialog', { name: 'Editar categoria' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Editar categoria' })).toBeHidden();
  await expect(edit).toBeFocused();
});

test('categorias: no mobile o formulário abre como painel inferior com rodapé visível', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  await page.getByRole('button', { name: 'Editar Bolos' }).last().click();
  const form = page.getByRole('dialog', { name: 'Editar categoria' });
  // Sobe da borda de baixo (transição em `translate`) e termina encostado nela.
  expect(await form.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0.3s');
  await expect
    .poll(async () => {
      const { y, height } = (await form.boundingBox())!;
      return Math.round(y + height);
    })
    .toBe(844);
  const box = (await form.boundingBox())!;
  expect(box.width).toBe(390);
  await expect(form.getByRole('button', { name: 'Salvar alterações' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const target of await form.locator('button, label:has(input[type=file])').all()) {
    if (!(await target.isVisible())) continue;
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

for (const { name, width, reducedMotion } of [
  { name: 'desktop', width: 1440, reducedMotion: 'no-preference' as const },
  { name: 'reduzir movimento', width: 390, reducedMotion: 'reduce' as const },
]) {
  test(`categorias: sem transição do painel no ${name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width, height: 844 });
    await mockSupabase(page, { session: true });
    await page.goto('/admin/categorias');
    await page.getByRole('button', { name: 'Adicionar categoria' }).click();
    const form = page.getByRole('dialog', { name: 'Nova categoria' });
    expect(await form.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
  });
}

test('categorias: no mobile o painel desce ao fechar e só então some', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/categorias');
  await page.getByRole('button', { name: 'Editar Bolos' }).last().click();
  const sheet = page.locator('dialog[aria-labelledby=categoria-title]');
  await expect.poll(async () => Math.round((await sheet.boundingBox())!.y)).toBeLessThan(100);
  await page.keyboard.press('Escape');
  // Durante a descida o painel continua na tela, abaixo da posição aberta.
  expect(await sheet.evaluate((el) => (el as HTMLDialogElement).open)).toBe(false);
  await expect(sheet).toBeVisible();
  await expect.poll(async () => (await sheet.boundingBox())?.y ?? 844).toBeGreaterThan(100);
  await expect(sheet).toBeHidden();
  await expect(sheet.locator('img').first()).toBeHidden();
});
