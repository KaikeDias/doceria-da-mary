# Tarefas — Criação e edição de produtos do cardápio

Especificação: `specs/formulario-produto-cardapio/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                          | Critérios        | Testes        |
| ------------- | --------------------------------------------------------------------------- | ---------------- | ------------- |
| I01           | `MenuStore` compartilhado e `Cardapio` adaptado.                            | CA07–CA09        | T07–T09       |
| I02           | Rotas `novo` e `{id}/editar`, títulos, redirecionamento e pré-renderização. | CA01, CA02, CA12 | T01, T02, T12 |
| I03           | Informações básicas com validação, contador e "A partir de".                | CA03, CA04       | T03, T04      |
| I04           | Imagens: soltar, escolher, principal, remover e avisos.                     | CA06             | T06           |
| I05           | Prévia no site (desktop e recolhível no mobile).                            | CA05, CA10       | T05, T10      |
| I06           | Trilha, cabeçalho, rodapé fixo, salvar e cancelar.                          | CA01, CA07, CA08 | T01, T07, T08 |
| I07           | Botões da lista ativos e "Sob consulta".                                    | CA01, CA09       | T01, T09      |
| I08           | Responsividade e acessibilidade.                                            | CA10, CA11       | T10, T11      |
| I09           | Regressão, cobertura, formatação e build.                                   | CA12             | T12           |

## Tarefas de implementação

- [x] I01 — Criar `src/app/features/admin/menu-store.ts` (`providedIn: 'root'`) com `items` (id, nome, categoria, descrição, preço opcional, fotos, publicado) a partir do catálogo e `flash` (mensagem pendente); `Cardapio` passa a ler/escrever no store e exibe o `flash` ao abrir. (CA07–CA09)
- [x] I02 — Adicionar as rotas filhas `cardapio/novo` e `cardapio/:id/editar` em `app.routes.ts` e a pré-renderização em `app.routes.server.ts` (`getPrerenderParams` com os ids do catálogo); redirecionar id inexistente. (CA01, CA02, CA12)
- [x] I03 — Criar `produto-form.ts`/`.html` com nome, categoria, descrição (contador, `maxlength`), preço (`parsePrice`) e "A partir de"; validação ao salvar com foco no primeiro erro. (CA03, CA04)
- [x] I04 — Implementar a área de soltar e o botão "Escolher fotos" (`input type=file multiple accept=image/*`), miniaturas, "Principal", remover, definir como principal e avisos em região viva. (CA06)
- [x] I05 — Implementar a prévia com os textos padrão e atualização ao vivo; no mobile, dentro de `<details>` fechado. (CA05, CA10)
- [x] I06 — Implementar trilha, voltar (mobile), cabeçalho, rodapé fixo e salvar/cancelar com navegação e mensagem pendente. (CA01, CA07, CA08)
- [x] I07 — Trocar "Adicionar produto", "Adicionar primeiro produto" e "Editar" por links; mostrar "Sob consulta" e usar o caminho completo das fotos na lista. (CA01, CA09)
- [x] I08 — Revisar responsividade, alvos de 44 px, rótulos, `aria-invalid`/`aria-describedby` e foco visível. (CA10, CA11)
- [x] I09 — Atualizar/criar testes unitários e e2e; conferir cobertura, formatação e build. (CA12)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                                      | Critérios |
| --- | ------------------------------------------------------------------------------------------------------------------------ | --------- |
| T01 | Navegação para novo e edição a partir da lista; títulos e trilha.                                                        | CA01      |
| T02 | Edição preenchida; id inexistente redireciona.                                                                           | CA02      |
| T03 | Erros de nome, categoria e preço; nada salvo; foco no primeiro erro.                                                     | CA03      |
| T04 | Contador, `maxlength` e "A partir de" desabilitado sem preço; `parsePrice` com limite de 5 dígitos inteiros (99.999,99). | CA04      |
| T05 | Prévia padrão e atualização ao vivo.                                                                                     | CA05      |
| T06 | Escolher/soltar fotos, principal, remover, avisos de tipo e de limite.                                                   | CA06      |
| T07 | Salvar novo: lista, indicadores e aviso.                                                                                 | CA07      |
| T08 | Salvar edição: posição, status e aviso; cancelar.                                                                        | CA08      |
| T09 | "Sob consulta" na lista; landing page inalterada.                                                                        | CA09      |
| T10 | Mobile 390 px e 320–1440 px sem rolagem horizontal; alvos de 44 px.                                                      | CA10      |
| T11 | Semântica e acessibilidade do formulário.                                                                                | CA11      |
| T12 | Cobertura, regressões, build com as rotas pré-renderizadas e formatação.                                                 | CA12      |

- [x] Criar e executar T01–T09 e T11 em testes unitários. (CA01–CA09, CA11)
- [x] Criar e executar T01, T06, T07, T10 no Playwright. (CA01, CA06, CA07, CA10)
- [x] Executar T12. (CA12)

## Tarefas de validação

- [x] V01 — Comparar capturas desktop (novo e edição) e mobile com as referências; registrar diferenças. (CA01, CA02, CA10)
- [x] V02 — Executar testes unitários com cobertura, e2e, build e `format:check`; registrar resultados. (CA12)
- [x] V03 — Conferir que `catalog.ts` e a landing page não foram alterados. (CA09)

## Checklist de conclusão

- [x] I01–I09 implementadas dentro do escopo.
- [x] CA01–CA12 cobertos por testes, com resultados registrados.
- [x] Cobertura ≥ 90% por unidade implementada.
- [x] Referências comparadas com capturas.
- [x] Sem novas dependências e sem alteração da landing page.
- [x] Ausência de persistência sinalizada.

## Resultados registrados (2026-10-29)

- `npm test -- --watch=false --coverage` (Node 26.5): 77 testes passando; `produto-form.ts` 100% linhas / 96,8% ramos; `cardapio.ts` 100% linhas; `produto-form.html` 100% linhas.
- `npx playwright test`: 51 testes passando (9 em `admin-produto-form.e2e.ts`).
- `npm run build`: 12 rotas pré-renderizadas, incluindo `admin/cardapio/novo` e as 6 edições do catálogo. `npm run format:check` e `git diff --check`: sem pendências.
- V01: capturas desktop (novo, edição) e mobile conferem com as referências. Diferenças: no mobile a barra do painel (menu) aparece acima da trilha, e a prévia fica no bloco recolhível "Prévia no site" (as referências não mostram a prévia mobile).
- V03: `catalog.ts` e a landing page não foram alterados.
- Limitações: estado só em memória (recarregar restaura o catálogo); fotos enviadas existem só como URL temporária do navegador; produtos novos não têm página pré-renderizada de edição (funciona navegando pelo painel).
