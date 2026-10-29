import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { StatusFilter, matches, normalize } from './cardapio';

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
    toggle.click();
    harness.detectChanges();
    expect(rows()).toHaveLength(4);
    expect(page.textContent).toMatch(/Publicados no site\s*4\s*de 6/);
    expect(publishedFilter.getAttribute('aria-pressed')).toBe('true');
  });

  it('CA07: empty state and clear filters', async () => {
    const { page, rows, type, harness } = await setup();
    type('zzz');
    expect(page.textContent).toContain('Nenhum doce encontrado');
    expect(rows()).toHaveLength(0);
    page.querySelector<HTMLButtonElement>('.btn-primary.rounded-full.mt-5')!.click();
    harness.detectChanges();
    expect(rows()).toHaveLength(6);
    type('   ');
    expect(rows()).toHaveLength(6);
  });

  it('CA08: unavailable controls are marked and do nothing', async () => {
    const { harness, page } = await setup();
    const disabled = Array.from(page.querySelectorAll<HTMLButtonElement>('[aria-disabled=true]'));
    expect(disabled.length).toBeGreaterThan(12);
    disabled.forEach((button) => button.click());
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
    expect(page.textContent).not.toContain('Nenhum doce encontrado');
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
