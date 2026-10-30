import { TestBed } from '@angular/core/testing';
import { categories, products, provideCatalog } from '../catalog/catalog.fixture';
import { publicConfig } from '../../core/config/public-config';
import { whatsappMessages } from '../../core/config/contact-links';
import { Home } from './home';
import { Catalog } from '../catalog/catalog-repository';
import { loadError } from '../../core/supabase/supabase';

describe('Atualização do design da landing page', () => {
  const configuredContact = publicConfig.contact;
  afterEach(() => Object.defineProperty(publicConfig, 'contact', { value: configuredContact }));

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideCatalog()] }));

  async function render() {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('CA01: apresenta a marca completa, pedido compacto, texto e selo do hero', async () => {
    const { page } = await render();
    expect(page.querySelector('.site-header .brand small')?.textContent?.trim()).toBe(
      'Doces artesanais',
    );
    expect(page.querySelector('.header-order .mobile-copy')?.textContent?.trim()).toBe('Pedir');
    expect(page.querySelector('.menu-toggle')).toBeNull();
    expect(page.querySelector('.hero .eyebrow')?.textContent?.trim()).toContain(
      'especialmente para você',
    );
    expect(page.querySelectorAll('.hero-description')).toHaveLength(1);
    expect(page.querySelector('.hero-description')?.textContent?.trim()).toContain(
      'ingredientes escolhidos',
    );
    expect(page.querySelectorAll('.hero-actions a')).toHaveLength(2);
    expect(page.querySelector('.hero-label')?.textContent?.trim()).toContain('Feito à mão');
    expect(page.querySelector('.hero-picture img')?.getAttribute('fetchpriority')).toBe('high');
  });

  it('CA01–CA05: usa o ícone decorativo do WhatsApp no cabeçalho e no contato', async () => {
    const { page } = await render();
    for (const selector of ['.header-order', '.whatsapp-card']) {
      const link = page.querySelector<HTMLAnchorElement>(selector)!;
      const icon = link.querySelector('img');
      expect(icon?.getAttribute('src')).toBe('icons/whatsapp.svg');
      expect(icon?.getAttribute('alt')).toBe('');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(link.getAttribute('aria-label')).toContain('WhatsApp');
      expect(link.href).toContain(`https://wa.me/${publicConfig.contact.whatsapp}`);
    }
    expect(page.querySelector('[lucideMessageCircle]')).toBeNull();
  });

  it('CA02–CA03: permite explorar e filtrar todas as categorias, restaurando Todos', async () => {
    const { fixture, page } = await render();
    const links = page.querySelectorAll<HTMLAnchorElement>('.category-link');
    const filters = page.querySelectorAll<HTMLButtonElement>('.filter-group button');
    expect(links).toHaveLength(4);
    expect(page.querySelector('.category-caption')?.textContent?.trim()).toContain('cada vontade');
    expect(links[3].textContent).toContain('Kits e presentes');
    expect(page.textContent).not.toContain('Valores ilustrativos para demonstração');
    expect(page.querySelector('.demo-note')).toBeNull();
    categories.forEach((category, index) => {
      expect(links[index].hash).toBe('#cardapio');
      expect(links[index].textContent).toContain('Explorar');
      // Evita somente a navegação nativa do jsdom; mantém o handler Angular ativo.
      links[index].addEventListener('click', (event) => event.preventDefault());
      links[index].click();
      fixture.detectChanges();
      const expected = products.filter((product) => product.categoryId === category.id);
      expect(
        Array.from(page.querySelectorAll('app-product-card h3'), (h3) => h3.textContent?.trim()),
      ).toEqual(expected.map((product) => product.name));
      expect(filters[index + 1].getAttribute('aria-pressed')).toBe('true');
      filters[0].click();
      fixture.detectChanges();
      expect(page.querySelectorAll('app-product-card')).toHaveLength(6);
      expect(filters[0].getAttribute('aria-pressed')).toBe('true');
      filters[index + 1].click();
      fixture.detectChanges();
      expect(page.querySelectorAll('app-product-card')).toHaveLength(expected.length);
    });
  });

  it('CA03–CA04: mantém descrições, ações completas, ambos os parágrafos e badges', async () => {
    const { page } = await render();
    page.querySelectorAll('app-product-card').forEach((card, index) => {
      expect(card.querySelector('.product-description')?.textContent?.trim()).toBe(
        products[index].description,
      );
      expect(card.querySelector('.product-order')?.textContent?.trim()).toContain(
        'Pedir no WhatsApp',
      );
    });
    expect(page.querySelectorAll('.about-copy > p:not(.eyebrow)')).toHaveLength(2);
    expect(page.querySelector('.about-extra')?.textContent?.trim()).toContain('aproxima pessoas');
    expect(page.querySelector('.about-tags')?.textContent?.trim()).toContain('Feito com cuidado');
    expect(page.querySelector('.orders-inner')?.textContent?.trim()).toContain(
      'Vamos conversar sobre a sua encomenda!',
    );
  });

  it('CA05: oferece cards inteiramente clicáveis e preserva contatos e mensagens', async () => {
    const { page } = await render();
    const cards = page.querySelectorAll<HTMLAnchorElement>('.contact-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].classList.contains('whatsapp-card')).toBe(true);
    expect(cards[1].classList.contains('instagram-card')).toBe(true);
    expect(cards[0].textContent).toContain('+55 (89) 99425-9584');
    expect(cards[1].textContent).toContain('@doceriadamarypl');
    expect(cards[1].href).toBe(publicConfig.contact.instagram);
    expect(new URL(cards[0].href).searchParams.get('text')).toBe(whatsappMessages.questions);
    for (const card of cards) {
      expect(card.querySelector('svg, img')).toBeTruthy();
      expect(card.getAttribute('aria-label')).toContain('abre em nova aba');
      expect(card.target).toBe('_blank');
      expect(card.rel).toBe('noopener noreferrer');
      expect(card.querySelector('a, button')).toBeNull();
    }
  });

  it('CA06: preserva salto, âncoras e navegação completa no rodapé', async () => {
    const { page } = await render();
    expect(page.querySelector('.skip-link')?.getAttribute('href')).toBe('#cardapio');
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(page.querySelector(link.hash)).toBeTruthy();
    }
    expect(page.querySelectorAll('.footer-nav a')).toHaveLength(5);
    expect(page.querySelector('.product-grid')?.getAttribute('aria-live')).toBe('polite');
    expect(page.querySelector('main')).toBeTruthy();
    expect(page.querySelector('h1')).toBeTruthy();
    expect(page.querySelectorAll('h1')).toHaveLength(1);
  });

  it('mantém mensagem vazia e contatos indisponíveis sem criar destinos fictícios', async () => {
    Object.defineProperty(publicConfig, 'contact', {
      value: {
        ...publicConfig.contact,
        whatsapp: null,
        instagram: null,
      },
    });
    const { fixture, page } = await render();
    expect(page.querySelector('.whatsapp-card')?.textContent?.trim()).toContain(
      'Número a configurar',
    );
    expect(page.querySelector('.instagram-card')?.textContent?.trim()).toContain(
      'Perfil a configurar',
    );
    for (const link of page.querySelectorAll('[aria-disabled="true"]')) {
      expect(link.hasAttribute('href')).toBe(false);
    }
    const instance = fixture.componentInstance as unknown as { selectCategory(id: string): void };
    instance.selectCategory('categoria-inexistente');
    fixture.detectChanges();
    expect(page.querySelector('.empty-catalog')?.textContent?.trim()).toContain('Nenhum doce');
  });
});

describe('Catálogo público lendo do banco', () => {
  function setup(load: () => Promise<Catalog>) {
    TestBed.configureTestingModule({ providers: [provideCatalog(load)] });
    const fixture = TestBed.createComponent(Home);
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('CA01–CA04: mostra skeletons e aria-busy enquanto carrega e o cardápio do banco depois', async () => {
    let resolve!: (catalog: Catalog) => void;
    const { fixture, page } = setup(() => new Promise((done) => (resolve = done)));
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    const grid = page.querySelector('.product-grid')!;
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(grid.querySelectorAll('.skeleton')).toHaveLength(3);
    expect(page.querySelectorAll('.category-grid .skeleton')).toHaveLength(4);
    expect(page.querySelectorAll('.filter-group button')).toHaveLength(1);

    resolve({ categories: categories.slice(0, 1), products: products.slice(0, 2) });
    await settle(fixture);
    expect(grid.getAttribute('aria-busy')).toBe('false');
    expect(page.querySelectorAll('.skeleton')).toHaveLength(0);
    expect(page.querySelectorAll('.category-link')).toHaveLength(1);
    expect(page.querySelectorAll('app-product-card')).toHaveLength(2);
    expect(page.querySelector('.product-category')?.textContent?.trim()).toBe('Bolos');
  });

  it('CA05: em caso de falha oferece "Tentar de novo", que repete a busca', async () => {
    const load = vi
      .fn<() => Promise<Catalog>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ categories, products });
    const { fixture, page } = setup(load);
    await settle(fixture);
    const alert = page.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain(loadError);
    expect(page.querySelectorAll('.category-link')).toHaveLength(0);
    alert.querySelector('button')!.click();
    await settle(fixture);
    expect(load).toHaveBeenCalledTimes(2);
    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelectorAll('app-product-card')).toHaveLength(6);
  });

  it('CA06: sem produtos publicados avisa que logo haverá doces', async () => {
    const { fixture, page } = setup(async () => ({ categories, products: [] }));
    await settle(fixture);
    expect(page.querySelector('.empty-catalog')?.textContent?.trim()).toBe(
      'Em breve, novos doces por aqui.',
    );
  });

  it('CA07: produto sem preço e sem foto e categoria sem imagem', async () => {
    const { fixture, page } = setup(async () => ({
      categories: [{ ...categories[0], image: '' }],
      products: [{ ...products[0], price: null, image: '' }],
    }));
    await settle(fixture);
    expect(page.querySelector('.category-link img')).toBeNull();
    expect(page.querySelector('.product-price')?.textContent?.trim()).toBe('Sob consulta');
    expect(page.querySelector('.product-photo img')).toBeNull();
    expect(page.querySelector('.product-photo span.bg-base-200')).toBeTruthy();
  });

  it('CA08: filtra por categoria sem buscar de novo', async () => {
    const load = vi.fn(async () => ({ categories, products }));
    const { fixture, page } = setup(load);
    await settle(fixture);
    page.querySelectorAll<HTMLButtonElement>('.filter-group button')[1].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('app-product-card')).toHaveLength(2);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
