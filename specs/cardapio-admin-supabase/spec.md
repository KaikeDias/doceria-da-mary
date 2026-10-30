# Painel › Cardápio com Supabase

## Objetivo

Fazer a tela "Gerenciar cardápio" (`/admin/cardapio`) listar, publicar/ocultar e excluir produtos no banco, trocando o `MenuStore` em memória.

## Contexto

A tela segue `specs/painel-admin-cardapio` e `specs/estados-tela-cardapio`. Hoje os dados vivem no `MenuStore` (Signals em memória), o salvamento é simulado com espera de 600 ms e a exclusão só remove da memória. A base técnica está em `specs/integracao-supabase-base` e o acesso ao painel em `specs/autenticacao-admin-supabase` (pelo RLS, só o admin lê produtos ocultos e grava).

Esta especificação **substitui** em `estados-tela-cardapio` o salvamento simulado (RN05) e os itens "persistência, backend e sincronização com a landing" e "estado de erro de salvamento" do fora de escopo. Layout, filtros, indicadores, modal e mensagens de sucesso continuam iguais.

## Regras de negócio

- RN01: Ao abrir a tela, o `MenuStore` carrega do banco, por `AdminMenuRepository`, todos os produtos (publicados e ocultos) ordenados por `ordem` e as categorias (para o filtro e os rótulos). A cada entrada na tela os dados são recarregados.
- RN02: Mapeamento do item: `id` (uuid) → `id`; `categoria_id` → `categoryId` (vazio sem categoria); `nome`, `descricao`, `publicado` → `name`, `description`, `published`; preço conforme a spec base; fotos de `produto_imagens` em ordem de `posicao` como URLs públicas (a primeira é a principal).
- RN03: Categoria do item é exibida pelo `rotulo`; produto sem categoria mostra "Sem categoria".
- RN04: Estado **carregando**: no lugar da lista, indicador girando e "Carregando cardápio…"; indicadores mostram "–". Estado **erro**: mensagem de carregamento da spec base e "Tentar de novo".
- RN05: Publicar/ocultar grava `produtos.publicado`. Durante a gravação valem os estados de salvamento já existentes; a chave só muda quando a gravação termina. Sucesso: mensagens já existentes.
- RN06: **Erro de gravação**: a chave permanece no valor anterior e aparece aviso vermelho com a mensagem de gravação da spec base, com o mesmo fechamento manual e automático do aviso de sucesso.
- RN07: "Sim, excluir" apaga o produto no banco (as linhas de `produto_imagens` saem em cascata) e depois remove os arquivos das fotos do bucket `produtos`. Durante a exclusão, os botões do modal ficam desabilitados e "Sim, excluir" mostra "Excluindo…". Sucesso: comportamento atual.
- RN08: Se apagar o produto falhar, o modal fecha, o produto continua na lista e aparece o aviso vermelho da RN06. Se só a remoção dos arquivos falhar, a exclusão é considerada bem-sucedida e o erro é apenas registrado no console.
- RN09: Busca e filtros continuam no cliente.

## Requisitos funcionais

- RF01: `AdminMenuRepository` com `listProducts()`, `listCategories()`, `setPublished(id, value)` e `deleteProduct(item)`, com implementação Supabase. (RN01, RN02, RN05, RN07, RN08)
- RF02: `MenuStore` com `state` (`loading | ready | error`), `items`, `categories` e `load()`. (RN01, RN04)
- RF03: `Cardapio` usa o store para carregar, gravar e excluir, com os estados das RN04–RN08. (RN03–RN08)

## Requisitos não funcionais

- RNF01: Sem atraso artificial: o estado de salvamento dura o tempo da gravação.
- RNF02: Aviso de erro em `role="alert"`; demais requisitos de acessibilidade de `estados-tela-cardapio` mantidos.
- RNF03: Testes unitários com repositório falso; implementação Supabase testada com `fetch` falso; Playwright com `/rest/v1` e `/storage/v1` simulados.
- RNF04: Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| CA01 | A lista mostra os produtos do banco, publicados e ocultos, com categoria, preço e foto principal; indicadores corretos.        |
| CA02 | O repositório mapeia linhas do banco para `MenuItem` e categorias (RN02, RN03), inclusive sem categoria, sem foto e sem preço. |
| CA03 | Enquanto carrega aparece "Carregando cardápio…"; com falha, a mensagem e "Tentar de novo", que recarrega.                      |
| CA04 | Alternar a chave grava `publicado`; sucesso atualiza o status e mostra a mensagem atual.                                       |
| CA05 | Falha ao gravar mantém a chave anterior e mostra o aviso vermelho de gravação.                                                 |
| CA06 | "Sim, excluir" mostra "Excluindo…", apaga no banco e remove os arquivos; sucesso atualiza a lista e mostra a mensagem atual.   |
| CA07 | Falha ao apagar mantém o produto e mostra o aviso vermelho; falha só nos arquivos conclui a exclusão.                          |
| CA08 | Cobertura ≥ 90%; testes, build e formatação passam.                                                                            |

## Casos de erro

| Caso                              | Tratamento esperado                                  |
| --------------------------------- | ---------------------------------------------------- |
| Sem internet ao abrir             | Estado de erro (RN04).                               |
| Sessão expirada / sem permissão   | Erro do banco tratado como falha (RN04, RN06, RN08). |
| Produto já apagado em outra aba   | A exclusão não encontra linha e conclui sem erro.    |
| Falha ao remover fotos do Storage | Registrada no console (RN08).                        |

## Fora de escopo

- Reordenar produtos, paginação, busca no servidor e Realtime.
- Desfazer exclusão.
- Formulário de produto (spec `formulario-produto-supabase`).
