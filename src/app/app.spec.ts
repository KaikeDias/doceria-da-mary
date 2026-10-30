import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { App } from './app';
import { siteConfigDefaults } from './core/config/site-config';
import { provideSiteConfig } from './core/config/site-config.fixture';
import { provideCatalog } from './features/catalog/catalog.fixture';

describe('Setup', () => {
  it('creates the application shell', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] });
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('loads six products with contextual WhatsApp links and the configured Instagram', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideCatalog(), provideSiteConfig()],
    });
    const harness = await RouterTestingHarness.create('/');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const page = harness.routeNativeElement;
    expect(page?.querySelector('h1')?.textContent).toContain('Adoçando seus');
    expect(page?.querySelector('.header-order')?.classList.contains('btn-primary')).toBe(true);
    expect(page?.querySelector('svg path')).toBeTruthy();
    expect(page?.querySelectorAll('app-product-card')).toHaveLength(6);
    const links = Array.from(
      page?.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]') ?? [],
    );
    expect(links).toHaveLength(10);
    expect(links.every((link) => new URL(link.href).pathname === '/5589994259584')).toBe(true);
    // Botões gerais com a mensagem padrão; cada produto com a sua.
    expect(new Set(links.map((link) => new URL(link.href).searchParams.get('text'))).size).toBe(7);
    expect(new URL(links[0].href).searchParams.get('text')).toBe(
      siteConfigDefaults.whatsappMessage,
    );
    const productLinks = page?.querySelectorAll<HTMLAnchorElement>('app-product-card a');
    expect(new URL(productLinks![0].href).searchParams.get('text')).toContain('Bolo de Chocolate');
    expect(
      page?.querySelectorAll('a[href="https://www.instagram.com/doceriadamarypl/"]'),
    ).toHaveLength(2);
    expect(page?.querySelector('#contato')?.textContent).toContain('+55 (89) 99425-9584');
    expect(page?.querySelector('#contato')?.textContent).toContain('@doceriadamarypl');
    expect(links.every((link) => link.target === '_blank' && link.rel.includes('noopener'))).toBe(
      true,
    );
    const filter = page?.querySelectorAll<HTMLButtonElement>('.filter-group button')[1];
    filter?.click();
    harness.detectChanges();
    expect(page?.querySelectorAll('app-product-card')).toHaveLength(2);
  }, 60000);
});
