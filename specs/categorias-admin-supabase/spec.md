# Painel › Categorias com Supabase

## Objetivo

Fazer a tela de Categorias (`/admin/categorias`) listar as categorias do banco com a contagem de produtos e gravar o mostrar/ocultar.

## Contexto

A tela segue `specs/painel-admin-categorias`: lista fixa em memória, contagem calculada a partir de `catalog.ts`, chave "Visível/Oculta" que muda na hora e ações de adicionar, editar e excluir indisponíveis. A base técnica está em `specs/integracao-supabase-base`; o acesso em `specs/autenticacao-admin-supabase`; o `MenuStore` com categorias do banco em `specs/cardapio-admin-supabase`.

Esta especificação **substitui** a origem dos dados e o comportamento imediato da chave daquela spec. Layout e ações indisponíveis continuam iguais.

## Regras de negócio

- RN01: Ao abrir a tela, as categorias vêm da view `categorias_com_contagem`, ordenadas por `ordem`, recarregadas a cada entrada. O nome exibido é o `rotulo`.
- RN02: A coluna "Produtos" usa `total_produtos` do banco: "Nenhum produto", "1 produto" ou "{n} produtos".
- RN03: Estados de carregando e erro iguais aos do cardápio, com o texto "Carregando categorias…".
- RN04: Mostrar/ocultar grava `categorias.visivel`. Durante a gravação, a chave mostra o indicador girando e "Salvando…", todas as chaves ficam desabilitadas e aparece o aviso "Salvando alterações…". A chave só muda quando a gravação termina.
- RN05: Sucesso: aviso verde "{nome} agora aparece no site." ou "{nome} saiu do site.". Erro: chave anterior mantida e aviso vermelho com a mensagem de gravação da spec base. Avisos fecham pelo × ou após 5 segundos.
- RN06: Ocultar uma categoria tira o chip e os produtos dela da landing (regra D2, aplicada pelo banco).
- RN07: Adicionar, editar e excluir continuam indisponíveis.

## Requisitos funcionais

- RF01: `AdminMenuRepository.listCategories()` passa a ler `categorias_com_contagem` e devolver `{ id, name, visible, productCount }`; novo `setCategoryVisible(id, value)`. (RN01, RN02, RN04)
- RF02: `Categorias` usa o `MenuStore` para carregar e grava pela chave, com estados e avisos. (RN03–RN05)

## Requisitos não funcionais

- RNF01: Acessibilidade igual à do cardápio: `aria-busy` na chave em gravação, avisos em `role="status"`/`role="alert"`, botão de fechar com nome.
- RNF02: Testes unitários com repositório falso; Playwright com `/rest/v1` simulado.
- RNF03: Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| CA01 | A tela lista as categorias do banco com rótulo, contagem e status, inclusive as ocultas.                           |
| CA02 | Enquanto carrega aparece "Carregando categorias…"; com falha, a mensagem e "Tentar de novo".                       |
| CA03 | Alternar a chave mostra "Salvando…", grava `visivel` e, com sucesso, muda o status e mostra a mensagem de sucesso. |
| CA04 | Falha ao gravar mantém o status anterior e mostra o aviso vermelho.                                                |
| CA05 | Adicionar, editar e excluir continuam indisponíveis.                                                               |
| CA06 | Cobertura ≥ 90%; testes, build e formatação passam.                                                                |

## Casos de erro

| Caso                            | Tratamento esperado       |
| ------------------------------- | ------------------------- |
| Sem internet ao abrir           | Estado de erro (RN03).    |
| Sessão expirada / sem permissão | Falha de gravação (RN05). |

## Fora de escopo

- Adicionar, editar, excluir e reordenar categorias.
- Editar rótulo e imagem da categoria no painel.
