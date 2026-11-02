# Ambiente de desenvolvimento local

## Objetivo

Impedir que o servidor de desenvolvimento altere o banco de producao.

## Contexto

Os dois environments usavam o mesmo projeto remoto.

## Regras de negocio

RN01: Development usa Supabase local em 127.0.0.1:54321, com chave anon local.
RN02: Testes de navegador interceptam apenas o projeto local; producao preserva seu projeto remoto.

## Requisitos funcionais

Documentar iniciar Supabase local, migrations e administrador local.

## Requisitos nao funcionais

Sem credenciais privadas e sem dependencias novas na aplicacao.

## Criterios de aceitacao

CA01: Build development nao aponta ao host remoto de producao.
CA02: Playwright mantem fluxos simulados com o endpoint local.

## Casos de erro

Supabase local desligado mostra os estados de erro existentes.

## Fora de escopo

Provisionar outro projeto cloud ou copiar dados de producao.
