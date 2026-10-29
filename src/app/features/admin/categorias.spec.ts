import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';

async function setup() {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create('/admin/categorias');
  const page = harness.fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(page.querySelectorAll('tbody tr'));
  const names = () => rows().map((row) => row.querySelector('td span.font-semibold')?.textContent);
  const switches = () => Array.from(page.querySelectorAll<HTMLInputElement>('tbody [role=switch]'));
  return { harness, page, rows, names, switches };
}

describe('Categorias', () => {
  it(
    'CA01: opens /admin/categorias with title and current menu item',
    { timeout: 30000 },
    async () => {
      const { page } = await setup();
      expect(document.title).toBe('Categorias | Painel Doceria da Mary');
      expect(page.querySelector('aside nav a[aria-current=page]')?.textContent).toContain(
        'Categorias',
      );
    },
  );

  it('CA02: shows header, notice, column headers and five rows', async () => {
    const { page, names } = await setup();
    expect(page.querySelector('h1')?.textContent).toContain('Categorias');
    expect(page.textContent).toContain('Agrupe seus doces do jeito que eles aparecem no site');
    expect(page.textContent).toContain('Categorias ocultas somem dos filtros do site');
    const headers = Array.from(page.querySelectorAll('thead th[scope=col]'));
    expect(headers.map((th) => th.textContent?.trim())).toEqual([
      'Categoria',
      'Produtos',
      'Status no site',
      'Ações',
    ]);
    expect(names()).toEqual([
      'Bolos',
      'Docinhos',
      'Sobremesas',
      'Kits e presentes',
      'Datas especiais',
    ]);
  });

  it('CA03: product counts follow the singular, plural and empty rules', async () => {
    const { rows } = await setup();
    const counts = rows().map((row) => row.querySelectorAll('td')[1].textContent?.trim());
    expect(counts).toEqual([
      '2 produtos',
      '1 produto',
      '2 produtos',
      '1 produto',
      'Nenhum produto',
    ]);
  });

  it('CA05: only "Datas especiais" starts hidden', async () => {
    const { switches, rows } = await setup();
    expect(switches().map((input) => input.checked)).toEqual([true, true, true, true, false]);
    expect(rows()[4].textContent).toContain('Oculta');
    expect(rows()[0].textContent).toContain('Visível');
  });

  it('CA04/CA09: toggling flips label and state without reordering', async () => {
    const { harness, page, rows, names, switches } = await setup();
    const toggle = switches()[0];
    expect(toggle.getAttribute('aria-label')).toBe('Exibir Bolos no site');
    toggle.click();
    harness.detectChanges();
    expect(switches()[0].checked).toBe(false);
    expect(rows()[0].textContent).toContain('Oculta');
    expect(page.querySelector('ul li')?.textContent).toContain('Oculta');
    expect(names()).toHaveLength(5);
    expect(names()[0]).toBe('Bolos');
    switches()[4].click();
    harness.detectChanges();
    expect(rows()[4].textContent).toContain('Visível');
  });

  it('CA06: unavailable actions are marked and do nothing', async () => {
    const { harness, page, switches } = await setup();
    const disabled = Array.from(
      page.querySelectorAll<HTMLButtonElement>('main button[aria-disabled=true]'),
    );
    // 1 add button + edit/delete for 5 rows in table and in cards.
    expect(disabled).toHaveLength(21);
    expect(disabled[0].textContent).toContain('Adicionar categoria');
    expect(disabled[0].textContent).toContain('(em breve)');
    expect(disabled[1].getAttribute('aria-label')).toBe('Editar Bolos (em breve)');
    expect(disabled[2].getAttribute('aria-label')).toBe('Excluir Bolos (em breve)');
    disabled.forEach((button) => {
      button.click();
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/admin/categorias');
    expect(switches().map((input) => input.checked)).toEqual([true, true, true, true, false]);
  });

  it('CA07/CA09: mobile cards mirror the table; decorative icons are hidden', async () => {
    const { page } = await setup();
    expect(page.querySelector('table')?.className).toContain('lg:table');
    const cards = page.querySelectorAll('ul.lg\\:hidden > li');
    expect(cards).toHaveLength(5);
    expect(cards[4].textContent).toContain('Nenhum produto');
    expect(cards[4].querySelector('[role=switch]')).toBeTruthy();
    expect(cards[4].querySelectorAll('[aria-disabled=true]')).toHaveLength(2);
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    const icons = Array.from(page.querySelectorAll('main svg'));
    expect(icons.every((svg) => svg.closest('[aria-hidden=true]'))).toBe(true);
    expect(page.querySelector('dialog a[href="/admin/categorias"]')?.textContent).toContain(
      'Categorias',
    );
  });
});
