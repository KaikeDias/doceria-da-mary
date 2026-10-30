import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { provideSiteConfig } from '../../core/config/site-config.fixture';
import { provideCatalog } from '../catalog/catalog.fixture';
import { NotFound } from './not-found';

describe('Página não encontrada', () => {
  const robots = () => TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]');

  it('CA01, CA03: link para o início e noindex só enquanto aberta', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Página não encontrada');
    expect(page.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(robots()?.getAttribute('content')).toBe('noindex');
    fixture.destroy();
    expect(robots()).toBeNull();
  });

  it('CA01, CA02, CA04: caminho inexistente mostra a página; / continua na landing', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideCatalog(), provideSiteConfig()],
    });
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/caminho-que-nao-existe', NotFound);
    expect(page).toBeInstanceOf(NotFound);
    expect(TestBed.inject(Title).getTitle()).toBe('Página não encontrada | Doceria da Mary');
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement?.querySelector('app-not-found')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('#cardapio')).toBeTruthy();
    expect(robots()).toBeNull();
  }, 60000);
});
