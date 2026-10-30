import { Page, Route } from '@playwright/test';

// Supabase simulado: os testes não dependem da rede nem do banco real.
// Ids dos produtos iguais aos slugs para manter as URLs de edição legíveis.

const projectUrl = 'https://qruzjowgvamfasvrunjn.supabase.co';
export const credentials = { email: 'mary@email.com', password: 'segredo' };

interface Category {
  id: string;
  nome: string;
  slug: string;
  rotulo: string;
  imagem_url: string | null;
  visivel: boolean;
  ordem: number;
}

interface Product {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  detalhes: string | null;
  preco: number | null;
  preco_a_partir: boolean;
  observacao_preco: string | null;
  informacoes: { icon: string; text: string }[];
  categoria_id: string | null;
  publicado: boolean;
  ordem: number;
}

interface Image {
  produto_id: string;
  storage_path: string;
  alt: string | null;
  posicao: number;
}

function seed() {
  const categories: Category[] = [
    ['c-bolos', 'Bolos', 'bolos', 'Bolos', 'chocolate-cake', true],
    ['c-docinhos', 'Docinhos', 'docinhos', 'Docinhos', 'brigadeiros', true],
    ['c-sobremesas', 'Sobremesas', 'sobremesas', 'Sobremesas', 'dessert-cup', true],
    ['c-kits', 'Kits', 'kits', 'Kits e presentes', 'sweet-box', true],
    ['c-datas', 'Datas especiais', 'datas-especiais', 'Datas especiais', null, false],
  ].map(([id, nome, slug, rotulo, image, visivel], i) => ({
    id,
    nome,
    slug,
    rotulo,
    imagem_url: image ? `images/${image}.webp` : null,
    visivel,
    ordem: i + 1,
  })) as Category[];
  const product = (
    slug: string,
    nome: string,
    categoria_id: string,
    descricao: string,
    preco: number,
    preco_a_partir: boolean,
    extra: Partial<Product> = {},
  ): Product => ({
    id: slug,
    slug,
    nome,
    descricao,
    detalhes: null,
    preco,
    preco_a_partir,
    observacao_preco: null,
    informacoes: [],
    categoria_id,
    publicado: true,
    ordem: 0,
    ...extra,
  });
  const products = [
    product(
      'bolo-chocolate',
      'Bolo de Chocolate',
      'c-bolos',
      'Massa fofinha com recheio cremoso e cobertura generosa de chocolate.',
      85,
      true,
      {
        detalhes:
          'Massa fofinha de chocolate, recheio cremoso de brigadeiro e cobertura generosa de ganache, finalizado com rosetas de buttercream de chocolate. Um clássico feito do jeito que a gente gosta: bem servido e cheio de sabor.',
        observacao_preco: 'Valor varia conforme tamanho e decoração',
      },
    ),
    product(
      'brigadeiros',
      'Brigadeiros Gourmet',
      'c-docinhos',
      'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',
      36,
      true,
    ),
    product(
      'brownie',
      'Brownie Recheado',
      'c-sobremesas',
      'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',
      18,
      false,
      {
        detalhes:
          'Casquinha delicada por fora, interior úmido e bem chocolatudo — com uma surpresa cremosa escondida em cada mordida. Perfeito para um café da tarde ou para presentear alguém especial.',
      },
    ),
    product(
      'bolo-morango',
      'Bolo de Morango',
      'c-bolos',
      'Camadas leves, creme suave e morangos frescos para celebrar.',
      92,
      true,
    ),
    product(
      'copo-felicidade',
      'Copo da Felicidade',
      'c-sobremesas',
      'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',
      22,
      false,
    ),
    product(
      'caixa-docinhos',
      'Caixa de Docinhos',
      'c-kits',
      'Uma seleção delicada para presentear ou compartilhar bons momentos.',
      48,
      true,
    ),
  ].map((item, i) => ({ ...item, ordem: i + 1 }));
  const files = [
    'chocolate-cake',
    'brigadeiros',
    'brownie',
    'strawberry-cake',
    'dessert-cup',
    'sweet-box',
  ];
  const images: Image[] = products.map((item, i) => ({
    produto_id: item.id,
    storage_path: `seed/${files[i]}.webp`,
    alt: item.nome,
    posicao: 0,
  }));
  return { categories, products, images };
}

export type MockDb = ReturnType<typeof seed>;

interface Options {
  // Todos os produtos publicados (a landing de antes mostrava os 6).
  allPublished?: boolean;
  // Já entra no painel com sessão de administrador.
  session?: boolean;
}

const user = {
  id: 'u-mary',
  aud: 'authenticated',
  role: 'authenticated',
  email: credentials.email,
};

function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, role: 'authenticated', exp })}.assinatura`;
  return {
    access_token: token,
    refresh_token: 'refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: exp,
    user,
  };
}

const eq = (url: URL, key: string) => url.searchParams.get(key)?.replace(/^eq\./, '');

export async function mockSupabase(
  page: Page,
  { allPublished = false, session: logged = false } = {} as Options,
) {
  const db = seed();
  db.products.find((item) => item.id === 'caixa-docinhos')!.publicado = allPublished;
  if (logged) {
    const key = `sb-${new URL(projectUrl).hostname.split('.')[0]}-auth-token`;
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [key, JSON.stringify(session())],
    );
  }

  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route(`${projectUrl}/auth/v1/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/token')) {
      const body = route.request().postDataJSON();
      return body.email === credentials.email && body.password === credentials.password
        ? json(route, session())
        : json(route, { code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
    }
    if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204 });
    return json(route, user);
  });

  await page.route(`${projectUrl}/storage/v1/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const seedFile = /\/public\/produtos\/seed\/(.+)$/.exec(url.pathname);
    if (seedFile) return route.fulfill({ path: `public/images/${seedFile[1]}` });
    if (request.method() === 'GET') {
      return route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#f0d2c8"/></svg>',
      });
    }
    if (request.method() === 'DELETE') return json(route, []);
    return json(route, { Key: url.pathname });
  });

  await page.route(`${projectUrl}/rest/v1/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    const single = request.headers()['accept']?.includes('vnd.pgrst.object');
    const method = request.method();
    const respond = (rows: unknown[]) => json(route, single ? (rows[0] ?? null) : rows);
    const category = (id: string | null) => db.categories.find((item) => item.id === id);
    const imagesOf = (id: string) =>
      db.images.filter((image) => image.produto_id === id).sort((a, b) => a.posicao - b.posicao);

    if (table === 'administradores') {
      return respond(logged || eq(url, 'user_id') === user.id ? [{ user_id: user.id }] : []);
    }
    if (table === 'categorias' && method === 'GET') {
      return respond(db.categories.filter((item) => item.visivel));
    }
    if (table === 'categorias' && method === 'PATCH') {
      Object.assign(category(eq(url, 'id')!)!, request.postDataJSON());
      return route.fulfill({ status: 204 });
    }
    if (table === 'categorias_com_contagem') {
      return respond(
        db.categories.map((item) => ({
          ...item,
          total_produtos: db.products.filter((p) => p.categoria_id === item.id).length,
        })),
      );
    }
    if (table === 'cardapio_publico') {
      return respond(
        db.products
          .filter(
            (item) =>
              item.publicado && (!item.categoria_id || category(item.categoria_id)?.visivel),
          )
          .map((item) => ({
            ...item,
            categoria_slug: category(item.categoria_id)?.slug ?? null,
            categoria_nome: category(item.categoria_id)?.nome ?? null,
            categoria_rotulo: category(item.categoria_id)?.rotulo ?? null,
            imagem_principal: imagesOf(item.id)[0]?.storage_path ?? null,
          })),
      );
    }
    if (table === 'produto_imagens') {
      const id = eq(url, 'produto_id');
      if (method === 'DELETE') {
        db.images = db.images.filter((image) => image.produto_id !== id);
        return route.fulfill({ status: 204 });
      }
      if (method === 'POST') {
        db.images.push(...(request.postDataJSON() as Image[]));
        return route.fulfill({ status: 201 });
      }
      const ids = url.searchParams
        .get('produto_id')!
        .replace(/^in\.\(|\)$/g, '')
        .split(',');
      return respond(
        db.images
          .filter((image) => ids.includes(image.produto_id))
          .sort((a, b) => a.posicao - b.posicao),
      );
    }
    if (table === 'produtos') {
      const id = eq(url, 'id');
      if (method === 'PATCH') {
        Object.assign(
          db.products.find((item) => item.id === id)!,
          request.postDataJSON(),
        );
        return route.fulfill({ status: 204 });
      }
      if (method === 'DELETE') {
        db.products = db.products.filter((item) => item.id !== id);
        db.images = db.images.filter((image) => image.produto_id !== id);
        return route.fulfill({ status: 204 });
      }
      if (method === 'POST') {
        const row = {
          ...request.postDataJSON(),
          informacoes: [],
          detalhes: null,
          observacao_preco: null,
        };
        row.id = row.slug;
        db.products.push(row);
        return respond([{ id: row.id }]);
      }
      const select = url.searchParams.get('select') ?? '';
      if (select === 'ordem')
        return respond([{ ordem: Math.max(0, ...db.products.map((p) => p.ordem)) }]);
      if (select === 'slug') {
        const base = url.searchParams.get('slug')!.replace(/^like\.|%$/g, '');
        return respond(
          db.products.filter((p) => p.slug.startsWith(base)).map(({ slug }) => ({ slug })),
        );
      }
      return respond(
        db.products.map((item) => ({
          ...item,
          produto_imagens: imagesOf(item.id).map(({ storage_path, posicao }) => ({
            storage_path,
            posicao,
          })),
        })),
      );
    }
    return route.fulfill({ status: 404 });
  });

  return db;
}
