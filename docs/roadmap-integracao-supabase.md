# Roadmap — Integração do Supabase

Atualizado em 2026-10-30.

> **Situação:** fases 0 a 5 implementadas, com specs em `specs/*-supabase*/` e `specs/integracao-supabase-base/`. Testes unitários e Playwright (Supabase simulado) passando. Falta a validação manual das gravações contra o projeto real e o restante da Fase 6.

Este documento define **em que ordem** as telas já implementadas passam a usar o Supabase, o que precisa mudar na base técnica e no banco antes disso, e o que fica **fora do escopo** nesta etapa. Ele não substitui as specs: cada fase vira uma pasta própria em `specs/<funcionalidade>/` com `spec.md` e `tasks.md`, como manda o `AGENTS.md`.

## 1. Ponto de partida

### Telas que existem no Angular hoje

| Tela                                                          | Rota                                                 | Origem dos dados hoje                                                    | Spec atual                                       |
| ------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| Landing + cardápio + filtros                                  | `/`                                                  | `features/catalog/catalog.ts` (6 produtos fixos)                         | `atualizacao-design-landing-page`                |
| Detalhes do produto (modal)                                   | `/` (diálogo)                                        | `catalog.ts` (`details`, `priceNote`, `information`, `additionalImages`) | `modais-detalhes-produtos`                       |
| Login                                                         | `/login`                                             | Falso: aceita só `admin`/`admin`                                         | `tela-login`                                     |
| Painel › Cardápio (lista, filtros, publicar/ocultar, excluir) | `/admin/cardapio`                                    | `MenuStore` em memória                                                   | `painel-admin-cardapio`, `estados-tela-cardapio` |
| Painel › Novo/Editar produto (com até 5 fotos)                | `/admin/cardapio/novo`, `/admin/cardapio/:id/editar` | `MenuStore` em memória; fotos viram `blob:` locais                       | `formulario-produto-cardapio`                    |
| Painel › Categorias (lista, mostrar/ocultar)                  | `/admin/categorias`                                  | Lista fixa em memória                                                    | `painel-admin-categorias`                        |

**Configurações do site não tem tela no Angular** (o item do menu está indisponível), embora exista no design.

### Supabase

- Projeto criado e ligado ao repositório pela CLI (`supabase/config.toml`, `project-ref` `qruzjowgvamfasvrunjn`).
- Migrations versionadas em `supabase/migrations/`:
  - `20261030041002_schema_inicial.sql`: tabelas `categorias`, `produtos`, `produto_imagens`, `configuracoes_site` e `administradores`, views, RLS e buckets `produtos` e `site`. **Aplicada** (marcada no remoto com `migration repair`).
  - `20261030042000_alinhar_catalogo_com_front.sql`: alinha o banco ao modelo do front (seção 2). **Aplicada** (confirmado com `supabase migration list --linked`).
- Usuário admin criado e cadastrado em `administradores`.
- `@supabase/supabase-js` 2.118 instalado; `src/environments/environment*.ts` criados.

### Pendências encontradas na revisão

1. ~~O `ARCHITECTURE.md` ainda diz que backend e provedor de identidade "não foram escolhidos"~~ **Resolvida:** Supabase registrado como ADR-008 (ADR-004 marcada como substituída), mais ADR-009 (migrations) e ADR-010 (repositórios).
2. `supabase/`, `src/environments/` e as mudanças de `package.json`, `package-lock.json` e `angular.json` ainda não foram commitados.

## 2. Banco alinhado ao front

O banco foi modelado a partir do design, e o front evoluiu com detalhes que o banco não tinha. Como o front é a referência, a migration `20261030042000_alinhar_catalogo_com_front.sql` levou o banco até ele.

| Ponto                       | Front                                                                         | Banco depois da migration                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preço                       | `{ kind: 'fixed' \| 'starting-at', amountInCents }`; ausente = "Sob consulta" | `preco numeric(10,2)` + `preco_a_partir`, sem mudança. O mapeamento converte: `amountInCents = round(preco * 100)`; `preco` nulo = "Sob consulta".                |
| Texto longo do modal        | `details`                                                                     | `produtos.detalhes text`                                                                                                                                          |
| Observação de preço         | `priceNote`                                                                   | `produtos.observacao_preco text`                                                                                                                                  |
| "Bom saber"                 | `information[]` (`clock`/`snowflake`/`info` + texto)                          | `produtos.informacoes jsonb` (padrão `[]`), validada por `informacoes_validas()`: lista de `{icon, text}` com ícone permitido e texto não vazio                   |
| Limites do formulário       | nome ≤ 80, descrição ≤ 300, preço ≤ 99.999,99                                 | `check` nas três colunas                                                                                                                                          |
| Nome da categoria           | `name` no chip ("Kits") e `label` nos cards e no painel ("Kits e presentes")  | `categorias.nome` (curto) + nova coluna `categorias.rotulo`                                                                                                       |
| Id da categoria             | `bolos`, `docinhos`, `sobremesas`, `kits`                                     | `categorias.slug` com os mesmos valores (`kits-e-presentes` virou `kits`)                                                                                         |
| Imagem do card de categoria | asset local `images/<chave>.webp`                                             | `categorias.imagem_url` com o caminho relativo do asset (`images/chocolate-cake.webp`)                                                                            |
| Id do produto               | `bolo-chocolate`, `brigadeiros`, `brownie`…                                   | `produtos.slug` com os mesmos valores. O `uuid` continua como chave e é o que as rotas do painel usam.                                                            |
| Textos dos produtos         | `description`, `details`, `priceNote` de `catalog.ts`                         | Os 6 produtos atualizados com os mesmos textos                                                                                                                    |
| Fotos                       | `public/images/*.webp`                                                        | Foto principal de cada produto em `produto_imagens` → `seed/<arquivo>.webp` no bucket `produtos`. **Os arquivos precisam ser enviados manualmente** (ver Fase 0). |
| "Datas especiais"           | aparece no painel, oculta                                                     | Categoria criada com `visivel = false`                                                                                                                            |
| Produto de categoria oculta | —                                                                             | Some do site: `cardapio_publico` só mostra produto publicado com categoria visível ou sem categoria (D2)                                                          |

Views recriadas com as colunas novas: `cardapio_publico` (inclui `detalhes`, `observacao_preco`, `informacoes` e `categoria_rotulo`) e `categorias_com_contagem` (inclui `rotulo`).

## 3. Decisão técnica principal: renderização

Hoje o build é **estático** (`outputMode: "static"`) e **todas as rotas são pré-renderizadas**, inclusive as do painel. A rota de edição pré-renderiza um HTML para cada id de `catalog.ts`. Com dados vindos do banco, isso não funciona mais:

- **Painel e login** passam a `RenderMode.Client`. Os ids vêm do banco, não existem no build, e a sessão só existe no navegador.
- **Landing**: a casca continua pré-renderizada (cabeçalho, textos fixos, seções), e o cardápio é buscado **no navegador** ao abrir a página, com skeleton enquanto carrega. Assim, o que a Mary muda no painel aparece no site sem precisar de um novo build.
- O client do Supabase só é criado no navegador (`isPlatformBrowser`). Nenhuma chamada ao banco roda durante o build.

O custo é que o HTML pré-renderizado da `/` deixa de trazer os produtos, o que afeta o SEO. Se isso pesar, há uma alternativa futura: pré-renderizar com os dados do momento do build e atualizar no navegador. Ela fica registrada como fora do escopo (seção 6).

## 4. Ordem das fases

```
Fase 0  Base técnica e ajustes no banco
   │
Fase 1  Catálogo público (landing + modal) lendo do banco
   │
Fase 2  Login real, proteção do /admin e Sair
   │
Fase 3  Painel › Cardápio: lista, publicar/ocultar, excluir
   │
Fase 4  Painel › Categorias: lista e mostrar/ocultar
   │
Fase 5  Painel › Novo/Editar produto, com upload de fotos
   │
Fase 6  Fechamento: documentação, testes de ponta a ponta, publicação
```

**Por que essa ordem:**

1. **Fase 0 primeiro:** todas as outras usam o client, o mapeamento banco ↔ modelo e o banco já ajustado.
2. **Leitura pública antes do login:** não depende de sessão e mostra rápido se a chave, a URL, o RLS anônimo e o Storage estão certos. Também troca a fonte de verdade da landing, que é o que o visitante vê.
3. **Login antes de qualquer tela do painel:** pelo RLS, só o admin logado lê itens ocultos e grava. Sem o login, as telas do painel não carregam nada.
4. **Cardápio antes de Categorias:** é a tela principal da Mary e já tem os estados de salvamento e exclusão desenhados.
5. **Formulário por último:** é o mais complexo (validação, várias fotos, upload, edição) e depende da lista e das categorias já vindo do banco.

Com duas pessoas, as fases 1 e 2 podem andar em paralelo depois da Fase 0.

---

### Fase 0 — Base técnica e ajustes no banco

Spec proposta: `specs/integracao-supabase-base/`

**Banco** (`supabase/migrations/`):

- [x] `20261030041002_schema_inicial.sql`: schema inicial trazido para o repositório e marcado como aplicado no remoto.
- [x] `20261030042000_alinhar_catalogo_com_front.sql`: colunas novas, limites, views, regra D2 e dados iguais a `catalog.ts` (seção 2).
- [x] Aplicar a segunda migration: `npx supabase db push --linked`.
- [x] Criar a pasta `seed` no bucket `produtos` e enviar `chocolate-cake`, `brigadeiros`, `brownie`, `strawberry-cake`, `dessert-cup` e `sweet-box` (`.webp`, de `public/images`).
- [x] Gerar os tipos: `npx supabase gen types typescript --linked > src/app/core/supabase/database.types.ts`.

**Front:**

- `core/supabase/`: provider do client criado uma vez, só no navegador, usando os tipos gerados.
- Repositórios com interface própria (`CatalogRepository`, `AdminMenuRepository`, `CategoryRepository`), para que as telas e os testes não dependam do Supabase diretamente. A implementação Supabase faz o mapeamento banco ↔ `Product`/`Category`/`MenuItem`:
  - `slug` → `id`; `nome`/`rotulo` → `name`/`label`;
  - `preco` + `preco_a_partir` → `price` em centavos (`null` = "Sob consulta");
  - `detalhes`, `observacao_preco`, `informacoes` → `details`, `priceNote`, `information`;
  - `storage_path` → URL pública do bucket `produtos`; `imagem_url` da categoria começando com `images/` → asset local, senão URL pública do bucket `site`.
- `app.routes.server.ts`: `/login` e `/admin/**` em `RenderMode.Client`; remover o `getPrerenderParams` baseado em `catalog.ts`.
- Mensagem padrão para falha de rede ou do banco, que as specs das fases seguintes reutilizam.

**Documentação:** ADR-0002 "Supabase como backend" e atualização das seções 2, 3, 5, 8 e 12 do `ARCHITECTURE.md`.

**Pronto quando:** em `ng serve`, uma leitura de `cardapio_publico` retorna os 5 produtos publicados (a Caixa de Docinhos está oculta) com foto, e o build continua gerando a `/` estática sem chamar o banco.

### Fase 1 — Catálogo público lendo do banco

Spec proposta: `specs/catalogo-publico-supabase/` (atualiza o comportamento de `atualizacao-design-landing-page` e `modais-detalhes-produtos`)

- Categorias visíveis e produtos publicados vêm de `CatalogRepository`; o filtro continua no cliente.
- Modal com `detalhes`, `observacao_preco`, "Bom saber" e todas as fotos (`produto_imagens`, por `posicao`).
- Estados novos, que não existiam com dados locais: **carregando** (skeleton nos cards), **erro** (mensagem e "Tentar de novo") e **cardápio vazio**.
- Links de WhatsApp e Instagram continuam vindo de `public-config.ts` (Configurações está fora do escopo).
- `catalog.ts` deixa de ser a fonte da landing e fica só como dado de teste, ou é removido.

**Pronto quando:** ocultar um produto direto no painel do Supabase faz ele sumir da landing ao recarregar.

### Fase 2 — Login real e proteção do painel

Spec proposta: `specs/autenticacao-admin-supabase/` (substitui a RN08 e parte do "fora de escopo" de `tela-login`)

- `signInWithPassword`, removendo a credencial fixa `admin`/`admin`.
- Depois de entrar, confirmar que o usuário está em `administradores`. Se não estiver, encerrar a sessão e mostrar a mesma mensagem de credenciais inválidas.
- Mensagens: credenciais inválidas, sem conexão e erro inesperado (sem detalhes técnicos).
- Guard em `/admin/**`: sem sessão de admin, redireciona para `/login`. Já logado, `/login` leva ao painel.
- "Sair" do painel encerra a sessão de verdade.
- A sessão persiste ao recarregar a página (armazenamento do próprio Supabase no navegador).

**Pronto quando:** abrir `/admin/cardapio` numa aba anônima leva ao login, e depois de entrar a lista abre.

### Fase 3 — Painel › Cardápio

Spec proposta: `specs/cardapio-admin-supabase/` (troca o `MenuStore` em memória)

- A lista carrega todos os produtos, publicados e ocultos, com categoria e foto principal.
- Busca e filtros continuam no cliente (o volume é pequeno).
- Publicar/ocultar grava em `produtos.publicado`, com o estado "Salvando…" que já existe.
- **Novo estado de erro**: se a gravação falhar, a chave volta ao valor anterior e aparece um aviso. A spec `estados-tela-cardapio` deixou isso fora porque não havia backend.
- Excluir apaga o produto (as fotos no banco saem em cascata) e remove os arquivos do bucket `produtos`. Se a remoção dos arquivos falhar, o produto continua excluído e o erro só é registrado.
- Carregando, erro de carregamento e cardápio vazio vindos do banco.

**Pronto quando:** ocultar ou excluir no painel se reflete na landing.

### Fase 4 — Painel › Categorias

Spec proposta: `specs/categorias-admin-supabase/`

- A lista vem de `categorias_com_contagem` (a contagem passa a vir do banco).
- Mostrar/ocultar grava em `categorias.visivel`, com "Salvando…", sucesso e erro iguais aos do cardápio.
- Adicionar, editar e excluir **continuam indisponíveis**, como na spec atual (ver seção 6).

**Pronto quando:** ocultar uma categoria tira o chip dela da landing.

### Fase 5 — Painel › Novo/Editar produto

Spec proposta: `specs/formulario-produto-supabase/`

- Categorias do `select` vêm do banco.
- **Novo produto**: gerar o slug a partir do nome (com sufixo `-2`, `-3` se já existir), inserir com `publicado = true` no fim da lista (`ordem` = maior + 1), enviar as fotos para `produtos/<id>/<uuid>.<ext>` e criar as linhas de `produto_imagens` (posição 0 = principal).
- **Edição**: carregar pelo `uuid` da rota (id inexistente volta para a lista, como na RN01 atual), gravar só o que mudou, enviar fotos novas e apagar do Storage as removidas.
- Gravação em etapas: produto → fotos → linhas de imagem. Se alguma foto falhar, o produto fica salvo e o aviso diz quantas fotos não foram enviadas.
- "Salvando…" com o formulário bloqueado, mais estados de erro de gravação.
- Validações iguais às de hoje; os limites agora também existem no banco.

**Pronto quando:** um produto criado com 3 fotos aparece na landing com a foto principal certa e a galeria completa no modal.

### Fase 6 — Fechamento

Spec proposta: nenhuma; são tarefas de validação dentro das specs anteriores, mais a atualização de `docs/PROJECT_STATUS.md`.

- Rodar a suíte Playwright com o Supabase **simulado** (`page.route('**/rest/v1/**')` e `**/storage/v1/**` com fixtures), para os testes não dependerem do banco real nem da internet.
- Teste manual de ponta a ponta contra o projeto real: visitante anônimo não vê produto oculto nem categoria oculta, e nenhuma escrita sem login é aceita.
- Atualizar `PROJECT_STATUS.md` e `ARCHITECTURE.md`.
- Escolher a hospedagem (pendência antiga). O build estático continua funcionando, mas a hospedagem precisa redirecionar `/admin/**` e `/login` para o HTML do app.

## 5. Testes em todas as fases

O `AGENTS.md` exige pelo menos um teste por critério de aceitação e 90% de cobertura por unidade. Por isso:

- **Testes unitários** usam implementações falsas dos repositórios, nunca o Supabase real. O mapeamento banco ↔ modelo tem testes próprios, com respostas de exemplo do banco.
- **E2E (Playwright)** interceptam as chamadas HTTP ao Supabase com fixtures. Os 6 produtos de hoje viram a fixture padrão, então os testes existentes de detalhes, hover e animações continuam válidos.
- Cada spec lista os cenários de erro de rede e de permissão (RLS) que precisam de teste.

## 6. Fora do escopo nesta etapa

| Item                                                                              | Motivo                                                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Configurações do site** (tela + `configuracoes_site`)                           | Não há tela no Angular. WhatsApp e Instagram continuam em `public-config.ts`. Quando entrar, ajustar a `check` de WhatsApp do banco (hoje exige 10–11 dígitos sem DDI; o front usa `55…`). |
| **Adicionar, editar e excluir categorias**                                        | A tela atual mostra essas ações como indisponíveis. Precisam de spec própria de interface antes da integração.                                                                             |
| **Editar no painel** `detalhes`, `observacao_preco` e "Bom saber"                 | O formulário de referência não tem esses campos (fora de escopo em `formulario-produto-cardapio`). As colunas já existem no banco; por enquanto são editadas direto no painel do Supabase. |
| **Editar no painel** o rótulo e a imagem da categoria                             | A tela de Categorias não tem esses campos. As colunas `rotulo` e `imagem_url` já existem e são editadas no painel do Supabase.                                                             |
| Reordenar produtos, categorias ou fotos arrastando; recortar ou comprimir imagens | Já fora de escopo nas specs atuais.                                                                                                                                                        |
| Aviso de alterações não salvas ao sair do formulário                              | Já fora de escopo em `formulario-produto-cardapio`.                                                                                                                                        |
| Recuperar ou trocar senha, cadastro, mais de um admin, login social, 2FA          | Sem design. Senha e novos admins são gerenciados no painel do Supabase.                                                                                                                    |
| Pré-renderizar a landing com os dados do banco (SEO com produtos no HTML)         | Exige rebuild ou revalidação a cada alteração. Fica para depois da escolha de hospedagem.                                                                                                  |
| Atualização em tempo real (Realtime), paginação, busca no servidor                | Volume pequeno e uma única usuária no painel.                                                                                                                                              |
| Carrinho, pedidos, pagamento, entrega                                             | Fora do modelo do produto (ADR-001: pedido pelo WhatsApp).                                                                                                                                 |

## 7. Decisões

| #   | Decisão                                                                                                                                                                                  | Situação                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| D1  | **Renderização da landing.** Proposta: casca pré-renderizada e cardápio buscado no navegador (seção 3). Alternativa: só dados do momento do build, o que exige rebuild a cada alteração. | **Decidida:** proposta adotada (casca pré-renderizada, cardápio buscado no navegador) |
| D2  | **Produto publicado em categoria oculta** some do site enquanto a categoria estiver oculta.                                                                                              | Decidida e aplicada na view `cardapio_publico` (migration `20261030042000`)           |
| D3  | **Campos extras do modal** (`detalhes`, `observacao_preco`, "Bom saber") viram colunas e são preenchidos pelo painel do Supabase.                                                        | Decidida e aplicada (migration `20261030042000`)                                      |
| D4  | **Nome da categoria** segue o front: `nome` curto no chip e `rotulo` nos cards e no painel.                                                                                              | Decidida e aplicada (migration `20261030042000`)                                      |

## 8. Próximo passo

1. Validar manualmente contra o projeto real: login da Mary, publicar/ocultar, excluir, criar produto com fotos e conferir a landing numa aba anônima (V01 das specs das fases 2 a 5).
2. Commitar `supabase/`, `src/environments/`, os ajustes de `package.json`, `package-lock.json` e `angular.json` e as specs novas (pendência 2).
3. Fase 6: atualizar `docs/PROJECT_STATUS.md` e escolher a hospedagem (servir `index.csr.html` em `/login` e `/admin/**`).
