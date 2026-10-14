import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { App } from './app';
import { publicConfig } from './core/config/public-config';

describe('Setup', () => {
  it('creates the application shell', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] });
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('loads the public landing page with six products and safe contact placeholders', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create('/');
    const page = harness.routeNativeElement;
    expect(page?.querySelector('h1')?.textContent).toContain('Adoçando seus');
    expect(page?.querySelector('button')?.classList.contains('btn-primary')).toBe(true);
    expect(page?.querySelector('svg path')).toBeTruthy();
    expect(page?.querySelectorAll('app-product-card')).toHaveLength(6);
    expect(page?.querySelector('a[href^="https://wa.me"]')).toBeNull();
    const buttons = page?.querySelectorAll<HTMLButtonElement>('app-product-card button');
    expect(Array.from(buttons ?? []).every((button) => button.disabled)).toBe(true);
    const filter = page?.querySelectorAll<HTMLButtonElement>('.filter-group button')[1];
    filter?.click();
    harness.detectChanges();
    expect(page?.querySelectorAll('app-product-card')).toHaveLength(2);
  }, 30000);

  it('keeps all external configurations unset', () => {
    expect(Object.values(publicConfig.contact).every((value) => value === null)).toBe(true);
    expect(publicConfig.apiUrl).toBeNull();
  });
});
