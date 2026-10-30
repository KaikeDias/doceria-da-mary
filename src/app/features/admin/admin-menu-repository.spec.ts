import { TestBed } from '@angular/core/testing';
import { FakeRequest, failure, fakeSupabase } from '../../core/supabase/supabase.fake';
import { publicUrl } from '../../core/supabase/supabase';
import { AdminMenuRepository, MenuItem, slugify } from './admin-menu-repository';

const url = (path: string) => publicUrl('produtos', path);

const existing: MenuItem = {
  id: 'p1',
  name: 'Brownie',
  categoryId: 'c1',
  description: 'Úmido.',
  price: { kind: 'fixed', amountInCents: 1800 },
  images: [url('p1/a.webp'), url('p1/b.webp')],
  published: true,
};

function setup(respond: (request: FakeRequest) => unknown = () => null) {
  const fake = fakeSupabase(respond);
  TestBed.configureTestingModule({ providers: [fake.provider] });
  const calls = () =>
    fake.requests.map(
      ({ method, url }) => `${method} ${url.pathname.replace(/^\/(rest|storage)\/v1\//, '')}`,
    );
  return { fake, calls, repository: TestBed.inject(AdminMenuRepository) };
}

describe('Repositório do painel', () => {
  it('slugify() gera o slug do nome', () => {
    expect(slugify('Pão de Mel')).toBe('pao-de-mel');
    expect(slugify('  Bolo  (Grande)! ')).toBe('bolo-grande');
    expect(slugify('!!!')).toBe('produto');
  });

  it('Cardápio CA01–CA02: lista produtos com categoria, preço e fotos em ordem', async () => {
    const { fake, repository } = setup(() => [
      {
        id: 'p1',
        nome: 'Brownie',
        descricao: null,
        preco: 18,
        preco_a_partir: false,
        publicado: false,
        categoria_id: null,
        produto_imagens: [
          { storage_path: 'p1/b.webp', posicao: 1 },
          { storage_path: 'p1/a.webp', posicao: 0 },
        ],
      },
    ]);
    expect(await repository.listProducts()).toEqual([
      {
        id: 'p1',
        name: 'Brownie',
        categoryId: '',
        description: '',
        price: { kind: 'fixed', amountInCents: 1800 },
        images: [url('p1/a.webp'), url('p1/b.webp')],
        published: false,
      },
    ]);
    expect(fake.requests[0].url.searchParams.get('order')).toBe('ordem.asc,created_at.asc');
  });

  it('Categorias CA01: lista categorias com rótulo e contagem', async () => {
    const { fake, repository } = setup(() => [
      { id: 'c1', rotulo: 'Kits e presentes', visivel: false, total_produtos: 3 },
      { id: 'c2', rotulo: 'Bolos', visivel: true, total_produtos: null },
    ]);
    expect(await repository.listCategories()).toEqual([
      { id: 'c1', name: 'Kits e presentes', visible: false, productCount: 3 },
      { id: 'c2', name: 'Bolos', visible: true, productCount: 0 },
    ]);
    expect(fake.requests[0].url.pathname).toMatch(/categorias_com_contagem$/);
  });

  it('Cardápio CA04 / Categorias CA03: grava publicação e visibilidade', async () => {
    const { fake, repository } = setup();
    await repository.setPublished('p1', false);
    await repository.setCategoryVisible('c1', true);
    expect(fake.requests.map((r) => [r.method, r.url.searchParams.get('id'), r.body])).toEqual([
      ['PATCH', 'eq.p1', { publicado: false }],
      ['PATCH', 'eq.c1', { visivel: true }],
    ]);
  });

  it('Cardápio CA06–CA07: exclui o produto e as fotos; falha só no Storage não impede', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fake, calls, repository } = setup(({ method }) =>
      method === 'DELETE' && fake.requests.length > 1 ? failure() : null,
    );
    await repository.deleteProduct(existing);
    expect(calls()).toEqual(['DELETE produtos', 'DELETE object/produtos']);
    expect(fake.requests[1].body).toEqual({ prefixes: ['p1/a.webp', 'p1/b.webp'] });
    expect(error).toHaveBeenCalled();
    TestBed.resetTestingModule();
    const blocked = setup(() => failure(403));
    await expect(blocked.repository.deleteProduct(existing)).rejects.toBeTruthy();
    expect(blocked.calls()).toEqual(['DELETE produtos']);
  });

  it('Formulário CA01–CA02/CA05: novo produto com slug único, fim da lista e fotos', async () => {
    const { fake, calls, repository } = setup(({ method, url }) => {
      if (url.pathname.includes('/storage/')) {
        return url.pathname.endsWith('.gif') ? failure(400) : { Key: 'ok' };
      }
      if (method === 'GET' && url.searchParams.has('slug')) {
        return [{ slug: 'pao-de-mel' }, { slug: 'pao-de-mel-2' }];
      }
      if (method === 'GET') return [{ ordem: 6 }];
      if (method === 'POST' && url.pathname.endsWith('/produtos')) return { id: 'novo' };
      return null;
    });
    const photos = ['image/jpeg', 'image/png', 'image/gif'].map(
      (type) => new File(['x'], 'foto', { type }),
    );
    const result = await repository.saveProduct({
      name: 'Pão de Mel',
      categoryId: '',
      description: '',
      price: { kind: 'starting-at', amountInCents: 2550 },
      images: photos,
    });
    expect(result).toEqual({ id: 'novo', failedUploads: 1 });
    expect(calls()).toEqual([
      'GET produtos',
      'GET produtos',
      'POST produtos',
      expect.stringMatching(/^POST object\/produtos\/novo\/[\w-]+\.jpg$/),
      expect.stringMatching(/^POST object\/produtos\/novo\/[\w-]+\.png$/),
      expect.stringMatching(/^POST object\/produtos\/novo\/[\w-]+\.gif$/),
      'DELETE produto_imagens',
      'POST produto_imagens',
    ]);
    expect(fake.requests[1].url.searchParams.get('slug')).toBe('like.pao-de-mel%');
    expect(fake.requests[2].body).toEqual({
      nome: 'Pão de Mel',
      categoria_id: null,
      descricao: null,
      preco: 25.5,
      preco_a_partir: true,
      slug: 'pao-de-mel-3',
      publicado: true,
      ordem: 7,
    });
    const rows = fake.requests.at(-1)!.body as { storage_path: string; posicao: number }[];
    expect(rows.map((row) => row.posicao)).toEqual([0, 1]);
    expect(rows[0]).toMatchObject({ produto_id: 'novo', alt: 'Pão de Mel' });
    expect(rows[0].storage_path).toMatch(/^novo\/.+\.jpg$/);
  });

  it('Formulário: primeiro produto do cardápio e sem fotos', async () => {
    const { fake, repository } = setup(({ method, url }) =>
      method === 'POST' && url.pathname.endsWith('/produtos') ? { id: 'n1' } : [],
    );
    const result = await repository.saveProduct({
      name: 'Pudim',
      categoryId: 'c1',
      description: 'Cremoso',
      price: null,
      images: [],
    });
    expect(result).toEqual({ id: 'n1', failedUploads: 0 });
    expect(fake.requests[2].body).toMatchObject({ slug: 'pudim', ordem: 1, preco: null });
    expect(fake.requests).toHaveLength(3);
  });

  it('Formulário CA03: edição grava só o que mudou e não mexe nas fotos inalteradas', async () => {
    const { fake, repository } = setup();
    await repository.saveProduct(
      { ...existing, name: 'Brownie Duplo', description: 'Úmido.', images: existing.images },
      existing,
    );
    expect(fake.requests).toHaveLength(1);
    expect(fake.requests[0].method).toBe('PATCH');
    expect(fake.requests[0].body).toEqual({ nome: 'Brownie Duplo' });
    TestBed.resetTestingModule();
    const same = setup();
    await same.repository.saveProduct({ ...existing }, existing);
    expect(same.fake.requests).toHaveLength(0);
  });

  it('Formulário CA04: reordenar e remover foto recria as linhas e apaga o arquivo', async () => {
    const { fake, calls, repository } = setup();
    await repository.saveProduct({ ...existing, images: [existing.images[1]] }, existing);
    expect(calls()).toEqual([
      'DELETE produto_imagens',
      'POST produto_imagens',
      'DELETE object/produtos',
    ]);
    expect(fake.requests[1].body).toEqual([
      { produto_id: 'p1', storage_path: 'p1/b.webp', alt: 'Brownie', posicao: 0 },
    ]);
    expect(fake.requests[2].body).toEqual({ prefixes: ['p1/a.webp'] });
  });

  it('Formulário CA06: falha ao gravar o produto vira erro', async () => {
    const { repository } = setup(() => failure());
    await expect(repository.saveProduct({ ...existing, name: 'X' }, existing)).rejects.toBeTruthy();
  });
});
