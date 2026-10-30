# Tarefas — SEO básico da landing

Especificação: `specs/seo-landing/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                | Critérios              | Testes   |
| ------------- | ----------------------------------------------------------------- | ---------------------- | -------- |
| I01           | Favicon, apple-touch-icon e `logo.webp`; fim do `logo.png`.       | CA01, CA05             | T01      |
| I02           | Logo padrão `logo.webp` na landing, login e painel.               | CA05                   | T01      |
| I03           | `index.html` só com favicon, theme-color, preload e og fixos.     | CA02                   | T02      |
| I04           | `public/robots.txt`.                                              | CA06                   | T02      |
| I05           | `Home` define título, metas e JSON-LD a partir das configurações. | CA03, CA04, CA07, CA11 | T03, T02 |
| I06           | Região padrão, exibição no contato e migration.                   | CA09, CA10             | T03, V03 |
| I07           | Landing sem skeleton nos textos e imagens de RN09.                | CA08                   | T03, T02 |

## Tarefas de implementação

- [x] I01 — Gerar as imagens a partir de `public/logo.png` (500×500) e remover o original. (CA01)
- [x] I02 — `site-config.ts`, `admin.html`, `login.html`; ajustar `home.spec.ts` e `configuracoes.spec.ts`. (CA05)
- [x] I03 — `src/index.html`: icon, apple-touch-icon, theme-color, preload das fontes, `og:type`, `og:locale`; sem textos da doceria. (CA02)
- [x] I04 — `public/robots.txt`. (CA06)
- [x] I05 — `home.ts`: `effect` sobre `config()` com `Title`, `Meta.updateTag` e `<script id="dados-estruturados">`; rota `''` sem `title`. (CA03, CA04, CA07, CA11)
- [x] I06 — `siteConfigDefaults.region`, linha "Região atendida" em `#contato`, `supabase/migrations/20261030200000_regiao_atendida.sql`. (CA09, CA10)
- [x] I07 — `home.html`: remover os skeletons de marca, título, subtítulo, foto do topo, "Sobre nós", encomendas e rodapé. (CA08)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                               | Critérios                   |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| T01 | Testes existentes da landing e configurações com `logo.webp` como padrão.                                         | CA05                        |
| T02 | Conferência do `dist/.../browser/`: arquivos, tags, título, metas, JSON-LD, `<h1>` e foto do topo.                | CA01–CA04, CA06, CA08       |
| T03 | `home.spec.ts`: padrões antes do banco; valores do banco; sem telefone inválido; `<` escapado; região; skeletons. | CA03, CA04, CA07–CA09, CA11 |

- [x] Executar T01, T03 (Vitest) e T02 (conferência do build).

## Tarefas de validação

- [x] V01 — `npm test -- --watch=false --coverage` e `npm run build`.
- [ ] V02 — Após publicar na Vercel, validar o JSON-LD no [Teste de pesquisa aprimorada](https://search.google.com/test/rich-results).
- [ ] V03 — Aplicar a migration `20261030200000_regiao_atendida.sql` no banco real.

## Pendências para o usuário

- [ ] P01 — Se quiser que a prévia do WhatsApp (que não executa JS) mostre os textos do banco em vez dos padrões, será preciso ler o banco no build e configurar um Deploy Hook da Vercel a cada alteração no painel (nova spec).
- [ ] P02 — Opcional: as fotos de demonstração em `public/images/` (`brigadeiros`, `brownie`, `chocolate-cake`, `dessert-cup`, `strawberry-cake`, `sweet-box`, ~470 KB) já estão no bucket `produtos/seed/`; confirmar se alguma categoria ainda aponta para `images/...` antes de removê-las da publicação.

Não serão feitos (decisão do usuário, sem domínio próprio): canonical, `og:url`, `og:image`, `sitemap.xml` e Search Console.

## Checklist de conclusão

- [x] I01–I07 concluídas.
- [x] CA01–CA09 e CA11 conferidos; CA10 depende de V03.

## Resultados registrados (2026-10-30)

- Imagens geradas por canvas no Edge headless a partir do `logo.png` 500×500: `logo.webp` 128×128 (4,9 KB, antes 225 KB), `favicon.png` 48×48 (4,9 KB), `apple-touch-icon.png` 180×180 (40 KB).
- T02 no `dist/doceria-da-mary/browser/index.html`: `<title>Doceria da Mary | Doces artesanais · Paes Landim, Piauí</title>`, `description`/`og:*` com a região, JSON-LD `Bakery` com telefone, Instagram e `areaServed`; `<h1>` "Adoçando seus momentos mais especiais.", `images/hero.webp` e "Região atendida: Paes Landim, Piauí" no HTML; restam 9 skeletons (4 categorias, 3 produtos, 2 contatos).
- `npm test -- --watch=false --coverage`: 19 arquivos, 166 testes passando; cobertura geral 99,1% instruções / 96,2% ramos; `features/home` 100% instruções / 98% ramos.
- Playwright (canal `msedge`, config temporária fora do repositório): 71 testes da suíte passando, mais uma conferência no navegador com o Supabase simulado (título e JSON-LD trocados pelos valores do banco; seção de contato conferida em 1440 e 390 px).
