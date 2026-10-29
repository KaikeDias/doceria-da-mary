# Tarefas — Painel administrativo e gerenciamento do cardápio

Especificação: `specs/painel-admin-cardapio/spec.md`.

Todas as tarefas estão pendentes. Esta etapa criou somente a especificação e as tarefas técnicas.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                           | Critérios        | Testes        |
| ------------- | ---------------------------------------------------------------------------- | ---------------- | ------------- |
| I01           | Rotas `/admin` (layout) e `/admin/cardapio`, redirecionamento e título.      | CA01, CA13       | T01, T11      |
| I02           | Menu lateral desktop, itens, ações "Visualizar site" e "Sair".               | CA02, CA08, CA09 | T02, T08, T09 |
| I03           | Barra superior e gaveta mobile com foco, `Esc` e fundo.                      | CA03, CA10       | T03, T10      |
| I04           | Estado em memória derivado do catálogo, indicadores e formatação de preço.   | CA02, CA04, CA06 | T02, T04, T06 |
| I05           | Busca, filtro de categoria e de status combinados, estado vazio.             | CA05, CA07       | T05, T07      |
| I06           | Tabela desktop, cards mobile e fallback de imagem.                           | CA02, CA03, CA04 | T02, T03, T04 |
| I07           | Chave de publicação acessível e atualização imediata.                        | CA06, CA12       | T06, T12      |
| I08           | Controles indisponíveis (Adicionar, Editar, "…", Categorias, Configurações). | CA08             | T08           |
| I09           | Responsividade, acessibilidade e hover/foco/movimento reduzido.              | CA11, CA12       | T11, T12      |
| I10           | Regressão, cobertura e build estático.                                       | CA13             | T13           |

## Tarefas de implementação

- [ ] I01 — Criar `src/app/features/admin/` com layout standalone/OnPush e a página do cardápio; trocar o componente em branco por rota-pai `admin` com filha `cardapio` (carregamento sob demanda) e redirecionamento de `/admin`; incluir as rotas em `app.routes.server.ts` para pré-renderização; título "Cardápio | Painel Doceria da Mary". Preservar `/`, `/login` e o redirecionamento pós-login. (CA01)
- [ ] I02 — Implementar menu lateral desktop (logo, "PAINEL", Cardápio ativo com `aria-current`, Categorias/Configurações indisponíveis, divisor, "Visualizar site" em nova aba e "Sair" para `/login`). (CA02, CA08, CA09)
- [ ] I03 — Implementar barra superior mobile e gaveta (abrir/fechar por botão, `Esc`, fundo e navegação; foco inicial no ×, retorno de foco, `aria-expanded`; animação com movimento reduzido). (CA03, CA10)
- [ ] I04 — Implementar estado em signals inicializado do catálogo existente (sem alterá-lo), com "Caixa de Docinhos" oculto; indicadores; formatação de preço em reais com "A partir de"/"Preço fixo". (CA02, CA04, CA06)
- [ ] I05 — Implementar busca normalizada (caixa, acentos, espaços), filtros de categoria e status combinados, contagem anunciada em região viva e estado vazio com "Limpar filtros". (CA05, CA07, CA12)
- [ ] I06 — Implementar tabela desktop e cards mobile com imagens de `public/images/`, rótulos de categoria, preço e fallback de imagem sem repetição de tentativa. (CA02, CA03, CA04)
- [ ] I07 — Implementar a chave de publicação (`role="switch"`, `aria-checked`, nome com o produto, verde de sucesso) e a atualização imediata de lista e indicadores. (CA06, CA12)
- [ ] I08 — Renderizar "Adicionar produto", "Editar", "…", "Categorias" e "Configurações" como indisponíveis (`aria-disabled`, sem ação, explicação acessível). (CA08)
- [ ] I09 — Ajustar responsividade (limite de 1024 px, sem overflow de 320 a 1440 px), alvos de 44 px no mobile, foco visível, hover sem mudança de dimensões e movimento reduzido. (CA11, CA12)
- [ ] I10 — Integrar os testes à infraestrutura Vitest/Playwright existente; conferir cobertura, regressões, formatação e saída estática, sem novas dependências. (CA13)

## Tarefas de testes

Destinos propostos (ainda inexistentes): `src/app/features/admin/*.spec.ts` e `tests/browser/admin-cardapio.e2e.ts`.

| ID  | Cenários automatizados obrigatórios                                                                                                                          | Critérios |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| T01 | Redirecionamento `/admin` → `/admin/cardapio`, título, login `admin`/`admin` levando ao painel, `/` e `/login` preservados.                                  | CA01      |
| T02 | Desktop 1440 × 900: menu, cabeçalho, indicadores "6" e "5 de 6", seis linhas e colunas; capturas para comparação com a referência.                           | CA02      |
| T03 | Mobile 390 × 844: barra superior, botão em largura total, indicadores, filtros em duas colunas, cards; ausência de menu lateral e tabela; capturas.          | CA03      |
| T04 | Formatação de preços desktop e mobile para `starting-at` e `fixed`, incluindo centavos.                                                                      | CA04      |
| T05 | Busca por caixa, acento e espaços externos; combinação com categoria e status; indicadores inalterados.                                                      | CA05      |
| T06 | Alternar chave: rótulo, indicadores, remoção da lista sob filtro de status e restauração ao recarregar.                                                      | CA06      |
| T07 | Estado vazio e "Limpar filtros"; busca só com espaços.                                                                                                       | CA07      |
| T08 | Controles indisponíveis não agem nem navegam, por clique e teclado; "Categorias"/"Configurações" sem navegação.                                              | CA08      |
| T09 | "Visualizar site" com `target="_blank"`/`rel` e destino `/`; "Sair" navega a `/login`.                                                                       | CA09      |
| T10 | Gaveta: abertura, foco, `Esc`, fundo, ×, navegação e retorno de foco.                                                                                        | CA10      |
| T11 | 320, 390, 768, 1023/1024 e 1440 px: composição correta e sem rolagem horizontal; alvos ≥ 44 px no mobile.                                                    | CA11      |
| T12 | Semântica: `h1`, `nav`, `aria-current`, `role="switch"`, cabeçalhos de tabela, região viva; foco por teclado; hover sem mudar dimensões; movimento reduzido. | CA12      |
| T13 | Cobertura por unidade, regressões, HTML gerado de `/`, `/login` e `/admin/cardapio`, formatação e diff.                                                      | CA13      |

- [ ] Criar e executar T01, T04–T08, T12 em testes unitários, incluindo ramos de filtro e estado vazio. (CA01, CA04–CA08, CA12)
- [ ] Criar e executar T01–T03, T06, T09–T12 no Playwright e comparar visualmente as três referências do cardápio/gaveta. (CA01–CA03, CA06, CA09–CA12)
- [ ] Executar T13 e comprovar ao menos 90% de cobertura por unidade implementada. (CA13)

## Tarefas de validação

- [ ] V01 — Comparar capturas desktop 1440 × 900 com a referência do cardápio; registrar diferenças. (CA02)
- [ ] V02 — Comparar capturas mobile 390 × 844 (lista e gaveta) com as referências; registrar diferenças. (CA03, CA10)
- [ ] V03 — Validar responsividade, teclado, foco, gaveta e movimento reduzido em navegador; registrar limitações. (CA10–CA12)
- [ ] V04 — Executar `npm test -- --watch=false --coverage`, `npm run test:e2e` e `npm run build` (Node ≥ 22.22) e registrar resultados. (CA13)
- [ ] V05 — Inspecionar `dist/doceria-da-mary/browser/` para as três rotas e confirmar ausência de `design/` e credenciais. (CA13)
- [ ] V06 — Executar `npm run format:check` e `git diff --check`; conferir que `catalog.ts`, landing page e login não foram alterados além do necessário. (CA13)
- [ ] V07 — Registrar revisão de aderência ao `spec.md` e a este `tasks.md`, destacando que o painel não tem guarda de rotas nem persistência. (CA01–CA13)

## Checklist de conclusão

- [ ] I01–I10 implementadas dentro do escopo.
- [ ] CA01–CA13 cobertos por testes, com resultados registrados.
- [ ] Cobertura ≥ 90% por unidade implementada.
- [ ] Referências desktop, mobile e gaveta comparadas com capturas.
- [ ] Filtros, alternância de publicação e controles indisponíveis aprovados.
- [ ] Responsividade, teclado, foco, gaveta e movimento reduzido validados.
- [ ] Sem novas dependências, sem alteração indevida de landing page, catálogo e login.
- [ ] Regressões, build estático, formatação e diff aprovados.
- [ ] Designs continuam excluídos da publicação.
- [ ] Revisão registrada; ausência de guarda de rotas, persistência e backend sinalizada.
