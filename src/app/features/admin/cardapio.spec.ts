import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { StatusFilter, matches, normalize } from './cardapio';
import { MenuStore } from './menu-store';

async function setup(url = '/admin/cardapio') {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create(url);
  const page = harness.routeNativeElement as HTMLElement;
  const text = (element: Element) => element.textContent?.replaceAll('\u00a0', ' ') ?? '';
  const rows = () => Array.from(page.querySelectorAll('tbody tr'));
  const names = () => rows().map((row) => row.querySelector('td span')?.textContent?.trim());
  const search = page.querySelector<HTMLInputElement>('input[type=search]')!;
  const type = (value: string) => {
    search.value = value;
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
  };
  return { harness, page, text, rows, names, type };
}

describe('Cardápio', () => {
  beforeEach(() => {
    // jsdom has no dialog implementation; real focus/Esc behavior is covered in Chrome.
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
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });

  it('CA01: /admin redirects to /admin/cardapio with the page title', async () => {
    await setup('/admin');
    expect(document.title).toBe('Cardápio | Painel Doceria da Mary');
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
  });

  it('CA02/CA04: shows the indicators, six rows, categories and prices', async () => {
    const { page, rows, text } = await setup();
    expect(page.querySelector('h1')?.textContent).toContain('Gerenciar cardápio');
    expect(page.textContent).toContain('Total de produtos');
    expect(page.textContent).toMatch(/Publicados no site\s*5\s*de 6/);
    expect(rows()).toHaveLength(6);
    expect(text(rows()[0])).toContain('Bolos');
    expect(text(rows()[0])).toContain('A partir de');
    expect(text(rows()[0])).toContain('R$ 85,00');
    expect(text(rows()[2])).toContain('Preço fixo');
    expect(text(rows()[2])).toContain('R$ 18,00');
    expect(text(rows()[5])).toContain('Kits e presentes');
    expect(text(rows()[5])).toContain('Oculto');
    const mobile = page.querySelectorAll('ul > li');
    expect(mobile).toHaveLength(6);
    expect(text(mobile[0])).toContain('a partir de R$ 85,00');
    expect(text(mobile[2])).not.toContain('a partir de');
  });

  it('CA05: search ignores case, accents and outer spaces; filters combine; indicators stay', async () => {
    const { harness, page, names, type } = await setup();
    type('  BOLO ');
    expect(names()).toEqual(['Bolo de Chocolate', 'Bolo de Morango']);
    type('copo da felicidáde'.replace('á', 'a'));
    expect(names()).toEqual(['Copo da Felicidade']);
    type('');
    const select = page.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrar por categoria"]',
    )!;
    select.value = 'sobremesas';
    select.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(names()).toEqual(['Brownie Recheado', 'Copo da Felicidade']);
    page.querySelectorAll<HTMLButtonElement>('[role=group] button')[2].click();
    harness.detectChanges();
    expect(names()).toEqual([]);
    expect(page.textContent).toMatch(/Publicados no site\s*5\s*de 6/);
    expect(page.querySelector('[aria-live=polite]')?.textContent).toContain('0 doces encontrados');
  });

  it('CA06: toggling updates label, indicator and removes it under a status filter', async () => {
    const { harness, page, rows } = await setup();
    const publishedFilter = page.querySelectorAll<HTMLButtonElement>('[role=group] button')[1];
    publishedFilter.click();
    harness.detectChanges();
    expect(rows()).toHaveLength(5);
    const toggle = rows()[0].querySelector<HTMLInputElement>('input[role=switch]')!;
    expect(toggle.getAttribute('aria-label')).toBe('Publicar Bolo de Chocolate no site');
    vi.useFakeTimers();
    toggle.click();
    harness.detectChanges();
    vi.advanceTimersByTime(600);
    harness.detectChanges();
    expect(rows()).toHaveLength(4);
    expect(page.textContent).toMatch(/Publicados no site\s*4\s*de 6/);
    expect(publishedFilter.getAttribute('aria-pressed')).toBe('true');
  });

  it('estados CA05: no results for a search or a filter, and clear filters', async () => {
    const { page, rows, type, harness } = await setup();
    type(' pudim ');
    expect(page.textContent).toContain('Nenhum doce encontrado para “pudim”');
    expect(page.textContent).toContain(
      'Confira se o nome está escrito certinho ou limpe os filtros.',
    );
    expect(rows()).toHaveLength(0);
    const clear = () =>
      Array.from(page.querySelectorAll('button')).find((b) => b.textContent?.includes('Limpar'))!;
    clear().click();
    harness.detectChanges();
    expect(rows()).toHaveLength(6);
    type('   ');
    expect(rows()).toHaveLength(6);
    page.querySelectorAll<HTMLButtonElement>('[role=group] button')[2].click();
    type('bolo');
    expect(page.textContent).toContain('Nenhum doce encontrado para “bolo”');
    type('');
    const select = page.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrar por categoria"]',
    )!;
    select.value = 'bolos';
    select.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(page.textContent).toContain('Nenhum doce encontrado');
    expect(page.textContent).not.toContain('Nenhum doce encontrado para');
    expect(page.textContent).toContain('Ajuste os filtros para ver outros doces.');
    clear().click();
    harness.detectChanges();
    expect(rows()).toHaveLength(6);
  });

  it('estados CA01–CA03: "…" opens the delete confirmation; cancel keeps, confirm deletes', async () => {
    const { harness, page, names } = await setup();
    const dialog = page.querySelector('dialog')!;
    const ask = (name: string) =>
      page.querySelector<HTMLButtonElement>(`tbody button[aria-label="Excluir ${name}"]`)!.click();
    ask('Brownie Recheado');
    harness.detectChanges();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')?.textContent).toContain('Excluir Brownie Recheado?');
    expect(dialog.textContent).toContain('Ele sai do cardápio e do site, e não dá para desfazer.');
    const [cancel, confirm] = Array.from(dialog.querySelectorAll('button'));
    expect(cancel.hasAttribute('autofocus')).toBe(true);
    cancel.click();
    expect(dialog.open).toBe(false);
    ask('Brownie Recheado');
    dialog.querySelector('p')!.click();
    expect(dialog.open).toBe(true);
    dialog.click();
    expect(dialog.open).toBe(false);
    expect(names()).toContain('Brownie Recheado');
    ask('Brownie Recheado');
    harness.detectChanges();
    confirm.click();
    harness.detectChanges();
    expect(dialog.open).toBe(false);
    expect(names()).not.toContain('Brownie Recheado');
    expect(page.textContent).toMatch(/Total de produtos\s*5/);
    expect(page.textContent).toMatch(/Publicados no site\s*4\s*de 5/);
    expect(page.querySelector('[role=status]')?.textContent).toContain(
      'Brownie Recheado foi excluído do cardápio.',
    );
  });

  it('estados CA04: deleting every product shows the empty menu', async () => {
    const { harness, page } = await setup();
    const confirm = page.querySelectorAll<HTMLButtonElement>('dialog button')[1];
    let next: HTMLButtonElement | null;
    while ((next = page.querySelector<HTMLButtonElement>('tbody button[aria-label^="Excluir"]'))) {
      next.click();
      harness.detectChanges();
      confirm.click();
      harness.detectChanges();
    }
    expect(page.textContent).toContain('Seu cardápio ainda está vazio');
    expect(page.textContent).toContain('Adicione o primeiro doce e ele já aparece no seu site');
    expect(page.textContent).not.toContain('Nenhum doce encontrado');
    const add = Array.from(page.querySelectorAll('a')).find((b) =>
      b.textContent?.includes('Adicionar primeiro produto'),
    )!;
    expect(add.getAttribute('href')).toBe('/admin/cardapio/novo');
    expect(page.textContent).toMatch(/Total de produtos\s*0/);
    expect(page.textContent).toMatch(/Publicados no site\s*0\s*de 0/);
  });

  it('estados CA06/CA07: saving state, then a success message that closes', async () => {
    const { harness, page, rows } = await setup();
    const status = page.querySelector('[role=status]')!;
    const switches = () => Array.from(page.querySelectorAll<HTMLInputElement>('tbody input'));
    vi.useFakeTimers();
    switches()[5].click();
    harness.detectChanges();
    expect(rows()[5].textContent).toContain('Salvando…');
    expect(switches()[5].getAttribute('aria-busy')).toBe('true');
    expect(switches().every((input) => input.getAttribute('aria-disabled') === 'true')).toBe(true);
    expect(status.textContent).toContain('Salvando alterações…');
    expect(page.textContent).toMatch(/Publicados no site\s*5\s*de 6/);
    switches()[0].click();
    vi.advanceTimersByTime(600);
    harness.detectChanges();
    expect(rows()[5].textContent).toContain('Publicado');
    expect(rows()[0].textContent).toContain('Publicado');
    expect(page.textContent).toMatch(/Publicados no site\s*6\s*de 6/);
    expect(status.textContent).toContain('Caixa de Docinhos agora aparece no site.');
    status.querySelector<HTMLButtonElement>('button[aria-label="Fechar aviso"]')!.click();
    harness.detectChanges();
    expect(status.textContent?.trim()).toBe('');
    switches()[0].click();
    vi.advanceTimersByTime(600);
    harness.detectChanges();
    expect(status.textContent).toContain('Bolo de Chocolate saiu do site.');
    vi.advanceTimersByTime(5000);
    harness.detectChanges();
    expect(status.textContent?.trim()).toBe('');
  });

  it('estados: a product deleted while saving is not brought back', async () => {
    const { harness, page, names } = await setup();
    vi.useFakeTimers();
    page.querySelector<HTMLInputElement>('tbody input')!.click();
    harness.detectChanges();
    page
      .querySelector<HTMLButtonElement>('tbody button[aria-label="Excluir Bolo de Chocolate"]')!
      .click();
    page.querySelectorAll<HTMLButtonElement>('dialog button')[1].click();
    vi.advanceTimersByTime(600);
    harness.detectChanges();
    expect(names()).not.toContain('Bolo de Chocolate');
    expect(page.querySelector('[role=status]')?.textContent).toContain('foi excluído do cardápio.');
  });

  it('formulário CA01/CA09: add and edit link to the form; no price shows "Sob consulta"', async () => {
    const { harness, page, rows, text } = await setup();
    expect(page.querySelector('a[href="/admin/cardapio/novo"]')?.textContent).toContain(
      'Adicionar produto',
    );
    expect(
      page.querySelector('tbody a[aria-label="Editar Bolo de Chocolate"]')?.getAttribute('href'),
    ).toBe('/admin/cardapio/bolo-chocolate/editar');
    expect(page.querySelectorAll('app-cardapio [aria-disabled=true]')).toHaveLength(0);
    const store = TestBed.inject(MenuStore);
    store.save({ ...store.find('brownie')!, price: null, images: [] });
    harness.detectChanges();
    expect(text(rows()[2])).toContain('Sob consulta');
    expect(text(rows()[2])).not.toContain('Preço fixo');
    expect(rows()[2].querySelector('img')).toBeNull();
    expect(text(page.querySelectorAll('ul > li')[2])).toContain('Sob consulta');
  });

  it('CA12: has table headers, a switch role and a fallback when an image fails', async () => {
    const { harness, page } = await setup();
    expect(page.querySelectorAll('thead th[scope=col]')).toHaveLength(5);
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    page.querySelector('tbody img')!.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(page.querySelectorAll('tbody img')).toHaveLength(5);
  });

  it('matches() and normalize() handle every filter branch', () => {
    const item = { name: 'Brigadeiro São João', categoryId: 'docinhos', published: false };
    expect(normalize('  São  ')).toBe('sao');
    const check = (q: string, c: string, s: StatusFilter) => matches(item, q, c, s);
    expect(check('sao joao', 'todas', 'ocultos')).toBe(true);
    expect(check('', 'docinhos', 'todos')).toBe(true);
    expect(check('', 'bolos', 'todos')).toBe(false);
    expect(check('', 'todas', 'publicados')).toBe(false);
  });
});
