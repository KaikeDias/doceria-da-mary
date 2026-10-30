import { expect, test } from '@playwright/test';
import { mockSupabase } from './supabase-mock';

// PNG 1×1 válido para o upload.
const png = {
  name: 'logo.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
};

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`configurações: sem rolagem horizontal em ${width}px e barra sem cobrir o último campo`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockSupabase(page, { session: true });
    await page.goto('/admin/configuracoes');
    await expect(page.getByLabel('Nome da doceria')).toHaveValue('Doceria da Mary');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const last = page.getByLabel('Título da chamada para encomendas');
    await last.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const field = (await last.boundingBox())!;
    const bar = (await page.locator('#config-status').locator('..').boundingBox())!;
    expect(field.y + field.height).toBeLessThanOrEqual(bar.y);
  });
}

test('configurações: alvos ≥ 44px no mobile e item ativo no menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSupabase(page, { session: true });
  await page.goto('/admin/configuracoes');
  await expect(page.getByLabel('Nome da doceria')).toBeVisible();
  for (const target of await page
    .locator('main nav a, main form button, main form label.btn, main form a')
    .all()) {
    if (!(await target.isVisible())) continue;
    const box = (await target.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(
    page.locator('form').getByRole('link', { name: 'Visualizar site (abre em nova aba)' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Configurações' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('configurações: erros, gravação e landing atualizada', async ({ page, context }) => {
  const db = await mockSupabase(page, { session: true });
  await page.goto('/admin/configuracoes');
  const save = page.getByRole('button', { name: 'Salvar alterações' });
  await expect(save).toBeDisabled();
  await expect(page.locator('#config-status')).toHaveText('Nenhuma alteração pendente');

  await page.getByLabel('Número de WhatsApp').fill('119876');
  await page.getByLabel('Instagram').fill('doceria da mary');
  await page.getByLabel('E-mail de contato').fill('mary@');
  await page.getByLabel('Título principal').fill('');
  await save.click();
  await expect(page.getByRole('alert')).toContainText('Falta corrigir 4 campos antes de salvar.');
  await expect(page.getByLabel('Número de WhatsApp')).toBeFocused();

  await page.getByLabel('Número de WhatsApp').fill('+55 (21) 91234-5678');
  await expect(page.getByLabel('Número de WhatsApp')).toHaveValue('(21) 91234-5678');
  await page.getByLabel('Instagram').fill('https://www.instagram.com/mary.doces/');
  await page.getByLabel('E-mail de contato').fill('');
  await page.getByLabel('Título principal').fill('Doce que abraça.');
  await page.locator('#config-logo').setInputFiles(png);
  await expect(page.locator('#config-status')).toContainText('Alterações não salvas');
  await save.click();

  await expect(page.getByRole('status').filter({ hasText: 'Alterações salvas!' })).toBeVisible();
  await expect(page.locator('#config-status')).toHaveText('Tudo salvo');
  await expect(page.getByLabel('Instagram')).toHaveValue('mary.doces');
  expect(db.config).toMatchObject({
    whatsapp: '21912345678',
    instagram: 'mary.doces',
    email_contato: null,
    hero_titulo: 'Doce que abraça.',
  });
  expect(db.config.logo_path).toMatch(/^configuracoes\/logo-[\w-]+\.png$/);

  const landing = await context.newPage();
  await mockSupabase(landing);
  // O mock da nova página começa do seed: aplica o que foi salvo.
  await landing.route('**/rest/v1/configuracoes_site*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(db.config) }),
  );
  await landing.goto('/');
  await expect(landing.locator('h1')).toHaveText('Doce que abraça.');
  await expect(landing.locator('.instagram-card')).toContainText('@mary.doces');
  await expect(landing.locator('.header-order')).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/5521912345678\?text=/,
  );
});

test('configurações: falha ao salvar mantém os dados e "Tentar de novo" grava', async ({
  page,
}) => {
  const db = await mockSupabase(page, { session: true });
  await page.goto('/admin/configuracoes');
  await page.getByLabel('Horário de atendimento').fill('Terça a sábado, das 10h às 19h');
  await page.route('**/rest/v1/configuracoes_site*', (route) =>
    route.request().method() === 'PATCH' ? route.abort() : route.fallback(),
  );
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('alert')).toContainText('Não conseguimos salvar agora.');
  await expect(page.getByLabel('Horário de atendimento')).toHaveValue(
    'Terça a sábado, das 10h às 19h',
  );
  await page.unroute('**/rest/v1/configuracoes_site*');
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await expect(page.locator('#config-status')).toHaveText('Tudo salvo');
  expect(db.config.horario_atendimento).toBe('Terça a sábado, das 10h às 19h');
});

for (const width of [390, 1440]) {
  test(`configurações: mensagem longa sem espaços fica dentro da prévia em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockSupabase(page, { session: true });
    await page.goto('/admin/configuracoes');
    await page.getByLabel('Mensagem padrão do WhatsApp').fill(`Olá, Mary! ${'asd'.repeat(40)}`);
    const preview = (await page.locator('figure').boundingBox())!;
    const bubble = (await page.locator('figure p').first().boundingBox())!;
    expect(bubble.x + bubble.width).toBeLessThanOrEqual(preview.x + preview.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}
