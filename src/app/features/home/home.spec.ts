import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { categories, products, provideCatalog } from '../catalog/catalog.fixture';
import { SiteConfigRepository, siteConfigDefaults } from '../../core/config/site-config';
import { provideSiteConfig, siteConfig } from '../../core/config/site-config.fixture';
import { publicUrl } from '../../core/supabase/supabase';
import { Home } from './home';
import { Catalog } from '../catalog/catalog-repository';
import { loadError } from '../../core/supabase/supabase';

describe('Atualização do design da landing page', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideCatalog(), provideSiteConfig()] }),
  );

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
      expect(link.href).toContain('https://wa.me/5589994259584');
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
    expect(cards[1].href).toBe('https://www.instagram.com/doceriadamarypl/');
    expect(new URL(cards[0].href).searchParams.get('text')).toBe(
      siteConfigDefaults.whatsappMessage,
    );
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
    TestBed.overrideProvider(SiteConfigRepository, {
      useValue: { load: async () => ({ ...siteConfigDefaults, whatsapp: '123' }) },
    });
    const { fixture, page } = await render();
    expect(page.querySelector('.whatsapp-card')?.textContent?.trim()).toContain(
      'Número a configurar',
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
    TestBed.configureTestingModule({ providers: [provideCatalog(load), provideSiteConfig()] });
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

describe('Landing lendo as configurações do site', () => {
  function setup(load: () => Promise<typeof siteConfig>) {
    TestBed.configureTestingModule({ providers: [provideCatalog(), provideSiteConfig(load)] });
    const fixture = TestBed.createComponent(Home);
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const text = (page: HTMLElement, selector: string) =>
    page.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  it('CA01/CA05: textos e imagens vêm das configurações', async () => {
    const logo = publicUrl('site', 'configuracoes/logo-1.png');
    const hero = publicUrl('site', 'configuracoes/hero-1.webp');
    const { fixture, page } = setup(async () => ({
      ...siteConfig,
      name: 'Mary Doces',
      tagline: 'Feito em casa',
      description: 'Doces para festas.',
      logo,
      heroTitle: 'Doce que abraça.',
      heroSubtitle: 'Receitas de família.',
      heroImage: hero,
      about: 'Começamos na cozinha de casa.',
      ordersTitle: 'Vai ter festa?',
    }));
    await settle(fixture);
    expect(text(page, '.site-header .brand')).toBe('Mary DocesFeito em casa');
    expect(page.querySelector('.site-header .brand')?.getAttribute('aria-label')).toBe(
      'Mary Doces — início',
    );
    expect(page.querySelector('.site-header .brand img')?.getAttribute('src')).toBe(logo);
    expect(page.querySelector('.site-footer .brand img')?.getAttribute('src')).toBe(logo);
    expect(text(page, 'h1')).toBe('Doce que abraça.');
    expect(page.querySelector('h1 br')).toBeNull();
    expect(text(page, '.hero-description')).toBe('Receitas de família.');
    const heroImg = page.querySelector('.hero-picture img')!;
    expect(heroImg.getAttribute('src')).toBe(hero);
    expect(heroImg.getAttribute('alt')).toBe('Doces da Mary Doces');
    expect(text(page, '#sobre .about-copy p:nth-of-type(2)')).toBe('Começamos na cozinha de casa.');
    expect(text(page, '#orders-title')).toBe('Vai ter festa?');
    expect(text(page, '.site-footer .brand')).toBe('Mary Doces');
    expect(text(page, '.footer-bottom')).toContain('© 2026 Mary Doces. Feito com carinho.');
    expect(text(page, '.footer-bottom')).toContain('Doces para festas.');
  });

  it('CA02/CA03: WhatsApp e Instagram das configurações', async () => {
    const { fixture, page } = setup(async () => siteConfig);
    await settle(fixture);
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]'));
    expect(links.every((link) => new URL(link.href).pathname === '/5511987654321')).toBe(true);
    const general = links.filter((link) => !link.closest('app-product-card'));
    expect(general).toHaveLength(4);
    for (const link of general)
      expect(new URL(link.href).searchParams.get('text')).toBe(siteConfig.whatsappMessage);
    const product = page.querySelector<HTMLAnchorElement>(
      'app-product-card a[href^="https://wa.me/"]',
    )!;
    expect(new URL(product.href).searchParams.get('text')).toContain('Bolo de Chocolate');
    expect(text(page, '.whatsapp-card')).toContain('+55 (11) 98765-4321');
    const instagram = page.querySelector<HTMLAnchorElement>('.instagram-card')!;
    expect(instagram.href).toBe('https://www.instagram.com/doceriadamary/');
    expect(instagram.textContent).toContain('@doceriadamary');
  });

  it('SEO CA08: enquanto carrega, textos e imagens padrão; só o contato fica em skeleton e sem link', async () => {
    let release!: (config: typeof siteConfig) => void;
    const { fixture, page } = setup(() => new Promise((done) => (release = done)));
    await settle(fixture);
    expect(text(page, 'h1')).toBe(siteConfigDefaults.heroTitle);
    expect(page.querySelector('.hero-picture img')?.getAttribute('src')).toBe('images/hero.webp');
    expect(page.querySelector('.site-header .brand img')?.getAttribute('src')).toBe('logo.webp');
    expect(page.querySelector('.site-header .brand')?.getAttribute('aria-label')).toBe(
      'Doceria da Mary — início',
    );
    expect(text(page, '#orders-title')).toBe(siteConfigDefaults.ordersTitle);
    expect(text(page, '#sobre .about-copy p:nth-of-type(2)')).toBe(siteConfigDefaults.about);
    expect(page.querySelectorAll('.skeleton')).toHaveLength(2);
    expect(text(page, '.whatsapp-card .contact-detail')).not.toContain('+55');
    expect(page.querySelectorAll('a[href^="https://wa.me/"]')).toHaveLength(0);
    expect(page.querySelectorAll('a[href^="https://www.instagram.com/"]')).toHaveLength(0);
    expect(page.querySelectorAll('app-product-card')).toHaveLength(6);
    for (const skeleton of page.querySelectorAll('.skeleton'))
      expect(skeleton.closest('[aria-hidden=true]')).toBeTruthy();

    release(siteConfig);
    await settle(fixture);
    expect(page.querySelectorAll('.skeleton')).toHaveLength(0);
    expect(text(page, 'h1')).toBe(siteConfig.heroTitle);
    expect(page.querySelectorAll('a[href^="https://wa.me/5511987654321"]')).toHaveLength(10);
  });

  it('CA04/CA05: falha e campos vazios trocam os skeletons pelos padrões; o cardápio carrega', async () => {
    const failed = setup(async () => {
      throw new Error('offline');
    });
    await settle(failed.fixture);
    expect(text(failed.page, 'h1')).toBe(siteConfigDefaults.heroTitle);
    expect(failed.page.querySelectorAll('app-product-card')).toHaveLength(6);
    TestBed.resetTestingModule();

    const empty = setup(async () => ({ ...siteConfig, tagline: '', about: '', ordersTitle: '' }));
    await settle(empty.fixture);
    expect(text(empty.page, '.site-header .brand small')).toBe(siteConfigDefaults.tagline);
    expect(text(empty.page, '#orders-title')).toBe(siteConfigDefaults.ordersTitle);
    expect(empty.page.querySelector('.site-header .brand img')?.getAttribute('src')).toBe(
      'logo.webp',
    );
    const heroImg = empty.page.querySelector('.hero-picture img')!;
    expect(heroImg.getAttribute('src')).toBe('images/hero.webp');
    expect(heroImg.getAttribute('alt')).toContain('Seleção de doces artesanais');
  });
});

describe('SEO da landing', () => {
  function setup(load: () => Promise<typeof siteConfig>) {
    TestBed.configureTestingModule({ providers: [provideCatalog(), provideSiteConfig(load)] });
    const fixture = TestBed.createComponent(Home);
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  const head = () => TestBed.inject(DOCUMENT).head;
  const meta = (selector: string) => head().querySelector(selector)?.getAttribute('content');
  const jsonLd = () => JSON.parse(head().querySelector('#dados-estruturados')!.textContent!);

  afterEach(() => head().querySelector('#dados-estruturados')?.remove());

  it('CA03/CA04/CA09: título, metas, JSON-LD e região padrão antes do banco', async () => {
    const { fixture, page } = setup(() => new Promise(() => {}));
    fixture.detectChanges();
    await fixture.whenStable();
    const title = 'Doceria da Mary | Doces artesanais · Paes Landim, Piauí';
    const description = 'Doces artesanais para momentos especiais. Paes Landim, Piauí.';
    expect(TestBed.inject(Title).getTitle()).toBe(title);
    expect(meta('meta[name=description]')).toBe(description);
    expect(meta('meta[property="og:title"]')).toBe(title);
    expect(meta('meta[property="og:description"]')).toBe(description);
    expect(meta('meta[property="og:site_name"]')).toBe('Doceria da Mary');
    expect(jsonLd()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      name: 'Doceria da Mary',
      description: 'Doces artesanais para momentos especiais.',
      areaServed: 'Paes Landim, Piauí',
      telephone: '+5589994259584',
      sameAs: ['https://www.instagram.com/doceriadamarypl/'],
    });
    expect(page.querySelector('.contact-region')?.textContent?.trim()).toBe(
      'Região atendida: Paes Landim, Piauí',
    );
  });

  it('CA07/CA09/CA11: valores do banco, sem telefone inválido e com "<" escapado', async () => {
    const { fixture, page } = setup(async () => ({
      ...siteConfig,
      name: 'Mary Doces',
      description: 'Doces </script> para festas.',
      whatsapp: '123',
    }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Mary Doces | Doces artesanais · Toda a cidade e região',
    );
    expect(meta('meta[property="og:site_name"]')).toBe('Mary Doces');
    expect(head().querySelectorAll('#dados-estruturados')).toHaveLength(1);
    expect(head().querySelector('#dados-estruturados')!.textContent).not.toContain('</script>');
    const data = jsonLd();
    expect(data.description).toBe('Doces </script> para festas.');
    expect(data.areaServed).toBe('Toda a cidade e região');
    expect(data.telephone).toBeUndefined();
    expect(data.sameAs).toEqual(['https://www.instagram.com/doceriadamary/']);
    expect(page.querySelector('.contact-region')?.textContent?.trim()).toBe(
      'Região atendida: Toda a cidade e região',
    );
  });
});
