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

// jsdom has no dialog implementation; real focus/Esc behavior is covered in Chrome.
function stubDialog() {
  beforeEach(() => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = false;
          this.dispatchEvent(new Event('close'));
        },
      },
    });
  });
  afterEach(() => {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });
}

describe('Categorias', () => {
  stubDialog();
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

  it('Formulário CA07: categoria com produto publicado não pode ser excluída', async () => {
    const repository = new FakeAdminMenuRepository();
    const remove = vi.spyOn(repository, 'deleteCategory');
    const { harness, page } = await setup(repository);
    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Bolos"]')!.click();
    harness.detectChanges();
    const dialog = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=confirm-title]')!;
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Não é possível excluir Bolos');
    expect(dialog.textContent).toContain('Ela tem 2 produtos ativos no cardápio.');
    expect(dialog.querySelectorAll('button')).toHaveLength(1);
    dialog.querySelector('button')!.click();
    expect(dialog.open).toBe(false);
    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Docinhos"]')!.click();
    harness.detectChanges();
    expect(dialog.textContent).toContain('Ela tem 1 produto ativo no cardápio.');
    expect(remove).not.toHaveBeenCalled();
  });

  it('Formulário CA08: confirma, cancela e exclui categorias sem produtos publicados', async () => {
    const repository = new FakeAdminMenuRepository();
    const { harness, page, names, settle } = await setup(repository);
    const dialog = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=confirm-title]')!;
    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Datas especiais"]')!.click();
    harness.detectChanges();
    expect(dialog.textContent).toContain('Excluir a categoria Datas especiais?');
    expect(dialog.textContent).toContain('Ela não tem produtos. Essa ação não dá para desfazer.');
    dialog.querySelector<HTMLButtonElement>('button')!.click();
    expect(dialog.open).toBe(false);
    expect(names()).toHaveLength(5);

    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Kits e presentes"]')!.click();
    harness.detectChanges();
    expect(dialog.textContent).toContain('Ela tem 1 produto oculto. Os doces continuam salvos');
    const [, yes] = Array.from(dialog.querySelectorAll('button'));
    yes.click();
    harness.detectChanges();
    expect(yes.textContent).toContain('Excluindo…');
    await settle();
    expect(dialog.open).toBe(false);
    expect(names()).not.toContain('Kits e presentes');
    expect(page.querySelector('[role=status]')?.textContent).toContain(
      'Kits e presentes foi excluída.',
    );
    expect(repository.items.find((item) => item.id === 'caixa-docinhos')?.categoryId).toBe('');
  });

  it('Formulário CA08: plural de ocultos e falha ao excluir mostra o aviso vermelho', async () => {
    const repository = new FakeAdminMenuRepository();
    repository.items = repository.items.map((item) => ({ ...item, published: false }));
    vi.spyOn(repository, 'deleteCategory').mockRejectedValue(new Error('offline'));
    const { harness, page, names, settle } = await setup(repository);
    const dialog = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=confirm-title]')!;
    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Bolos"]')!.click();
    harness.detectChanges();
    expect(dialog.textContent).toContain('Ela tem 2 produtos ocultos.');
    dialog.click();
    expect(dialog.open).toBe(false);
    page.querySelector<HTMLButtonElement>('[aria-label="Excluir Bolos"]')!.click();
    dialog.querySelectorAll('button')[1].click();
    await settle();
    expect(dialog.open).toBe(false);
    expect(names()).toContain('Bolos');
    expect(page.querySelector('[role=status] [role=alert]')?.textContent).toContain(saveError);
  });

  it('Formulário CA09: lista mostra a imagem da categoria ou o ícone sem imagem', async () => {
    const { rows } = await setup();
    expect(rows()[0].querySelector('img')?.getAttribute('src')).toContain(
      '/site/categorias/c-bolos/capa.webp',
    );
    expect(rows()[4].querySelector('img')).toBeNull();
    expect(rows()[4].querySelector('[aria-hidden=true] svg')).toBeTruthy();
  });

  it('Formulário CA10: botões "Editar" e "Excluir" dos cards mobile abrem os diálogos', async () => {
    const { harness, page } = await setup();
    const [edit, remove] = Array.from(page.querySelectorAll<HTMLButtonElement>('ul li button'));
    edit.click();
    harness.detectChanges();
    const form = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=categoria-title]')!;
    expect(form.open).toBe(true);
    expect(form.querySelector<HTMLInputElement>('#categoria-name')!.value).toBe('Bolos');
    form.close();
    remove.click();
    harness.detectChanges();
    expect(page.querySelector('dialog[aria-labelledby=confirm-title]')?.textContent).toContain(
      'Não é possível excluir Bolos',
    );
  });

  it('CA07/CA09: mobile cards mirror the table; decorative icons are hidden', async () => {
    const { page } = await setup();
    expect(page.querySelector('table')?.className).toContain('lg:table');
    const cards = page.querySelectorAll('ul.lg\\:hidden > li');
    expect(cards).toHaveLength(5);
    expect(cards[4].textContent).toContain('Nenhum produto · Oculta');
    expect(cards[0].textContent).toContain('2 produtos · Visível');
    expect(cards[4].querySelector('[role=switch]')).toBeTruthy();
    expect(
      Array.from(cards[4].querySelectorAll('button')).map((b) => b.textContent?.trim()),
    ).toEqual(['Editar Datas especiais', 'Excluir Datas especiais']);
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    const icons = Array.from(page.querySelectorAll('main svg'));
    expect(icons.every((svg) => svg.closest('[aria-hidden=true]'))).toBe(true);
    expect(page.querySelector('dialog a[href="/admin/categorias"]')?.textContent).toContain(
      'Categorias',
    );
  });
});
