# feat: integração do site e do painel com o Supabase

## Contexto

Até aqui, a landing e o painel administrativo usavam dados fixos ou em memória: produtos e categorias em `catalog.ts`, login falso (`admin`/`admin`), contato em `public-config.ts` e alterações do painel perdidas ao recarregar. Esta branch liga o site ao Supabase (banco, autenticação e Storage), seguindo a ordem definida em `docs/roadmap-integracao-supabase.md`. Ela também libera as telas do painel que estavam indisponíveis por falta de design: as ações de categorias e as Configurações do site.

## Objetivo

A Mary passa a manter cardápio, categorias e informações do site pelo painel. Visitantes veem na landing só o que estiver publicado e visível.

## Alterações Realizadas

- **Banco** (`9a51012`): projeto Supabase versionado (`supabase/config.toml`), schema inicial (tabelas, views, RLS, buckets `produtos` e `site`) e alinhamento com o modelo do front.
- **Base técnica** (`183278a`): client do `supabase-js` criado só no navegador (nenhuma chamada ao banco no build), ambientes e helpers comuns.
- **Catálogo público** (`533a385`): a landing lê categorias visíveis e produtos publicados, com estados de carregamento, erro com "Tentar de novo" e cardápio vazio.
- **Autenticação** (`f845c2d`): login real com Supabase Auth e guarda das rotas `/admin` (só administradores).
- **Painel › Cardápio** (`218d8c4`, `3b561d1`, `f397bcf`): repositório e store do painel; publicar/ocultar e excluir produtos; formulário de produto com até 5 fotos enviadas ao Storage.
- **Painel › Categorias** (`5164b7c`, `6040e38`): mostrar/ocultar persistido; criar, editar e excluir categorias em modal, com imagem obrigatória, prévia, nome único e bloqueio de exclusão quando há produtos publicados.
- **Gaveta do menu mobile** (`413a078`): animação de entrada e saída, sem transição com "reduzir movimento".
- **Painel › Configurações** (`243100b`): nova tela `/admin/configuracoes` para editar identidade, contato, atendimento e conteúdo da landing, com validação, prévia do WhatsApp, upload de logo e imagem principal, barra de alterações pendentes e tratamento de falha ao salvar.
- **Landing lendo as configurações** (`59327f4`): nome, textos, logo, imagem principal, WhatsApp e Instagram passam a vir do banco, com skeletons enquanto carrega.
- **Documentação** (`8f9d522`): decisões de arquitetura e roadmap da integração.

## Especificação Relacionada

| Funcionalidade                    | Especificação                           |
| --------------------------------- | --------------------------------------- |
| Base técnica                      | `specs/integracao-supabase-base/`       |
| Catálogo público                  | `specs/catalogo-publico-supabase/`      |
| Autenticação do painel            | `specs/autenticacao-admin-supabase/`    |
| Cardápio do painel                | `specs/cardapio-admin-supabase/`        |
| Formulário de produto             | `specs/formulario-produto-supabase/`    |
| Categorias (visibilidade)         | `specs/categorias-admin-supabase/`      |
| Categorias (criar/editar/excluir) | `specs/formulario-categoria-admin/`     |
| Gaveta mobile (RN10 atualizada)   | `specs/painel-admin-cardapio/`          |
| Configurações do site             | `specs/configuracoes-site-admin/`       |
| Landing lendo as configurações    | `specs/landing-configuracoes-supabase/` |

Cada pasta tem `spec.md` e `tasks.md`. A seção "Resultados registrados" de cada `tasks.md` traz os testes executados e as pendências.

## Regras de Negócio

- Visitante anônimo só lê produtos publicados de categorias visíveis (ou sem categoria) e as configurações do site. Escrita no banco e no Storage só para administradores (RLS).
- Uma categoria tem um nome só: o mesmo no filtro, nos cards da landing e no painel.
- Categoria com produto publicado não pode ser excluída; com produtos ocultos, eles ficam sem categoria.
- Nas Configurações, todo campo é obrigatório, exceto e-mail e endereço. WhatsApp é gravado como DDD + número; Instagram só com o usuário (links e "@" colados são normalizados).
- Os botões gerais de WhatsApp da landing usam a mensagem padrão das Configurações; os botões de cada doce montam a mensagem com o nome do produto.
- Se a leitura das configurações falhar, a landing usa os textos e contatos atuais como padrão.

## Decisões Técnicas

- Só a casca da landing é pré-renderizada; cardápio e configurações são buscados no navegador. Login e painel rodam só no cliente.
- Repositórios abstratos (`CatalogRepository`, `AdminMenuRepository`, `SiteConfigRepository`) com implementação Supabase, para os testes usarem versões falsas.
- Imagens enviadas ao Storage só ao salvar. Ao trocar ou remover, o arquivo anterior é apagado; falha nessa limpeza só gera log no console.
- Enquanto as configurações carregam, a landing mostra skeletons em vez de textos padrão, para o texto não trocar na frente do visitante.

## Banco de Dados

Migrations em `supabase/migrations/`:

| Migration                                           | Conteúdo                                                                       | Situação no projeto real           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `20261030041002_schema_inicial.sql`                 | Tabelas, views, RLS, buckets e dados iniciais.                                 | Aplicada (registrada no roadmap).  |
| `20261030042000_alinhar_catalogo_com_front.sql`     | Alinha o banco ao modelo do front.                                             | Aplicada (registrada no roadmap).  |
| `20261030160000_categoria_nome_unico_e_imagens.sql` | `nome = rotulo` nas categorias; limpa `imagem_url` que aponta para `images/…`. | **Não aplicada.** Só altera dados. |
| `20261030180000_configuracoes_contato.sql`          | Preenche WhatsApp e Instagram de `configuracoes_site` quando nulos.            | **Não aplicada.** Só altera dados. |

## Configurações

- `src/environments/environment*.ts`: URL do projeto e chave publishable do Supabase.
- `src/app/core/config/public-config.ts` foi **removido**: o contato passa a vir de `configuracoes_site`.

## Como Testar

1. Aplicar as duas migrations pendentes no projeto Supabase.
2. `npm start` e abrir `/`: categorias, produtos, textos e contatos vêm do banco; enquanto carrega, aparecem skeletons.
3. Abrir `/admin` sem sessão: leva para `/login`. Entrar com o usuário administrador.
4. Cardápio: ocultar um produto e conferir que ele some da landing; criar um produto com fotos.
5. Categorias: criar uma categoria com imagem, renomear, tentar excluir uma com produto publicado (bloqueado) e excluir uma sem produtos publicados.
6. Configurações: alterar título principal, WhatsApp e logo, salvar e conferir a landing ao recarregar. Testar campos inválidos e a mensagem "Falta corrigir N campos".
7. Em 390 px: gaveta do menu, cards de categorias e tela de Configurações.

## Cenários Validados

- [x] Testes unitários: 18 arquivos, 162 testes passando no último commit (cobertura geral 99,1% instruções / 96,2% ramos).
- [x] Testes unitários também passando nos commits `6040e38` (137) e `243100b` (160), e build ok em `413a078`.
- [x] Playwright com Supabase simulado: suíte completa com 69 testes passando antes da correção do balão da prévia (um teste do cardápio falhou na partida a frio e passou ao repetir o arquivo); depois da correção, os 10 testes de Configurações passaram. A suíte completa (71 testes) não foi executada de uma vez após essa última mudança.
- [x] Executado com o canal `msedge`, porque o Chrome não está instalado na máquina usada.
- [ ] Validação manual contra o projeto Supabase real (V01 das specs de categorias, configurações e landing).

## Critérios de Aceitação Atendidos

Os critérios de cada funcionalidade estão nas specs listadas acima e foram cobertos por testes automatizados, conforme os `tasks.md`. As validações manuais contra o banco real continuam pendentes.

## Impactos

- A landing passa a depender do Supabase para mostrar cardápio e informações; sem conexão, mostra erro no cardápio e os textos padrão nas informações.
- O HTML estático da `/` não contém mais o título principal nem os textos do topo (agora são skeletons até carregar), o que reduz o conteúdo visível para buscadores e prévias de link.
- O painel deixa de funcionar com o login falso `admin`/`admin`.

## Riscos e Pontos de Atenção

- **Migrations pendentes**: sem `20261030180000`, WhatsApp e Instagram da landing ficam com os valores padrão; sem `20261030160000`, categorias antigas podem mostrar nomes diferentes entre chip e card.
- **Hospedagem**: ainda não escolhida; precisa redirecionar `/admin/**` e `/login` para o HTML do app (Fase 6 do roadmap).
- **`npm run format:check`** falha em 5 arquivos não alterados nesta etapa: `AGENTS.md`, `README.md`, `package.json`, `playwright.config.ts` e `docs/PROJECT_STATUS.md`.
- Campos de atendimento (e-mail, horário, região, endereço, texto sobre encomendas) são salvos, mas ainda não aparecem na landing (sem design).
- A descrição do site não altera a prévia de compartilhamento (meta tags geradas no build).

## Checklist

- [x] A implementação está de acordo com a especificação
- [x] As tarefas relacionadas foram concluídas (exceto as validações manuais V01)
- [x] Os critérios de aceitação foram atendidos nos testes automatizados
- [x] Foram adicionados ou atualizados testes automatizados
- [x] Os testes existentes continuam passando
- [ ] As alterações de banco de dados foram validadas
- [x] A documentação necessária foi atualizada
- [x] Não foram incluídas alterações fora do escopo

🤖 Generated with [Claude Code](https://claude.com/claude-code)
