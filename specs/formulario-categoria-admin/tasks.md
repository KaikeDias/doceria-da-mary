# Tarefas — Painel › Criar, editar e excluir categorias

Especificação: `specs/formulario-categoria-admin/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                       | Critérios             | Testes  |
| ------------- | ------------------------------------------------------------------------ | --------------------- | ------- |
| I01           | Migration: nome único e fim das imagens `images/…`.                      | CA09                  | V01     |
| I02           | `categoryImageUrl` só do bucket; chip usa o mesmo nome dos cards.        | CA09                  | T01     |
| I03           | Repositório: imagem na listagem, `saveCategory`, `deleteCategory`.       | CA02, CA04–CA06, CA08 | T02     |
| I04           | `MenuStore`: salvar, excluir e produtos ativos por categoria.            | CA04, CA07, CA08      | T03     |
| I05           | Formulário em modal: validação, imagem, prévia, chave, gravação, mobile. | CA01–CA06, CA10       | T04–T07 |
| I06           | `Categorias`: abrir formulário, bloqueio/confirmação, lista com imagem.  | CA01, CA07–CA10       | T08–T09 |
| I07           | Playwright com Supabase simulado (REST e Storage).                       | CA10, CA11            | T10     |

## Tarefas de implementação

- [x] I01 — Nova migration em `supabase/migrations/`: `nome = rotulo`; `imagem_url = null` onde começa com `images/`. (CA09)
- [x] I02 — `supabase.ts`: `categoryImageUrl` só monta URL do bucket `site`. `catalog-repository.ts`: `name` do chip vem de `rotulo`. (CA09)
- [x] I03 — `admin-menu-repository.ts`: `image` em `AdminCategory`; `saveCategory(input, existing?)` (criar com slug único e `ordem` no fim, editar só o que mudou, enviar imagem e apagar a anterior no bucket `site`); `deleteCategory(category)`; erro `23505` reconhecível; generalizar `uniqueSlug`/`removeFiles` por tabela/bucket. (CA02, CA04–CA06, CA08)
- [x] I04 — `menu-store.ts`: `saveCategory`, `deleteCategory`, contagem de produtos publicados por categoria. (CA04, CA07, CA08)
- [x] I05 — Novo `categoria-form.ts/html` em `<dialog>`: nome com contador e erros, imagem obrigatória (arrastar, escolher, trocar, validação de 2 MB e tipo), prévia, chave, aviso de produtos, "Excluir categoria", "Salvando…", aviso de erro, painel inferior no mobile. (CA01–CA06, CA10)
- [x] I06 — `categorias.ts/html`: habilitar "Adicionar categoria", "Editar" e "Excluir"; diálogo de bloqueio e de confirmação; miniatura na lista; cards mobile com "Editar"/"Excluir" com texto; avisos de sucesso/erro. (CA01, CA07–CA10)
- [x] I07 — Atualizar `tests/browser/supabase-mock.ts` e `tests/browser/admin-categorias.e2e.ts`. (CA10, CA11)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                              | Critérios             |
| --- | ---------------------------------------------------------------------------------------------------------------- | --------------------- |
| T01 | `categoryImageUrl` ignora `images/…`; catálogo usa `rotulo` no chip.                                             | CA09                  |
| T02 | Repositório com `fetch` falso: criar, editar (nome, imagem nova), excluir, `23505`, falha de envio.              | CA02, CA04–CA06, CA08 |
| T03 | Store salva/exclui, recarrega e conta só produtos publicados.                                                    | CA04, CA07, CA08      |
| T04 | Abrir/fechar modal (×, Cancelar, Esc), valores iniciais de criação e edição.                                     | CA01, CA05            |
| T05 | Validação do nome (vazio, duplicado local e do banco, contador).                                                 | CA02                  |
| T06 | Imagem: obrigatória, tamanho, tipo, trocar, prévia.                                                              | CA03, CA05            |
| T07 | Salvando, falha de gravação, falha de envio da imagem.                                                           | CA06                  |
| T08 | Exclusão: bloqueio com publicados; confirmação com ocultos e sem produtos; cancelar; falha; via modal.           | CA07, CA08            |
| T09 | Lista com miniatura e ícone de fallback.                                                                         | CA09                  |
| T10 | Playwright: criar/editar/excluir, 390 px, acessibilidade, sem rolagem horizontal; cobertura, build e formatação. | CA10, CA11            |

- [x] Criar e executar T01–T09 (Vitest).
- [x] Executar T10.

## Tarefas de validação

- [ ] V01 — Aplicar a migration no banco real e, em `ng serve`, criar, editar (com imagem) e excluir uma categoria e conferir chips e cards da landing.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.
- [x] V03 — Ajustar os testes antigos que exigem ações indisponíveis, nome curto no chip ou imagens `images/…`.

## Checklist de conclusão

- [x] I01–I07 concluídas.
- [x] CA01–CA11 cobertos por testes.
- [x] Nenhum teste antigo depende do comportamento substituído.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 16 arquivos, 137 testes passando; cobertura geral 99,2% instruções / 96,1% ramos. `categoria-form.ts/html`, `admin-menu-repository.ts`, `supabase.ts` e `catalog-repository.ts` com 100%; `categorias.ts/html` e `menu-store.ts` com 100% de linhas.
- Playwright: 56 testes passando com o Supabase simulado. Executado com o canal `msedge` (Chrome não instalado nesta máquina); os 3 primeiros testes do cardápio falharam na partida a frio do servidor e passaram ao repetir o arquivo (15/15).
- `npm run build`: 1 rota pré-renderizada; bundle inicial 406 kB.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- Pendente V01: aplicar a migration `20261030160000_categoria_nome_unico_e_imagens.sql` no banco real e validar com login real.
- Testes antigos ajustados (V03): "ações indisponíveis" de `categorias.spec.ts` substituído pelos testes de exclusão; chip "Kits" e imagens `images/…` removidos de `catalog-repository.spec.ts`, `supabase.spec.ts` e `tests/browser/supabase-mock.ts`.

## Correcoes de auditoria (2026-10-30)

- [x] Implementar CA12: regras e criterios adicionais do spec.md desta funcionalidade.
- [x] Adicionar testes de regressao de CA12.
- [x] Executar testes, cobertura, Playwright e build; registrar resultados.

### Evidencias da correcao

- 172 testes unitarios passaram; cobertura geral: 99,72% linhas e 96,38% ramos. Unidades de producao alteradas acima de 90% de linhas.
- Build de producao passou; Prettier nos arquivos alterados e git diff --check passaram.
- Playwright: 71 testes passaram no Edge, com config temporaria e espera de 15 segundos. Houve timeouts nas tentativas anteriores com 5 segundos durante carregamento.
- Todas as migrations e supabase/tests/persistencia-seguranca.sql passaram em Postgres isolado via PGlite, com schemas Auth/Storage minimos; Docker local estava desligado.
- Revisao: implementacao e testes aderem aos criterios adicionais desta funcionalidade; nao foram alterados os comportamentos explicitamente fora de escopo.
- [ ] Aplicar as duas migrations novas no Supabase remoto e validar integracao real antes de publicar o frontend.
