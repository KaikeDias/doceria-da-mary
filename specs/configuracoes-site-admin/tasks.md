# Tarefas — Painel › Configurações do site

Especificação: `specs/configuracoes-site-admin/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                                | Critérios       | Testes  |
| ------------- | --------------------------------------------------------------------------------- | --------------- | ------- |
| I01           | `SiteConfig`, `SiteConfigRepository` (`load`, `save`) e implementação Supabase.   | CA01, CA09–CA11 | T01     |
| I02           | Normalização/validação de WhatsApp, Instagram, e-mail, obrigatórios e formatação. | CA05–CA07       | T02     |
| I03           | Componente `Configuracoes`: seções, atalhos, prévia, imagens, barra, avisos.      | CA01–CA13       | T03–T08 |
| I04           | Rota `admin/configuracoes` e link no menu do painel.                              | CA01            | T03     |
| I05           | Playwright com Supabase simulado (REST e Storage).                                | CA13, CA14      | T09     |

## Tarefas de implementação

- [x] I01 — `src/app/core/config/site-config.ts`: modelo `SiteConfig`, `SiteConfigRepository` abstrato e `SupabaseSiteConfigRepository` (leitura da linha `id = 1`; gravação: enviar imagens novas para `site/configuracoes/`, `update` da linha, apagar arquivos anteriores; limpar enviados se o `update` falhar). Conferir `database.types.ts`. (CA01, CA09–CA11)
- [x] I02 — Funções puras no mesmo módulo (ou `site-config-validation.ts`): `normalizeWhatsapp`, `normalizeInstagram`, `formatPhone`, `validateSiteConfig` devolvendo erros por campo. (CA05–CA07)
- [x] I03 — `src/app/features/admin/configuracoes.ts/html`: formulário em signals, contadores e limites, prévia do WhatsApp, logo e imagem principal (trocar, remover, validação de tipo/tamanho, `blob:` revogado), estado pendente/salvando/salvo, aviso "Falta corrigir…", foco no primeiro inválido, aviso de falha com "Tentar de novo", aviso verde fechável, atalhos desktop/mobile, barra inferior fixa com "Visualizar site". (CA01–CA13)
- [x] I04 — `app.routes.ts`: rota `configuracoes`; `admin.html`: trocar o item indisponível por link com `routerLinkActive`. Ajustar testes do painel que esperam o item indisponível. (CA01)
- [x] I05 — `tests/browser/supabase-mock.ts` com `configuracoes_site`; novo `tests/browser/admin-configuracoes.e2e.ts`. (CA13, CA14)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                                       | Critérios       |
| --- | ------------------------------------------------------------------------------------------------------------------------- | --------------- |
| T01 | Repositório com `fetch` falso: leitura e mapeamento; gravação com/sem imagens novas, remoção, falha no envio e no update. | CA01, CA09–CA11 |
| T02 | Normalização e validação: WhatsApp (máscara, 55 colado, incompleto), Instagram (link, @, inválido), e-mail, obrigatórios. | CA05–CA07       |
| T03 | Tela carrega valores, menu leva à rota ativa; carregando, erro e "Tentar de novo".                                        | CA01, CA02      |
| T04 | Estado pendente: sem alterações, editar, desfazer; contadores e limites; prévia do WhatsApp.                              | CA03, CA04      |
| T05 | Salvar com erros: aviso com contagem, mensagens, foco, recálculo ao corrigir; opcionais vazios como nulo.                 | CA05, CA06      |
| T06 | Imagens: tipos e tamanhos inválidos, trocar, remover, imagem padrão, "Remover" escondido.                                 | CA08, CA09      |
| T07 | Salvando, sucesso (aviso verde fechável, "Tudo salvo"), falha e "Tentar de novo".                                         | CA10, CA11      |
| T08 | "Visualizar site" e atalhos.                                                                                              | CA12            |
| T09 | Playwright: editar e salvar, erros, 390 px, acessibilidade, sem rolagem horizontal; cobertura, build e formatação.        | CA13, CA14      |

- [x] Criar e executar T01–T08 (Vitest).
- [x] Executar T09.

## Tarefas de validação

- [ ] V01 — Em `ng serve` com o banco real, editar todos os campos, trocar e remover imagens, salvar e conferir a linha e o bucket no Supabase.
- [ ] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA14 cobertos por testes.
- [x] Nenhum teste antigo depende do item "Configurações" indisponível.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 18 arquivos, 161 testes passando; cobertura geral 99,1% instruções / 95% ramos. `site-config.ts` 97% instruções / 97% ramos (a linha não coberta é o `useFactory` do provider); `configuracoes.ts` 100% linhas / 92,5% ramos.
- Playwright: 69 testes passando com o Supabase simulado, executado com o canal `msedge` (Chrome não instalado nesta máquina) por uma config temporária fora do repositório.
- `npm run build` passando. `npm run format:check`: os arquivos desta funcionalidade estão formatados; falha em 5 arquivos não alterados aqui (`AGENTS.md`, `README.md`, `package.json`, `playwright.config.ts`, `docs/PROJECT_STATUS.md`).
- V01 pendente: depende de aplicar a migration e testar com o banco real.

## Correcoes de auditoria (2026-10-30)

- [x] Implementar CA15-CA16: regras e criterios adicionais do spec.md desta funcionalidade.
- [x] Adicionar testes de regressao de CA15-CA16.
- [x] Executar testes, cobertura, Playwright e build; registrar resultados.

### Evidencias da correcao

- 172 testes unitarios passaram; cobertura geral: 99,72% linhas e 96,38% ramos. Unidades de producao alteradas acima de 90% de linhas.
- Build de producao passou; Prettier nos arquivos alterados e git diff --check passaram.
- Playwright: 71 testes passaram no Edge, com config temporaria e espera de 15 segundos. Houve timeouts nas tentativas anteriores com 5 segundos durante carregamento.
- Todas as migrations e supabase/tests/persistencia-seguranca.sql passaram em Postgres isolado via PGlite, com schemas Auth/Storage minimos; Docker local estava desligado.
- Revisao: implementacao e testes aderem aos criterios adicionais desta funcionalidade; nao foram alterados os comportamentos explicitamente fora de escopo.
- [ ] Aplicar as duas migrations novas no Supabase remoto e validar integracao real antes de publicar o frontend.
