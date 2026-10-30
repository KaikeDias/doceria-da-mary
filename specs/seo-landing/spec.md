# SEO básico da landing

## Objetivo

Dar aos buscadores e às prévias de compartilhamento (WhatsApp, Instagram, Facebook) as informações essenciais da Doceria da Mary, com título, metas e dados estruturados vindos das configurações do site (sem textos fixos no `index.html`), e reduzir o peso dos recursos do topo da página.

## Contexto

O HTML pré-renderizado da `/` tinha só título e `meta description` fixos. Não havia favicon, Open Graph, dados estruturados nem `robots.txt`. O `logo.png` (500×500, 225 KB) é exibido com no máximo 64 px. As fontes locais só começavam a baixar depois do CSS.

Em `specs/landing-configuracoes-supabase` (RN01a, RNF01), o conteúdo vindo das configurações aparecia como skeleton no HTML estático, então o `<h1>`, os textos e a foto do topo não existiam para quem não executa JavaScript e o LCP dependia da resposta do banco. Esta especificação **substitui** RN01a e RNF01 daquela spec para os itens listados em RN09.

A hospedagem será a Vercel, sem domínio próprio por enquanto (ver `specs/hospedagem-vercel`). Itens que exigem URL absoluta ficam fora de escopo.

A doceria atende **Paes Landim, Piauí**.

## Regras de negócio

- RN01: **Favicon**: ícone PNG 48×48 e `apple-touch-icon` 180×180 gerados a partir do logo atual.
- RN02: **Logo**: o logo padrão passa a ser `logo.webp` (128×128), usado na landing, no login e no painel. `logo.png` deixa de ser publicado.
- RN03: **Título e metas vindos das configurações**: a landing define, a partir de `SiteConfig`:
  - `<title>`: "{nome} | {texto de apresentação} · {região}";
  - `meta description` e `og:description`: "{descrição} {região}.";
  - `og:title` igual ao `<title>` e `og:site_name` igual ao nome.
- RN04: **Dados estruturados** (JSON-LD `Bakery`), também a partir de `SiteConfig`: `name`, `description`, `areaServed` (região), `sameAs` (URL do Instagram) e `telephone` (`+55` + WhatsApp), este último só com número válido.
- RN05: **Origem dos valores**: no HTML pré-renderizado, RN03 e RN04 usam `siteConfigDefaults`; no navegador, são atualizados com as configurações lidas do banco. Campos vazios usam o padrão, como no restante da landing.
- RN06: Ficam fixos no `index.html` apenas valores que não são dados da doceria: `og:type=website`, `og:locale=pt_BR`, `theme-color`, favicon e `preload` das fontes.
- RN07: **`robots.txt`**: libera a landing e bloqueia `/admin` e `/login`.
- RN08: **Região atendida**: `siteConfigDefaults.region = 'Paes Landim, Piauí'`. A seção de contato exibe "Região atendida: {região}". Migration preenche `regiao_atendida` com esse valor na linha `id = 1` somente se estiver nula.
- RN09: **Conteúdo no HTML estático**: nome, apresentação, logo, título e subtítulo do topo, foto do topo, texto "Sobre nós", título de encomendas e rodapé deixam de ter skeleton e são renderizados com os valores padrão até as configurações chegarem. Telefone, @ do Instagram e links de WhatsApp/Instagram continuam com skeleton/sem link até carregar (evita oferecer um contato desatualizado).

## Requisitos funcionais

- RF01: Gerar `public/favicon.png`, `public/apple-touch-icon.png` e `public/logo.webp`; remover `public/logo.png`. (RN01, RN02)
- RF02: `defaultImages.logo = 'logo.webp'` e `src="logo.webp"` em `admin.html` e `login.html`. (RN02)
- RF03: `index.html` só com os itens de RN06. (RN06)
- RF04: `Home` aplica RN03 e RN04 sempre que o signal de configurações muda (serviços `Title` e `Meta`; um `<script type="application/ld+json">` reaproveitado pelo `id`). A rota `''` deixa de ter `title` fixo. (RN03–RN05)
- RF05: `public/robots.txt`. (RN07)
- RF06: Padrão e exibição da região; migration de dados. (RN08)
- RF07: Template da landing sem os skeletons de RN09. (RN09)

## Requisitos não funcionais

- RNF01: Sem dependências novas.
- RNF02: O HTML pré-renderizado da `/` contém o `<h1>`, os textos de RN09, a foto do topo, o `<title>`, as metas de RN03 e o JSON-LD de RN04 com os valores padrão.
- RNF03: O JSON-LD escapa `<` para não encerrar o `<script>` com textos vindos do banco.
- RNF04: Cobertura ≥ 90% das unidades alteradas.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA01 | O build publica `favicon.png`, `apple-touch-icon.png`, `logo.webp` e `robots.txt`, e não publica `logo.png`.                                                       |
| CA02 | O `index.html` do build tem `link[rel=icon]`, `link[rel=apple-touch-icon]`, `meta[name=theme-color]` e os `preload` das duas fontes.                               |
| CA03 | O `index.html` do build tem `<title>`, `meta description`, `og:title`, `og:description` e `og:site_name` montados com `siteConfigDefaults` e a região.             |
| CA04 | O `index.html` do build tem um JSON-LD `Bakery` válido com nome, descrição, região, telefone e Instagram de `siteConfigDefaults`.                                  |
| CA05 | Landing, login e painel exibem `logo.webp` quando não há logo enviado.                                                                                             |
| CA06 | `robots.txt` contém `Disallow: /admin` e `Disallow: /login`.                                                                                                       |
| CA07 | No navegador, com as configurações do banco carregadas, título, metas e JSON-LD passam a usar os valores do banco; sem WhatsApp válido o JSON-LD não tem telefone. |
| CA08 | O `index.html` do build tem o `<h1>` com o título padrão e a foto `images/hero.webp`, sem skeleton nesses pontos; telefone e links de contato seguem RN09.         |
| CA09 | A seção de contato mostra "Região atendida: Paes Landim, Piauí" por padrão e a região do banco quando preenchida.                                                  |
| CA10 | A migration preenche `regiao_atendida` apenas quando nula.                                                                                                         |
| CA11 | Um texto do banco com `</script>` não quebra o JSON-LD.                                                                                                            |

## Casos de erro

| Caso                                     | Tratamento esperado                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Falha ao ler as configurações            | Título, metas, JSON-LD e textos permanecem com os padrões.                                            |
| Configurações do banco diferem do padrão | Quem não executa JS (ex.: prévia do WhatsApp) vê os padrões; buscadores que executam JS veem o banco. |
| Logo enviado no painel                   | A landing usa o enviado, como hoje; o favicon continua o padrão.                                      |

## Fora de escopo

- `link rel=canonical`, `og:url`, `og:image`, `url`/`image` do JSON-LD e `sitemap.xml`: exigem domínio, que não será configurado agora.
- Ler o banco durante o build para o HTML estático refletir o banco (exigiria novo deploy a cada alteração no painel).
- Status HTTP 404 (ver `specs/hospedagem-vercel`).
