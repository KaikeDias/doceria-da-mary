# Tarefas — Landing lendo as configurações do site

Especificação: `specs/landing-configuracoes-supabase/spec.md`.

Depende de `SiteConfigRepository.load()` de `specs/configuracoes-site-admin` (tarefa I01).

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                         | Critérios  | Testes |
| ------------- | ---------------------------------------------------------- | ---------- | ------ |
| I01           | Migration: WhatsApp e Instagram preenchidos quando nulos.  | CA06       | V01    |
| I02           | Valores padrão de `SiteConfig`; fim de `public-config.ts`. | CA04, CA07 | T01    |
| I03           | Links de WhatsApp com número e mensagem das configurações. | CA02       | T02    |
| I04           | `Home` lê as configurações e o template usa o signal.      | CA01–CA05  | T03    |
| I05           | Playwright com `configuracoes_site` simulado.              | CA07       | T04    |

## Tarefas de implementação

- [x] I01 — Nova migration em `supabase/migrations/` com o `update` condicional de RN08. (CA06)
- [x] I02 — Padrões em `site-config.ts`; remover `public-config.ts` e ajustar `app.spec.ts`, `login.spec.ts` e `contact-links.spec.ts`. (CA04, CA07)
- [x] I03 — `contact-links.ts`: `whatsappUrl(phone, message)` com prefixo 55, `productWhatsappUrl(phone, name)`; `ProductDetails` recebe o número. (CA02)
- [x] I04 — `home.ts/html`: signal de configurações com padrões, `load()` separado do cardápio, ligações de RN03, títulos sem `<br>`, links e textos de contato. (CA01–CA05)
- [x] I05 — `tests/browser/supabase-mock.ts` responde `configuracoes_site`; ajustar e2e que conferem links de contato. (CA07)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                            | Critérios |
| --- | -------------------------------------------------------------------------------------------------------------- | --------- |
| T01 | Padrões iguais aos textos/contatos atuais; campo nulo cai no padrão.                                           | CA04      |
| T02 | `whatsappUrl` com 55, número inválido, mensagem codificada; mensagem do produto.                               | CA02      |
| T03 | `Home` com repositório falso: skeletons ao carregar, valores do banco, falha (padrões e cardápio ok), imagens. | CA01–CA05 |
| T04 | Playwright: landing com configurações simuladas; build, cobertura e formatação.                                | CA07      |

- [x] Criar e executar T01–T03 (Vitest).
- [x] Executar T04.

## Tarefas de validação

- [ ] V01 — Aplicar a migration no banco real; salvar no painel e conferir a landing ao recarregar.
- [ ] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA07 cobertos por testes.
- [x] Nenhum teste antigo depende de `public-config.ts`.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 18 arquivos, 162 testes passando (inclui o estado de carregamento com skeletons); cobertura geral 99,1% instruções / 96,2% ramos. `site-config.ts` 97% instruções / 97% ramos (a linha não coberta é o `useFactory` do provider); `configuracoes.ts` 100% linhas / 92,5% ramos.
- Playwright: 69 testes passando com o Supabase simulado, executado com o canal `msedge` (Chrome não instalado nesta máquina) por uma config temporária fora do repositório.
- `npm run build` passando. `npm run format:check`: os arquivos desta funcionalidade estão formatados; falha em 5 arquivos não alterados aqui (`AGENTS.md`, `README.md`, `package.json`, `playwright.config.ts`, `docs/PROJECT_STATUS.md`).
- V01 pendente: depende de aplicar a migration e testar com o banco real.
