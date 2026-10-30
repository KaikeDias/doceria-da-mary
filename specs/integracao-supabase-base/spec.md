# Integração Supabase — base técnica

## Objetivo

Preparar a base que todas as telas usam para falar com o Supabase: client único criado só no navegador, tipos gerados do banco, repositórios com interface própria, mapeamento banco ↔ modelo do front, renderização no cliente para login e painel e mensagens padrão de falha.

## Contexto

O Supabase foi escolhido como backend (ADR-008 em `ARCHITECTURE.md`). O banco está nas migrations `20261030041002_schema_inicial.sql` e `20261030042000_alinhar_catalogo_com_front.sql`, ambas aplicadas no projeto remoto, e as fotos do seed estão em `produtos/seed/`. Hoje nenhuma tela usa o banco: a landing lê `catalog.ts` e o painel usa o `MenuStore` em memória. O build é estático e pré-renderiza todas as rotas, inclusive `admin/cardapio/:id/editar` a partir dos ids de `catalog.ts`.

Esta é a Fase 0 do `docs/roadmap-integracao-supabase.md`. As fases seguintes (`catalogo-publico-supabase`, `autenticacao-admin-supabase`, `cardapio-admin-supabase`, `categorias-admin-supabase`, `formulario-produto-supabase`) dependem dela.

Decisão D1 do roadmap: adotada a proposta — a casca da landing continua pré-renderizada e os dados são buscados no navegador.

## Regras de negócio

- RN01: O client do Supabase é criado uma única vez por aplicação, com a URL e a chave publishable de `src/environments`, e **somente no navegador**. Pedir o client fora do navegador é erro de programação e lança exceção.
- RN02: As telas e os testes acessam dados apenas por repositórios com interface própria (ADR-010): `CatalogRepository` (leitura pública) e `AdminMenuRepository` (painel: produtos e categorias). A implementação padrão de cada um usa o Supabase.
- RN03: Mapeamento de preço: `preco` nulo → sem preço ("Sob consulta"); senão `{ kind: preco_a_partir ? 'starting-at' : 'fixed', amountInCents: round(preco × 100) }`. No sentido inverso, centavos viram `preco = amountInCents / 100` e `preco_a_partir = kind === 'starting-at'`.
- RN04: Mapeamento de imagem: `storage_path` de produto vira a URL pública do bucket `produtos`. `imagem_url` de categoria começando com `images/` é asset local e fica como está; outro valor vira URL pública do bucket `site`; nulo vira texto vazio (sem imagem).
- RN05: Falhas de rede ou do banco viram mensagens fixas, sem detalhes técnicos: carregamento — "Não foi possível carregar os dados. Verifique sua conexão e tente de novo."; gravação — "Não foi possível salvar. Verifique sua conexão e tente de novo.".
- RN06: `/login` e `/admin/**` renderizam no cliente. A `/` continua pré-renderizada. Nenhuma chamada ao banco roda no build.

## Requisitos funcionais

- RF01: Gerar `src/app/core/supabase/database.types.ts` com `npx supabase gen types typescript --linked` e usá-lo no client. (RN01)
- RF02: Criar `src/app/core/supabase/supabase.ts` com o serviço `Supabase` (getter `client` preguiçoso e restrito ao navegador), a função de URL pública e as mensagens da RN05. (RN01, RN04, RN05)
- RF03: Criar as funções de mapeamento de preço e de imagem, puras e testadas. (RN03, RN04)
- RF04: Declarar `CatalogRepository` e `AdminMenuRepository` como classes abstratas injetáveis cuja implementação padrão é a do Supabase; as fases seguintes definem os métodos. (RN02)
- RF05: Em `app.routes.server.ts`, trocar `/login` e `/admin/**` para `RenderMode.Client` e remover o `getPrerenderParams` baseado em `catalog.ts`. (RN06)

## Requisitos não funcionais

- RNF01: Sem novas dependências além de `@supabase/supabase-js`, já instalado.
- RNF02: O front usa só a chave publishable. Nenhuma chave secret ou senha entra no repositório.
- RNF03: O arquivo de tipos é gerado e não é formatado pelo Prettier.
- RNF04: Cada critério de aceitação tem teste automatizado; cada unidade nova tem pelo menos 90% de cobertura unitária. Testes unitários não acessam a rede: usam repositórios falsos ou um `fetch` falso no client.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | No navegador, `Supabase.client` devolve sempre a mesma instância; fora do navegador lança erro.                                              |
| CA02 | Preço: `85.00` + `a partir` → `{ starting-at, 8500 }`; `18` → `{ fixed, 1800 }`; nulo → sem preço; o inverso devolve os valores originais.   |
| CA03 | Imagem: `seed/brownie.webp` → URL pública de `produtos`; `images/sweet-box.webp` → igual; `logo.webp` → URL pública de `site`; nulo → vazio. |
| CA04 | `npm run build` gera a `/` estática, renderiza `/login` e `/admin/**` no cliente e não faz requisição ao Supabase.                           |
| CA05 | Cobertura ≥ 90% por unidade; testes, build e formatação passam.                                                                              |

## Casos de erro

| Caso                              | Tratamento esperado                                           |
| --------------------------------- | ------------------------------------------------------------- |
| Client pedido durante o build/SSR | Exceção (RN01); nenhuma tela pede o client fora do navegador. |
| Resposta de erro do Supabase      | O repositório lança erro; a tela mostra a mensagem da RN05.   |
| Categoria sem imagem              | Imagem vazia (RN04); a tela decide como exibir.               |

## Fora de escopo

- Telas consumindo os repositórios (fases seguintes).
- Configurações do site (`configuracoes_site`), Realtime, paginação.
- Pré-renderizar a landing com dados do banco.
- Escolha de hospedagem (Fase 6).
