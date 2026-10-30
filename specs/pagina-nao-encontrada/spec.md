# Página não encontrada

## Objetivo

Exibir uma página "não encontrada" em qualquer endereço que não exista, em vez de uma tela em branco.

## Contexto

`app.routes.ts` não tem rota coringa. Um endereço inexistente (ex.: `/produtos`) faz o roteador lançar `NG04002` e a página fica em branco. A hospedagem estática devolve 200 com o `index.csr.html`, então buscadores podem tratar esses endereços como páginas vazias válidas ("soft 404").

## Regras de negócio

- RN01: Todo caminho sem rota correspondente mostra a página "não encontrada", sem redirecionar e mantendo o endereço digitado.
- RN02: A página tem o título de aba "Página não encontrada | Doceria da Mary", um título visível, um texto curto e um link para a página inicial (`/`).
- RN03: Enquanto a página estiver aberta, o documento tem `<meta name="robots" content="noindex">`; ao sair dela, a meta é removida.
- RN04: Visual com a mesma fonte e cores da landing; sem chamada ao banco.

## Requisitos funcionais

- RF01: Rota `**` no fim de `routes`, carregada sob demanda. (RN01, RN02)
- RF02: Componente `NotFound` que adiciona e remove a meta `robots` pelo serviço `Meta`. (RN03)

## Requisitos não funcionais

- RNF01: Sem dependências novas; a rota continua em `RenderMode.Client` (`app.routes.server.ts` já cobre `**`).
- RNF02: Cobertura ≥ 90% das unidades novas.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------- |
| CA01 | Navegar para `/caminho-que-nao-existe` mostra a página "não encontrada" com link para `/`, sem erro.     |
| CA02 | O título da aba é "Página não encontrada \| Doceria da Mary".                                            |
| CA03 | Com a página aberta existe `meta[name=robots][content=noindex]`; depois de destruída, a meta não existe. |
| CA04 | As rotas existentes (`/`, `/login`, `/admin/**`) continuam resolvendo para seus componentes.             |

## Casos de erro

| Caso                                       | Tratamento esperado                                 |
| ------------------------------------------ | --------------------------------------------------- |
| Caminho inexistente dentro de `/admin/...` | Mesma página (após a guarda de admin, como hoje).   |
| Hospedagem devolve 200 para o caminho      | Fora do app: depende da configuração da hospedagem. |

## Fora de escopo

- Status HTTP 404 real: depende da hospedagem, que ainda não foi escolhida (ver pendências em `tasks.md`).
- Sugestões de produtos ou busca na página.
