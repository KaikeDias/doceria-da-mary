import { TestBed } from '@angular/core/testing';
import { failure, fakeSupabase } from '../../core/supabase/supabase.fake';
import { publicUrl } from '../../core/supabase/supabase';
import { CatalogRepository } from './catalog-repository';

const categoryRows = [
  { slug: 'bolos', nome: 'Bolos', rotulo: 'Bolos', imagem_url: 'images/chocolate-cake.webp' },
  { slug: 'kits', nome: 'Kits', rotulo: 'Kits e presentes', imagem_url: null },
];
const productRows = [
  {
    id: 'p1',
    slug: 'bolo-chocolate',
    nome: 'Bolo de Chocolate',
    descricao: 'Massa fofinha.',
    detalhes: 'Detalhes longos.',
    preco: 85,
    preco_a_partir: true,
    observacao_preco: 'Varia conforme tamanho',
    informacoes: [{ icon: 'clock', text: 'Encomende com 2 dias' }],
    categoria_slug: 'bolos',
    categoria_rotulo: 'Bolos',
  },
  {
    id: 'p2',
    slug: 'surpresa',
    nome: 'Surpresa',
    descricao: null,
    detalhes: null,
    preco: null,
    preco_a_partir: false,
    observacao_preco: null,
    informacoes: [],
    categoria_slug: null,
    categoria_rotulo: null,
  },
];
const imageRows = [
  { produto_id: 'p1', storage_path: 'seed/chocolate-cake.webp' },
  { produto_id: 'p1', storage_path: 'p1/lado.webp' },
];

describe('Repositório do catálogo público', () => {
  function setup(respond: Parameters<typeof fakeSupabase>[0]) {
    const fake = fakeSupabase(respond);
    TestBed.configureTestingModule({ providers: [fake.provider] });
    return { fake, repository: TestBed.inject(CatalogRepository) };
  }

  const tables = (url: URL) =>
    url.pathname.endsWith('/categorias')
      ? categoryRows
      : url.pathname.endsWith('/cardapio_publico')
        ? productRows
        : imageRows;

  it('CA01–CA02: lê categorias visíveis, produtos publicados e fotos e mapeia para o modelo', async () => {
    const { fake, repository } = setup(({ url }) => tables(url));
    const catalog = await repository.load();

    const [categories, products, images] = fake.requests.map((request) => request.url);
    expect(categories.searchParams.get('visivel')).toBe('eq.true');
    expect(categories.searchParams.get('order')).toBe('ordem.asc');
    expect(products.searchParams.get('order')).toBe('ordem.asc');
    expect(images.searchParams.get('produto_id')).toBe('in.(p1,p2)');
    expect(images.searchParams.get('order')).toBe('posicao.asc');

    expect(catalog.categories).toEqual([
      { id: 'bolos', name: 'Bolos', label: 'Bolos', image: 'images/chocolate-cake.webp' },
      { id: 'kits', name: 'Kits', label: 'Kits e presentes', image: '' },
    ]);
    expect(catalog.products[0]).toEqual({
      id: 'bolo-chocolate',
      name: 'Bolo de Chocolate',
      description: 'Massa fofinha.',
      details: 'Detalhes longos.',
      priceNote: 'Varia conforme tamanho',
      information: [{ icon: 'clock', text: 'Encomende com 2 dias' }],
      categoryId: 'bolos',
      categoryLabel: 'Bolos',
      image: publicUrl('produtos', 'seed/chocolate-cake.webp'),
      additionalImages: [
        { src: publicUrl('produtos', 'p1/lado.webp'), alt: 'Bolo de Chocolate — foto 2' },
      ],
      price: { kind: 'starting-at', amountInCents: 8500 },
    });
    expect(catalog.products[1]).toMatchObject({
      description: '',
      details: undefined,
      priceNote: undefined,
      categoryId: '',
      categoryLabel: '',
      image: '',
      additionalImages: [],
      price: null,
    });
  });

  it('CA06: sem produtos não busca imagens', async () => {
    const { fake, repository } = setup(({ url }) =>
      url.pathname.endsWith('/cardapio_publico') ? [] : tables(url),
    );
    expect((await repository.load()).products).toEqual([]);
    expect(fake.requests).toHaveLength(2);
  });

  it('CA05: falha em qualquer leitura vira erro', async () => {
    const { repository } = setup(({ url }) =>
      url.pathname.endsWith('/produto_imagens') ? failure() : tables(url),
    );
    await expect(repository.load()).rejects.toBeTruthy();
  });
});
