# Tarefas — Painel › Categorias com Supabase

Especificação: `specs/categorias-admin-supabase/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                            | Critérios  | Testes  |
| ------------- | ------------------------------------------------------------- | ---------- | ------- |
| I01           | Leitura de `categorias_com_contagem` e gravação de `visivel`. | CA01, CA03 | T01     |
| I02           | Tela com carregando, erro, salvamento e avisos.               | CA01–CA05  | T02–T05 |
| I03           | Playwright de categorias com Supabase simulado.               | CA06       | T06     |

## Tarefas de implementação

- [x] I01 — Em `admin-menu-repository.ts`, `listCategories()` com contagem e `setCategoryVisible()`. (CA01, CA03)
- [x] I02 — Em `categorias.ts/html`, carregar pelo `MenuStore`, estados de carregando/erro, salvamento e avisos de sucesso/erro. (CA01–CA05)
- [x] I03 — Atualizar `tests/browser/admin-categorias.e2e.ts` para o mock. (CA06)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                      | Critérios  |
| --- | -------------------------------------------------------- | ---------- |
| T01 | Mapeamento da view e gravação com `fetch` falso.         | CA01, CA03 |
| T02 | Lista com contagens e status.                            | CA01       |
| T03 | Carregando, erro e "Tentar de novo".                     | CA02       |
| T04 | Salvamento e sucesso; falha mantém status e mostra erro. | CA03–CA04  |
| T05 | Ações continuam indisponíveis.                           | CA05       |
| T06 | Cobertura, Playwright, build e formatação.               | CA06       |

- [x] Criar e executar T01–T05 (Vitest).
- [x] Executar T06.

## Tarefas de validação

- [ ] V01 — Em `ng serve` com o banco real, ocultar e mostrar uma categoria e conferir os chips da landing.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I03 concluídas.
- [x] CA01–CA06 cobertos por testes.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- Pendente V01: alterar dados no banco real não foi executado (exige login real).

## Correcoes de auditoria (2026-10-30)

- [x] Implementar CA07: regras e criterios adicionais do spec.md desta funcionalidade.
- [x] Adicionar testes de regressao de CA07.
- [x] Executar testes, cobertura, Playwright e build; registrar resultados.

### Evidencias da correcao

- 172 testes unitarios passaram; cobertura geral: 99,72% linhas e 96,38% ramos. Unidades de producao alteradas acima de 90% de linhas.
- Build de producao passou; Prettier nos arquivos alterados e git diff --check passaram.
- Playwright: 71 testes passaram no Edge, com config temporaria e espera de 15 segundos. Houve timeouts nas tentativas anteriores com 5 segundos durante carregamento.
- Todas as migrations e supabase/tests/persistencia-seguranca.sql passaram em Postgres isolado via PGlite, com schemas Auth/Storage minimos; Docker local estava desligado.
- Revisao: implementacao e testes aderem aos criterios adicionais desta funcionalidade; nao foram alterados os comportamentos explicitamente fora de escopo.
- [ ] Aplicar as duas migrations novas no Supabase remoto e validar integracao real antes de publicar o frontend.
