import { TestBed } from '@angular/core/testing';
import { ProductDetails } from './product-details';
import { Product } from './catalog';
import { products, provideCatalog } from './catalog.fixture';
import { Home } from '../home/home';
import { publicConfig } from '../../core/config/public-config';

describe('Modais de detalhes dos produtos', () => {
  const contact = publicConfig.contact;
  const galleryProduct: Product = {
    ...products[0],
    additionalImages: [
      { src: 'test-side.webp', alt: 'Vista lateral do bolo de teste' },
      { src: 'test-slice.webp', alt: 'Fatia do bolo de teste' },
    ],
    information: [
      { icon: 'clock', text: 'Antecedência de teste' },
      { icon: 'snowflake', text: 'Conservação de teste' },
      { icon: 'info', text: 'Informação de teste' },
    ],
  };

  beforeEach(() => {
    // jsdom has no dialog implementation; real focus/inert behavior is covered in Chrome.
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: vi.fn(function (this: HTMLDialogElement) {
          this.open = true;
          this.querySelector<HTMLElement>('[autofocus]')!.focus();
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
    TestBed.resetTestingModule();
    Object.defineProperty(publicConfig, 'contact', { value: contact });
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });

  async function render(product: Product = products[0]) {
    const fixture = TestBed.createComponent(ProductDetails);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('CA01–CA02: apresenta o produto e regras de preço nas duas áreas', async () => {
    const { fixture, page } = await render();
    for (const product of products) {
      fixture.componentRef.setInput('product', product);
      fixture.detectChanges();
      expect(page.querySelector('h2')?.textContent?.trim()).toBe(product.name);
      expect(page.querySelector('.details-description')?.textContent?.trim()).toBe(
        product.details || product.description,
      );
      const variable = product.price!.kind === 'starting-at';
      for (const selector of ['.content-price', '.footer-price']) {
        expect(page.querySelector(`${selector} span`)?.textContent?.trim()).toBe(
          variable ? 'A partir de' : 'Preço',
        );
        expect(page.querySelector(`${selector} strong`)?.textContent?.trim()).toContain(',00');
      }
      expect(page.querySelector('.price-note')?.textContent?.trim() ?? null).toBe(
        variable ? (product.priceNote ?? 'Consulte as opções e o valor final pelo WhatsApp') : null,
      );
    }
    fixture.componentRef.setInput('product', products[0]);
    fixture.detectChanges();
    expect(page.querySelector('.content-price strong')?.textContent?.trim()).toBe('R$\u00a085,00');
    expect(page.querySelector('.details-category')?.textContent?.trim()).toBe('Bolos');
    fixture.componentRef.setInput('product', products[2]);
    fixture.detectChanges();
    expect(page.querySelector('.footer-price strong')?.textContent?.trim()).toBe('R$\u00a018,00');
  });

  it('CA03: percorre miniaturas e setas em ciclo e reinicia quando o produto muda', async () => {
    const { fixture, page } = await render(galleryProduct);
    const click = (selector: string) => {
      page.querySelector<HTMLButtonElement>(selector)!.click();
      fixture.detectChanges();
    };
    expect(page.querySelector('.photo-count')?.textContent?.trim()).toBe('1 / 3');
    click('.previous');
    expect(page.querySelector('.photo-count')?.textContent?.trim()).toBe('3 / 3');
    click('.next');
    expect(page.querySelector('.photo-count')?.textContent?.trim()).toBe('1 / 3');
    click('.thumbnails button:nth-child(2)');
    expect(page.querySelector('.product-image')?.getAttribute('src')).toBe('test-side.webp');
    expect(page.querySelector('.product-image')?.getAttribute('alt')).toBe(
      'Vista lateral do bolo de teste',
    );
    expect(page.querySelectorAll('.thumbnails [aria-pressed="true"]')).toHaveLength(1);
    expect(
      page.querySelector('.thumbnails button:nth-child(2)')?.getAttribute('aria-pressed'),
    ).toBe('true');
    fixture.componentRef.setInput('product', { ...galleryProduct, id: 'outro-produto' });
    fixture.detectChanges();
    expect(page.querySelector('.photo-count')?.textContent?.trim()).toBe('1 / 3');
    fixture.destroy();
    const reopened = await render(galleryProduct);
    expect(reopened.page.querySelector('.photo-count')?.textContent?.trim()).toBe('1 / 3');
  });

  it('CA04: usa dados opcionais para qualquer preço e trata falha de foto sem repetir erro', async () => {
    const { fixture, page } = await render(products[1]);
    expect(
      page.querySelector('.thumbnails, .photo-count, .previous, .next, .good-to-know'),
    ).toBeNull();
    expect(page.querySelector('.details-description')?.textContent?.trim()).toBe(
      products[1].description,
    );
    for (const kind of ['fixed', 'starting-at'] as const) {
      fixture.componentRef.setInput('product', {
        ...galleryProduct,
        price: { kind, amountInCents: 1800 },
      });
      fixture.detectChanges();
      expect(page.querySelectorAll('.good-to-know li')).toHaveLength(3);
      expect(page.querySelectorAll('.info-icon svg')).toHaveLength(3);
    }
    page.querySelector('.product-image')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(page.querySelector('.photo-unavailable')?.textContent?.trim()).toContain(
      products[0].name,
    );
    expect(page.querySelector('.product-image')).toBeNull();
    expect(page.querySelector('.thumbnails button:first-child img')).toBeNull();
    page.querySelector('.thumbnails button:nth-child(2) img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(page.querySelector('.thumbnails button:nth-child(2) img')).toBeNull();
    page.querySelector<HTMLButtonElement>('.next')!.click();
    fixture.detectChanges();
    page.querySelector<HTMLButtonElement>('.next')!.click();
    fixture.detectChanges();
    expect(page.querySelector('.product-image')?.getAttribute('src')).toBe('test-slice.webp');
    expect(page.querySelector('.details-order')?.hasAttribute('href')).toBe(true);
  });

  it('CA08: ignora cliques internos e arraste iniciado no painel; fecha apenas no fundo', async () => {
    const { fixture, page } = await render();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    const dialog = page.querySelector('dialog')!;
    page
      .querySelector('.details-description')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    page
      .querySelector('.details-description')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    page
      .querySelector('.details-panel')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));
    dialog.click();
    expect(closed).not.toHaveBeenCalled();
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    dialog.click();
    expect(closed).toHaveBeenCalledOnce();
  });

  it('CA08: fecha pelo botão e pelo cancelamento nativo de Escape', async () => {
    const { fixture, page } = await render();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    const event = new Event('cancel', { cancelable: true });
    page.querySelector('dialog')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(closed).toHaveBeenCalledOnce();
    page.querySelector<HTMLButtonElement>('.close-button')!.click();
    expect(closed).toHaveBeenCalledTimes(2);
  });

  it('CA08: restaura foco e overflow anterior, com alternativa se o acionador desaparece', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'clip';
    const first = await render();
    expect(document.documentElement.style.overflow).toBe('hidden');
    first.fixture.destroy();
    expect(document.documentElement.style.overflow).toBe('clip');
    expect(document.activeElement).toBe(trigger);
    const fallback = document.createElement('div');
    fallback.className = 'filter-group';
    fallback.innerHTML = '<button>Todos</button>';
    document.body.append(fallback);
    const second = await render();
    trigger.remove();
    second.fixture.destroy();
    expect(document.activeElement).toBe(fallback.firstElementChild);
    fallback.remove();
    const third = await render();
    document.body.focus();
    third.fixture.destroy();
    document.documentElement.style.overflow = previous;
  });

  it('CA09–CA10: oferece pedido seguro/contextual e semântica de diálogo acessível', async () => {
    const { page } = await render();
    const dialog = page.querySelector('dialog')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe(page.querySelector('h2')!.id);
    const link = page.querySelector<HTMLAnchorElement>('.details-order')!;
    expect(link.textContent).toContain('Pedir pelo WhatsApp');
    expect(link.getAttribute('aria-label')).toContain('abre em nova aba');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(new URL(link.href).pathname).toBe(`/${contact.whatsapp}`);
    expect(new URL(link.href).searchParams.get('text')).toContain(products[0].name);
    expect(link.querySelector('img')?.getAttribute('aria-hidden')).toBe('true');
    expect(page.querySelector('.order-caption')?.textContent?.trim()).toBe(
      'Você conversa direto com a Mary — sem compromisso.',
    );
    expect(page.querySelector('.close-button')?.getAttribute('aria-label')).toBe('Fechar detalhes');
  });

  it.each([null, 'inválido'])(
    'CA09: mantém consulta e indica WhatsApp indisponível (%s)',
    async (phone) => {
      Object.defineProperty(publicConfig, 'contact', { value: { ...contact, whatsapp: phone } });
      const { page } = await render();
      const link = page.querySelector('.details-order')!;
      expect(link.hasAttribute('href')).toBe(false);
      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.textContent).toContain('WhatsApp indisponível');
      expect(page.querySelector('h2')?.textContent?.trim()).toBe(products[0].name);
    },
  );

  it('CA08–CA10: mantém Tab e Shift+Tab nos limites e ignora outras teclas', async () => {
    const { page } = await render(galleryProduct);
    const visible = vi
      .spyOn(HTMLElement.prototype, 'getClientRects')
      .mockReturnValue({ length: 1 } as DOMRectList);
    const close = page.querySelector<HTMLButtonElement>('.close-button')!;
    const order = page.querySelector<HTMLAnchorElement>('.details-order')!;
    const key = (target: HTMLElement, shiftKey: boolean) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    };
    close.focus();
    expect(key(close, true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(order);
    expect(key(order, false).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    expect(key(close, false).defaultPrevented).toBe(false);
    order.focus();
    expect(key(order, true).defaultPrevented).toBe(false);
    close.focus();
    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(close);
    visible.mockRestore();
  });

  it('Catálogo do banco CA07: "Sob consulta", observação e produto sem foto', async () => {
    const { fixture, page } = await render({ ...products[1], price: null, image: '' });
    expect(page.querySelector('.product-information')?.textContent).toContain('Sob consulta');
    expect(page.textContent).toContain('Consulte as opções e o valor final pelo WhatsApp');
    expect(page.querySelector('.product-image')).toBeNull();
    expect(page.querySelector('.photo-unavailable')).toBeTruthy();
    fixture.componentRef.setInput('product', { ...products[2], priceNote: 'Só por encomenda' });
    fixture.detectChanges();
    expect(page.textContent).not.toContain('Só por encomenda');
  });

  it('CA11: destruir antes da abertura não altera a rolagem', () => {
    const previous = document.documentElement.style.overflow;
    const fixture = TestBed.createComponent(ProductDetails);
    fixture.destroy();
    expect(document.documentElement.style.overflow).toBe(previous);
  });

  it('CA01–CA08–CA11: integra os seis cards, preserva pedido direto, filtro e estado fechado', async () => {
    TestBed.configureTestingModule({ providers: [provideCatalog()] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('dialog')).toBeNull();
    const cards = page.querySelectorAll('app-product-card');
    for (const [index, card] of Array.from(cards).entries()) {
      for (const selector of ['.product-photo', '.product-name']) {
        const trigger = card.querySelector<HTMLButtonElement>(selector)!;
        trigger.focus();
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.querySelectorAll('dialog')).toHaveLength(1);
        expect(page.querySelector('dialog h2')?.textContent?.trim()).toBe(products[index].name);
        page.querySelector<HTMLButtonElement>('.close-button')!.click();
        fixture.detectChanges();
        expect(page.querySelector('dialog')).toBeNull();
        expect(document.activeElement).toBe(trigger);
      }
      const order = card.querySelector<HTMLAnchorElement>('.product-order')!;
      order.addEventListener('click', (event) => event.preventDefault());
      order.click();
      fixture.detectChanges();
      expect(page.querySelector('dialog')).toBeNull();
    }
    const filter = page.querySelectorAll<HTMLButtonElement>('.filter-group button')[1];
    filter.click();
    fixture.detectChanges();
    page.querySelector<HTMLButtonElement>('.product-name')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('.close-button')!.click();
    fixture.detectChanges();
    expect(filter.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelectorAll('app-product-card')).toHaveLength(2);
  });
});
