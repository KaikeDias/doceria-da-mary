# Tarefas — Painel › Novo/Editar produto com Supabase

Especificação: `specs/formulario-produto-supabase/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                             | Critérios             | Testes  |
| ------------- | ------------------------------------------------------------------------------ | --------------------- | ------- |
| I01           | `saveProduct` Supabase (slug, ordem, diff, fotos).                             | CA01–CA05             | T01–T04 |
| I02           | Guard `menuReady` nas rotas do formulário.                                     | CA08                  | T05     |
| I03           | Formulário com categorias do banco, tipos aceitos, gravação assíncrona e erro. | CA01, CA03, CA05–CA08 | T06–T08 |
| I04           | Playwright do formulário com Supabase simulado.                                | CA09                  | T09     |

## Tarefas de implementação

- [x] I01 — Em `admin-menu-repository.ts`, `slugify`, `saveProduct` e o envio/remoção de fotos. (CA01–CA05)
- [x] I02 — `menuReady` em `app.routes.ts` para `novo` e `:id/editar`. (CA08)
- [x] I03 — Em `produto-form.ts/html`, `File` por URL `blob:`, filtro JPG/PNG/WEBP ≤ 5 MB, `saving`, `fieldset` desabilitado, "Salvando…", aviso de erro e mensagem com fotos não enviadas. (CA01, CA03, CA05–CA08)
- [x] I04 — Atualizar `tests/browser/admin-produto-form.e2e.ts` para o mock. (CA09)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                       | Critérios  |
| --- | --------------------------------------------------------- | ---------- |
| T01 | Inserção com slug único, `ordem` e fotos (`fetch` falso). | CA01, CA02 |
| T02 | Edição com diff e fotos inalteradas.                      | CA03       |
| T03 | Recriação das linhas e remoção do arquivo.                | CA04       |
| T04 | Falha em uma foto contada.                                | CA05       |
| T05 | Guard com id inexistente e com falha de carga.            | CA08       |
| T06 | "Salvando…", bloqueio e aviso de erro.                    | CA06       |
| T07 | Arquivos recusados.                                       | CA07       |
| T08 | Mensagem de sucesso com fotos não enviadas.               | CA05       |
| T09 | Cobertura, Playwright, build e formatação.                | CA09       |

- [x] Criar e executar T01–T08 (Vitest).
- [x] Executar T09.

## Tarefas de validação

- [ ] V01 — Em `ng serve` com o banco real, criar um produto com 3 fotos e conferir a landing e o modal; depois excluí-lo.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I04 concluídas.
- [x] CA01–CA09 cobertos por testes.
- [x] Nenhuma URL `blob:` gravada no banco.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- Pendente V01: criar produto com fotos no banco real não foi executado (exige login real e grava no Storage).

## Correcoes de auditoria (2026-10-30)

- [x] Implementar CA10-CA12: regras e criterios adicionais do spec.md desta funcionalidade.
- [x] Adicionar testes de regressao de CA10-CA12.
- [x] Executar testes, cobertura, Playwright e build; registrar resultados.

### Evidencias da correcao

- 172 testes unitarios passaram; cobertura geral: 99,72% linhas e 96,38% ramos. Unidades de producao alteradas acima de 90% de linhas.
- Build de producao passou; Prettier nos arquivos alterados e git diff --check passaram.
- Playwright: 71 testes passaram no Edge, com config temporaria e espera de 15 segundos. Houve timeouts nas tentativas anteriores com 5 segundos durante carregamento.
- Todas as migrations e supabase/tests/persistencia-seguranca.sql passaram em Postgres isolado via PGlite, com schemas Auth/Storage minimos; Docker local estava desligado.
- Revisao: implementacao e testes aderem aos criterios adicionais desta funcionalidade; nao foram alterados os comportamentos explicitamente fora de escopo.
- [ ] Aplicar as duas migrations novas no Supabase remoto e validar integracao real antes de publicar o frontend.
