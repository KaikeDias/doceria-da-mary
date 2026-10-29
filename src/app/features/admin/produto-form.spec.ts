import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { MenuStore } from './menu-store';
import { limitPrice, parsePrice } from './produto-form';

async function setup(url = '/admin/cardapio/novo') {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create(url);
  const page = () => harness.routeNativeElement as HTMLElement;
  const field = <T extends HTMLElement>(id: string) => page().querySelector<T>(`#produto-${id}`)!;
  const fill = (id: string, value: string) => {
    const element = field<HTMLInputElement>(id);
    element.value = value;
    element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input'));
    harness.detectChanges();
  };
  const submit = async () => {
    page().querySelector('form')!.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const preview = () =>
    page().querySelector('form aside')!.textContent!.replaceAll(' ', ' ').replace(/\s+/g, ' ');
  const files = (...types: string[]) =>
    types.map((type, i) => new File(['x'], `f${i}`, { type })) as unknown as FileList;
  return { harness, page, field, fill, submit, preview, files };
}

describe('Formulário de produto', () => {
  let count = 0;
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => `blob:foto-${++count}`);
    URL.revokeObjectURL = vi.fn();
  });

  it('parsePrice() accepts comma or dot with up to two decimals', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('  ')).toBeNull();
    expect(parsePrice('85')).toBe(8500);
    expect(parsePrice(' 85,5 ')).toBe(8550);
    expect(parsePrice('18.90')).toBe(1890);
    expect(parsePrice('abc')).toBeNaN();
    expect(parsePrice('1,234')).toBeNaN();
    expect(parsePrice('99999,99')).toBe(9999999);
    expect(parsePrice('100000')).toBeNaN();
    expect(parsePrice('0')).toBe(0);
  });

  it('limitPrice() keeps at most 5 whole digits and 2 decimals while typing', () => {
    expect(limitPrice('123456')).toBe('12345');
    expect(limitPrice('12,345')).toBe('12,34');
    expect(limitPrice('99999.999')).toBe('99999.99');
    expect(limitPrice('R$ 1a2')).toBe('12');
    expect(limitPrice('1.2.3')).toBe('1.2');
    expect(limitPrice('')).toBe('');
  });

  it('CA03: the price field does not accept more than 5 digits', async () => {
    const { field, fill } = await setup();
    fill('price', '1234567');
    expect(field<HTMLInputElement>('price').value).toBe('12345');
    fill('price', '12345,678');
    expect(field<HTMLInputElement>('price').value).toBe('12345,67');
    fill('price', 'abc');
    expect(field<HTMLInputElement>('price').value).toBe('');
  });

  it('CA01/CA11: new product page with title, trail and semantics', async () => {
    const { page, field } = await setup();
    expect(document.title).toBe('Novo produto | Painel Doceria da Mary');
    expect(page().querySelectorAll('h1')).toHaveLength(1);
    expect(page().querySelector('h1')?.textContent).toContain('Novo produto');
    const trail = page().querySelector('nav[aria-label=Trilha]')!;
    expect(trail.querySelector('a')?.getAttribute('href')).toBe('/admin/cardapio');
    expect(trail.querySelector('[aria-current=page]')?.textContent).toContain('Adicionar produto');
    expect(page().querySelector('a[aria-label="Voltar ao cardápio"]')).not.toBeNull();
    for (const id of ['name', 'category', 'description', 'price']) {
      expect(page().querySelector(`label[for=produto-${id}]`)).not.toBeNull();
      expect(field(id).getAttribute('aria-invalid')).not.toBe('true');
    }
    expect(page().querySelector('button[type=submit]')?.textContent).toContain('Salvar produto');
    expect(page().querySelector('a.btn-outline')?.getAttribute('href')).toBe('/admin/cardapio');
  });

  it('CA01: the list buttons lead to the form', async () => {
    const { harness, page } = await setup('/admin/cardapio');
    page().querySelector<HTMLAnchorElement>('a[href="/admin/cardapio/novo"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio/novo');
    await harness.navigateByUrl('/admin/cardapio');
    page()
      .querySelector<HTMLAnchorElement>('tbody a[aria-label="Editar Bolo de Chocolate"]')!
      .click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio/bolo-chocolate/editar');
    expect(document.title).toBe('Editar produto | Painel Doceria da Mary');
  });

  it('CA02: editing opens filled in; an unknown id goes back to the list', async () => {
    const { harness, page, field, preview } = await setup('/admin/cardapio/bolo-chocolate/editar');
    expect(page().querySelector('h1')?.textContent).toContain('Editar produto');
    expect(field<HTMLInputElement>('name').value).toBe('Bolo de Chocolate');
    expect(field<HTMLSelectElement>('category').value).toBe('bolos');
    expect(field<HTMLTextAreaElement>('description').value).toContain('Massa fofinha');
    expect(field<HTMLInputElement>('price').value).toBe('85,00');
    expect(page().querySelector<HTMLInputElement>('input.checkbox')!.checked).toBe(true);
    expect(page().querySelector('section li img')?.getAttribute('src')).toBe(
      'images/chocolate-cake.webp',
    );
    expect(preview()).toContain('A partir de R$ 85,00');
    expect(page().querySelector('button[type=submit]')?.textContent).toContain('Salvar alterações');
    await harness.navigateByUrl('/admin/cardapio/nao-existe/editar');
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
  });

  it('CA03: invalid fields show messages, focus the first one and save nothing', async () => {
    const { page, field, fill, submit } = await setup();
    await submit();
    expect(page().textContent).toContain('Informe o nome do produto.');
    expect(page().textContent).toContain('Escolha uma categoria.');
    expect(field('name').getAttribute('aria-invalid')).toBe('true');
    expect(field('name').getAttribute('aria-describedby')).toBe('produto-name-error');
    expect(document.activeElement).toBe(field('name'));
    fill('name', 'Pudim');
    expect(page().textContent).not.toContain('Informe o nome do produto.');
    await submit();
    expect(document.activeElement).toBe(field('category'));
    fill('category', 'sobremesas');
    for (const value of ['0', ',5']) {
      fill('price', value);
      await submit();
      expect(page().textContent).toContain('Informe um preço válido de até 99.999,99, como 85,00.');
      expect(field('price').getAttribute('aria-describedby')).toContain('produto-price-error');
      expect(document.activeElement).toBe(field('price'));
    }
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio/novo');
    expect(TestBed.inject(MenuStore).items()).toHaveLength(6);
  });

  it('CA04: description counter and "A partir de" only with a price', async () => {
    const { page, field, fill } = await setup();
    expect(page().textContent).toContain('0/300');
    expect(field('description').getAttribute('maxlength')).toBe('300');
    fill('description', 'Doce de leite');
    expect(page().textContent).toContain('13/300');
    const startingAt = page().querySelector<HTMLInputElement>('input.checkbox')!;
    expect(startingAt.disabled).toBe(true);
    fill('price', '12');
    expect(startingAt.disabled).toBe(false);
  });

  it('CA05: the preview starts with defaults and follows the form', async () => {
    const { harness, page, fill, preview, files } = await setup();
    expect(preview()).toContain('Categoria');
    expect(preview()).toContain('Nome do doce');
    expect(preview()).toContain('A descrição do doce aparece aqui.');
    expect(preview()).toContain('Sob consulta');
    expect(preview()).toContain('Pedir no WhatsApp');
    expect(page().querySelector('form aside a')).toBeNull();
    fill('name', '  Mini Bolo de Morango ');
    fill('category', 'bolos');
    fill('description', 'Versão individual.');
    fill('price', '18');
    expect(preview()).toContain('Bolos');
    expect(preview()).toContain('Mini Bolo de Morango');
    expect(preview()).toContain('Versão individual.');
    expect(preview()).toContain('R$ 18,00');
    expect(preview()).not.toContain('A partir de');
    page().querySelector<HTMLInputElement>('input.checkbox')!.click();
    harness.detectChanges();
    expect(preview()).toContain('A partir de R$ 18,00');
    const input = page().querySelector<HTMLInputElement>('input[type=file]')!;
    Object.defineProperty(input, 'files', { value: files('image/png'), configurable: true });
    input.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(page().querySelector('form aside img')?.getAttribute('src')).toMatch(/^blob:foto-/);
    expect(page().querySelector('details')?.textContent).toContain('Mini Bolo de Morango');
  });

  it('CA06: pick and drop photos, main photo, remove and notices', async () => {
    const { harness, page, files } = await setup();
    const thumbs = () => Array.from(page().querySelectorAll<HTMLImageElement>('section li img'));
    const drop = (list: FileList) => {
      const event = new Event('drop', { cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', { value: { files: list } });
      page().querySelector('.border-dashed')!.dispatchEvent(event);
      harness.detectChanges();
    };
    const input = page().querySelector<HTMLInputElement>('input[type=file]')!;
    Object.defineProperty(input, 'files', { value: files('image/png', 'image/jpeg') });
    input.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(thumbs()).toHaveLength(2);
    expect(page().querySelector('section li')?.textContent).toContain('Principal');
    drop(files('application/pdf', 'image/webp'));
    expect(thumbs()).toHaveLength(3);
    expect(page().querySelector('[role=status]')?.textContent).toContain(
      'Só dá para enviar imagens.',
    );
    const second = thumbs()[1].src;
    page()
      .querySelector<HTMLButtonElement>('[aria-label="Definir foto 2 como principal"]')!
      .click();
    harness.detectChanges();
    expect(thumbs()[0].src).toBe(second);
    page().querySelector<HTMLButtonElement>('[aria-label="Remover foto 1"]')!.click();
    harness.detectChanges();
    expect(thumbs()).toHaveLength(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(second);
    drop(files('image/png', 'image/png', 'image/png', 'image/png'));
    expect(thumbs()).toHaveLength(5);
    expect(page().querySelector('[role=status]')?.textContent).toContain(
      'Você pode enviar até 5 fotos.',
    );
    expect(page().querySelector('input[type=file]')).toBeNull();
  });

  it('CA06: removing a catalog photo does not revoke it', async () => {
    const { harness, page } = await setup('/admin/cardapio/brownie/editar');
    page().querySelector<HTMLButtonElement>('[aria-label="Remover foto 1"]')!.click();
    harness.detectChanges();
    expect(page().querySelector('section li img')).toBeNull();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    expect(page().querySelector('form aside [aria-hidden=true] svg')).not.toBeNull();
  });

  it('CA07: saving a new product adds it published at the end with a message', async () => {
    const { page, fill, submit } = await setup();
    fill('name', ' Pudim ');
    fill('category', 'sobremesas');
    fill('description', ' Cremoso. ');
    fill('price', '25,5');
    await submit();
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
    const items = TestBed.inject(MenuStore).items();
    expect(items).toHaveLength(7);
    expect(items[6]).toMatchObject({
      name: 'Pudim',
      categoryId: 'sobremesas',
      description: 'Cremoso.',
      price: { kind: 'fixed', amountInCents: 2550 },
      images: [],
      published: true,
    });
    expect(page().textContent).toMatch(/Total de produtos\s*7/);
    expect(page().textContent).toMatch(/Publicados no site\s*6\s*de 7/);
    expect(page().querySelector('[role=status]')?.textContent).toContain(
      'Pudim foi adicionado ao cardápio.',
    );
    expect(TestBed.inject(MenuStore).flash()).toBe('');
  });

  it('CA08: saving an edit keeps position and status; empty price becomes "Sob consulta"', async () => {
    const { page, fill, submit } = await setup('/admin/cardapio/caixa-docinhos/editar');
    fill('name', 'Caixa Presente');
    fill('price', '');
    await submit();
    const items = TestBed.inject(MenuStore).items();
    expect(items).toHaveLength(6);
    expect(items[5]).toMatchObject({
      id: 'caixa-docinhos',
      name: 'Caixa Presente',
      price: null,
      published: false,
    });
    expect(page().querySelector('[role=status]')?.textContent).toContain(
      'Alterações em Caixa Presente salvas.',
    );
    expect(page().querySelectorAll('tbody tr')[5].textContent).toContain('Sob consulta');
  });
});
