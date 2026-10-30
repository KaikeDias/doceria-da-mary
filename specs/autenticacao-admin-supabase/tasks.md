# Tarefas — Autenticação do painel com Supabase

Especificação: `specs/autenticacao-admin-supabase/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                              | Critérios       | Testes  |
| ------------- | ----------------------------------------------- | --------------- | ------- |
| I01           | Serviço `Auth` (entrar, verificar admin, sair). | CA01–CA04, CA07 | T01–T04 |
| I02           | Login usando `Auth` e mensagens novas.          | CA01–CA05       | T05     |
| I03           | Guards de painel e de login.                    | CA06            | T06     |
| I04           | "Sair" encerrando a sessão.                     | CA07            | T07     |
| I05           | Playwright do painel com sessão simulada.       | CA06, CA08      | T08     |

## Tarefas de implementação

- [x] I01 — Criar `core/auth/auth.ts` com `Auth`, `InvalidCredentials` e `Offline`. (CA01–CA04, CA07)
- [x] I02 — Em `login.ts`, `LOGIN_REQUEST` chama `Auth.signIn`; remover `admin`/`admin` e a exceção de e-mail; mensagem de "sem conexão". (CA01–CA05)
- [x] I03 — `adminGuard` e `guestGuard` em `core/auth/auth.ts`, aplicados em `app.routes.ts`. (CA06)
- [x] I04 — Em `admin.html`/`admin.ts`, "Sair" como botão que chama `signOut` e navega para `/login`. (CA07)
- [x] I05 — `tests/browser/supabase-mock.ts`: sessão de admin simulada para os testes do painel. (CA08)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                | Critérios |
| --- | ------------------------------------------------------------------ | --------- |
| T01 | `signIn` com admin válido resolve.                                 | CA01      |
| T02 | `signIn` com 400 `invalid_credentials` e com usuário não admin.    | CA02–CA03 |
| T03 | `signIn` com falha de rede e com erro 500.                         | CA04      |
| T04 | `signOut` remove a sessão, inclusive com falha de rede.            | CA07      |
| T05 | Mensagens do `Login` para cada erro; `admin` inválido como e-mail. | CA02–CA05 |
| T06 | Guards redirecionam conforme a sessão.                             | CA06      |
| T07 | "Sair" chama `signOut` e navega para `/login`.                     | CA07      |
| T08 | Cobertura, regressões, build e formatação.                         | CA08      |

- [x] Criar e executar T01–T07 (Vitest).
- [x] Executar T08.

## Tarefas de validação

- [ ] V01 — Em `ng serve`, entrar com o usuário real, recarregar o painel e sair.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA08 cobertos por testes.
- [x] Nenhuma credencial fixa no bundle.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- Pendente V01: entrar com o usuário real exige a senha da Mary; não foi executado.
- Os guards são carregados sob demanda para manter o `supabase-js` fora do bundle inicial.
