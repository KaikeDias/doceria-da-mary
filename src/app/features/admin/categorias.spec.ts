import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { loadError, saveError } from '../../core/supabase/supabase';
import { FakeAdminMenuRepository, provideAdmin } from './admin.fixture';

async function setup(repository = new FakeAdminMenuRepository()) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), ...provideAdmin(repository)],
  });
  const harness = await RouterTestingHarness.create('/admin/categorias');
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  await settle();
  const page = harness.fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(page.querySelectorAll('tbody tr'));
  const names = () => rows().map((row) => row.querySelector('td span.font-semibold')?.textContent);
  const switches = () => Array.from(page.querySelectorAll<HTMLInputElement>('tbody [role=switch]'));
  return { harness, page, rows, names, switches, settle };
}

describe('Categorias', () => {
  afterEach(() => vi.useRealTimers());

  it(
    'CA01: opens /admin/categorias with title and current menu item',
    { timeout: 60000 },
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

  it('CA04/CA09 + Supabase CA03: grava, mostra salvamento e muda o status sem reordenar', async () => {
    const repository = new FakeAdminMenuRepository();
    let finish!: () => void;
    const setCategoryVisible = vi.spyOn(repository, 'setCategoryVisible');
    setCategoryVisible.mockImplementationOnce(() => new Promise<void>((done) => (finish = done)));
    const { harness, page, rows, names, switches, settle } = await setup(repository);
    const toggle = switches()[0];
    expect(toggle.getAttribute('aria-label')).toBe('Exibir Bolos no site');
    toggle.click();
    harness.detectChanges();
    expect(switches()[0].checked).toBe(true);
    expect(rows()[0].textContent).toContain('Salvando…');
    expect(toggle.getAttribute('aria-busy')).toBe('true');
    expect(switches().every((input) => input.getAttribute('aria-disabled') === 'true')).toBe(true);
    expect(page.querySelector('[role=status]')?.textContent).toContain('Salvando alterações…');
    switches()[1].click();
    expect(setCategoryVisible).toHaveBeenCalledTimes(1);
    expect(setCategoryVisible).toHaveBeenCalledWith('c-bolos', false);
    finish();
    await settle();
    expect(page.querySelector('[role=status]')?.textContent).toContain('Bolos saiu do site.');
    expect(switches()[0].checked).toBe(false);
    expect(rows()[0].textContent).toContain('Oculta');
    expect(page.querySelector('ul li')?.textContent).toContain('Oculta');
    expect(names()).toHaveLength(5);
    expect(names()[0]).toBe('Bolos');
    switches()[4].click();
    await settle();
    expect(rows()[4].textContent).toContain('Visível');
    expect(page.querySelector('[role=status]')?.textContent).toContain(
      'Datas especiais agora aparece no site.',
    );
    page.querySelector<HTMLButtonElement>('[aria-label="Fechar aviso"]')!.click();
    harness.detectChanges();
    expect(page.querySelector('[role=status]')?.textContent?.trim()).toBe('');
  });

  it('Supabase CA04: falha ao gravar mantém o status e mostra o aviso vermelho', async () => {
    const repository = new FakeAdminMenuRepository();
    vi.spyOn(repository, 'setCategoryVisible').mockRejectedValue(new Error('offline'));
    const { harness, page, rows, switches } = await setup(repository);
    vi.useFakeTimers();
    switches()[0].click();
    await vi.advanceTimersByTimeAsync(0);
    harness.detectChanges();
    expect(switches()[0].checked).toBe(true);
    expect(rows()[0].textContent).toContain('Visível');
    expect(page.querySelector('[role=status] [role=alert]')?.textContent).toContain(saveError);
    await vi.advanceTimersByTimeAsync(5000);
    harness.detectChanges();
    expect(page.querySelector('[role=status]')?.textContent?.trim()).toBe('');
  });

  it('Supabase CA02: carregando, erro e "Tentar de novo"', async () => {
    const repository = new FakeAdminMenuRepository();
    vi.spyOn(repository, 'listCategories').mockRejectedValueOnce(new Error('offline'));
    const { harness, page, rows, settle } = await setup(repository);
    const alert = page.querySelector('[role=alert]')!;
    expect(alert.textContent).toContain(loadError);
    alert.querySelector('button')!.click();
    harness.detectChanges();
    expect(page.textContent).toContain('Carregando categorias…');
    await settle();
    expect(rows()).toHaveLength(5);
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
