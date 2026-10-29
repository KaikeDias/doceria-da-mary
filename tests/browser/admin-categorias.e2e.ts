import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1023, 1024, 1440]) {
  test(`categorias: no horizontal scroll at ${width}px and layout switches at 1024px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
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
