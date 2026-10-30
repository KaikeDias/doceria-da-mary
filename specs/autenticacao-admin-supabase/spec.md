# Autenticação do painel com Supabase

## Objetivo

Trocar o login simulado (`admin`/`admin`) pelo Supabase Auth, restringir o painel a administradores cadastrados, proteger as rotas `/admin/**` e fazer "Sair" encerrar a sessão.

## Contexto

A tela de login está em `specs/tela-login`. Hoje a operação de login aceita só `admin`/`admin`, sem sessão nem proteção de rotas, e "Sair" é um link para `/`. O banco tem a tabela `administradores` (RLS: cada usuário lê só a própria linha) e um usuário admin já cadastrado. A base técnica está em `specs/integracao-supabase-base`.

Esta especificação **substitui** a RN08 de `tela-login`, o atalho `admin` aceito sem formato de e-mail (RN03 volta a valer sem exceção) e os itens "sessão", "proteção de rotas" e "redirecionamento" do fora de escopo daquela spec. Layout, validação e estados de envio continuam iguais.

## Regras de negócio

- RN01: O envio válido chama `signInWithPassword` com e-mail (sem espaços nas extremidades) e senha.
- RN02: Depois de entrar, o usuário precisa estar em `administradores`. Se não estiver, a sessão é encerrada e a tela mostra a mesma mensagem de credenciais inválidas.
- RN03: Mensagens de falha, junto ao formulário: credenciais inválidas ou usuário não admin — "E-mail ou senha incorretos."; falha de rede — "Sem conexão com a internet. Verifique e tente de novo."; qualquer outra falha — "Login indisponível no momento. Tente novamente mais tarde.". Nenhum detalhe técnico é exibido. Depois da falha, valem os resets da `tela-login` (senha limpa e oculta, e-mail mantido).
- RN04: Com sucesso, o painel abre em `/admin/cardapio`.
- RN05: A sessão fica no armazenamento do próprio Supabase no navegador e persiste ao recarregar.
- RN06: Guard em `/admin/**`: sem sessão de administrador, redireciona para `/login`. O resultado da verificação de administrador é guardado por usuário durante a sessão do app.
- RN07: Abrir `/login` já com sessão de administrador leva a `/admin/cardapio`.
- RN08: "Sair" (menu lateral e gaveta) encerra a sessão e leva a `/login`. Se o encerramento falhar na rede, a sessão local é descartada mesmo assim.

## Requisitos funcionais

- RF01: Serviço `Auth` em `core/auth/auth.ts` com `signIn`, `isAdmin` e `signOut`. (RN01, RN02, RN05, RN06, RN08)
- RF02: `LOGIN_REQUEST` passa a usar `Auth.signIn`; remover a credencial fixa e a exceção de e-mail `admin`. (RN01, RN03)
- RF03: Erros tipados `InvalidCredentials` e `Offline`, traduzidos pelo `Login` nas mensagens da RN03. (RN03)
- RF04: Guards `adminGuard` (em `/admin`) e `guestGuard` (em `/login`). (RN06, RN07)
- RF05: "Sair" vira botão que chama `Auth.signOut` e navega para `/login`. (RN08)

## Requisitos não funcionais

- RNF01: E-mail e senha não vão para URL, logs ou armazenamento próprio do app; só o Supabase guarda o token de sessão.
- RNF02: Cadastro aberto de usuários continua desativado no Supabase Auth (configuração do projeto, fora do código).
- RNF03: Testes unitários usam `fetch` falso no client ou `Auth` falso; o Playwright simula `/auth/v1` e `/rest/v1/administradores`.
- RNF04: Cobertura ≥ 90% por unidade alterada; testes existentes da tela de login continuam válidos, exceto os do comportamento substituído.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Credenciais de um administrador abrem `/admin/cardapio`.                                                                           |
| CA02 | Credenciais erradas mostram "E-mail ou senha incorretos." e limpam a senha.                                                        |
| CA03 | Usuário válido fora de `administradores` tem a sessão encerrada e vê "E-mail ou senha incorretos.".                                |
| CA04 | Falha de rede mostra "Sem conexão com a internet. Verifique e tente de novo."; outra falha mostra a mensagem de indisponibilidade. |
| CA05 | `admin` como e-mail volta a ser inválido ("Digite um e-mail válido, como nome@email.com.").                                        |
| CA06 | Sem sessão, abrir `/admin/cardapio` leva a `/login`; com sessão de admin, abrir `/login` leva a `/admin/cardapio`.                 |
| CA07 | "Sair" encerra a sessão e leva a `/login`; depois disso `/admin/cardapio` volta a exigir login.                                    |
| CA08 | Cobertura ≥ 90%; testes, build e formatação passam.                                                                                |

## Casos de erro

| Caso                                          | Tratamento esperado                                         |
| --------------------------------------------- | ----------------------------------------------------------- |
| Falha ao consultar `administradores` no login | Mensagem de indisponibilidade; sessão encerrada.            |
| Falha ao consultar `administradores` no guard | Tratado como sem acesso: redireciona para `/login`.         |
| Sessão expirada                               | O Supabase tenta renovar; sem sucesso, guard leva ao login. |
| "Sair" sem internet                           | Sessão local descartada e navegação para `/login`.          |

## Fora de escopo

- Recuperar ou trocar senha, cadastro, vários admins, login social e 2FA.
- Bloqueio por tentativas além do que o Supabase Auth já faz.
