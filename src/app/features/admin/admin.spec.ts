import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';

describe('Admin layout', () => {
  beforeEach(() => {
    // jsdom has no dialog implementation; real focus/inert behavior is covered in Chrome.
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: vi.fn(function (this: HTMLDialogElement) {
          this.open = true;
        }),
      },
      close: {
        configurable: true,
        value: vi.fn(function (this: HTMLDialogElement) {
          this.open = false;
        }),
      },
    });
  });

  afterEach(() => {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });

  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/admin/cardapio');
    return { harness, page: harness.fixture.nativeElement as HTMLElement };
  }

  it(
    'CA02/CA08/CA09: menu items, current page, disabled entries and external actions',
    { timeout: 30000 },
    async () => {
      const { page } = await setup();
      const nav = page.querySelector('aside nav')!;
      expect(nav.getAttribute('aria-label')).toBe('Menu do painel');
      expect(nav.querySelector('a[aria-current=page]')?.textContent).toContain('Cardápio');
      const disabled = Array.from(nav.querySelectorAll('[aria-disabled=true]'));
      expect(disabled.map((item) => item.textContent?.trim())).toEqual([
        expect.stringContaining('Configurações'),
      ]);
      expect(nav.querySelector('a[href="/admin/categorias"]')?.textContent).toContain('Categorias');
      expect(disabled.every((item) => !item.hasAttribute('href'))).toBe(true);
      const site = nav.querySelector<HTMLAnchorElement>('a[target=_blank]')!;
      expect(site.getAttribute('href')).toBe('/');
      expect(site.rel).toContain('noopener');
      expect(nav.querySelector('a[href="/login"]')?.textContent).toContain('Sair');
    },
  );

  it('CA09: "Sair" navigates to /login', async () => {
    const { harness, page } = await setup();
    page.querySelector<HTMLAnchorElement>('aside nav a[href="/login"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('CA10: the drawer opens, and closes by button, backdrop and link, not by inner clicks', async () => {
    const { page } = await setup();
    const drawer = page.querySelector<HTMLDialogElement>('dialog')!;
    const open = () => page.querySelector<HTMLButtonElement>('[aria-label="Abrir menu"]')!.click();
    open();
    expect(drawer.open).toBe(true);
    drawer.querySelector<HTMLElement>('nav')!.click();
    expect(drawer.open).toBe(true);
    drawer.querySelector<HTMLButtonElement>('[aria-label="Fechar menu"]')!.click();
    expect(drawer.open).toBe(false);
    open();
    drawer.click();
    expect(drawer.open).toBe(false);
    open();
    drawer.querySelector<HTMLAnchorElement>('a[href="/admin/cardapio"]')!.click();
    expect(drawer.open).toBe(false);
  });

  it('CA11: switches between side menu and drawer with the lg breakpoint classes', async () => {
    const { page } = await setup();
    expect(page.querySelector('aside')?.className).toContain('hidden');
    expect(page.querySelector('aside')?.className).toContain('lg:flex');
    expect(page.querySelector('header')?.className).toContain('lg:hidden');
    expect(page.querySelector('table')?.className).toContain('hidden');
    expect(page.querySelector('ul.lg\\:hidden')).toBeTruthy();
  });
});
