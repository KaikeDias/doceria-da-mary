# Painel › Novo/Editar produto com Supabase

## Objetivo

Fazer o formulário de produto (`/admin/cardapio/novo` e `/admin/cardapio/{id}/editar`) gravar no banco e enviar as fotos para o Storage.

## Contexto

O formulário segue `specs/formulario-produto-cardapio`: validação com signals, até 5 fotos guardadas como URLs `blob:` locais, prévia e gravação no `MenuStore` em memória. A base técnica está em `specs/integracao-supabase-base`, o acesso em `specs/autenticacao-admin-supabase` e o `MenuStore` com dados do banco em `specs/cardapio-admin-supabase`.

Esta especificação **substitui** em `formulario-produto-cardapio` a RN12 (gravação), a origem das categorias (RN05), a parte "apenas arquivos de imagem" da RN09 e a pré-renderização das rotas (RF02). Layout, validação, prévia e mensagens de sucesso continuam iguais.

## Regras de negócio

- RN01: As duas rotas só abrem depois de carregar produtos e categorias do banco. Falha na carga ou `{id}` inexistente redireciona para `/admin/cardapio`, que mostra seu próprio estado.
- RN02: O `select` de categoria lista as categorias do banco (rótulo), inclusive as ocultas.
- RN03: Fotos aceitas: JPG, PNG ou WEBP de até 5 MB (limites do bucket `produtos`). Outros arquivos são ignorados com o aviso "Envie fotos JPG, PNG ou WEBP de até 5 MB.". O limite de 5 fotos continua.
- RN04: **Novo produto**: o `slug` é gerado do nome (minúsculas, sem acentos, palavras separadas por hífen; vazio vira `produto`) com sufixo `-2`, `-3`… se já existir. O produto é inserido com `publicado = true` e `ordem` = maior `ordem` + 1.
- RN05: **Edição**: grava só os campos que mudaram entre nome, categoria, descrição (vazia vira nula) e preço; o `slug`, a `ordem` e a publicação não mudam.
- RN06: **Fotos**, depois de gravar o produto: as fotos novas são enviadas para `produtos/<id do produto>/<uuid>.<extensão>`; as linhas de `produto_imagens` do produto são recriadas na ordem do formulário (posição 0 = principal, `alt` = nome); os arquivos das fotos removidas são apagados do Storage. Quando nada mudou nas fotos, nenhuma dessas etapas roda.
- RN07: Se o produto for gravado mas alguma foto não for enviada, o produto fica salvo sem ela e a mensagem de sucesso ganha " {n} foto(s) não foi/foram enviada(s)." — "1 foto não foi enviada." ou "{n} fotos não foram enviadas.". Falha ao apagar arquivos removidos só é registrada no console.
- RN08: Durante a gravação o formulário fica bloqueado (campos, fotos e botões) e o botão principal mostra "Salvando…".
- RN09: Se gravar o produto (ou recriar as linhas de imagem) falhar, o formulário volta a ficar editável, os dados são mantidos e aparece, acima do rodapé, o aviso vermelho com a mensagem de gravação da spec base.
- RN10: Com sucesso, volta para `/admin/cardapio` com a mensagem atual de sucesso (RN12 da spec original), e a lista recarrega do banco.
- RN11: As validações continuam as mesmas; o banco também impõe nome ≤ 80, descrição ≤ 300 e preço ≤ 99.999,99.

## Requisitos funcionais

- RF01: `AdminMenuRepository.saveProduct(input, existing?)` com as etapas das RN04–RN07, devolvendo o id e o número de fotos não enviadas. (RN04–RN07)
- RF02: Guard `menuReady` nas duas rotas do formulário, carregando o `MenuStore`. (RN01)
- RF03: `ProdutoForm` com categorias do store, validação de tipo/tamanho, gravação assíncrona, bloqueio e aviso de erro. (RN02, RN03, RN08–RN10)

## Requisitos não funcionais

- RNF01: O formulário guarda os arquivos novos em memória (`File`) só até a gravação; as URLs `blob:` são revogadas ao remover a foto.
- RNF02: Aviso de erro em `role="alert"`; formulário bloqueado com `aria-busy`.
- RNF03: Testes unitários com repositório falso; implementação Supabase testada com `fetch` falso; Playwright com `/rest/v1` e `/storage/v1` simulados.
- RNF04: Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Novo produto válido com 3 fotos insere o produto publicado no fim da lista, envia as 3 fotos, cria as linhas com posições 0–2 e volta com a mensagem atual. |
| CA02 | Nome "Pão de Mel" gera `pao-de-mel`; se já existirem `pao-de-mel` e `pao-de-mel-2`, gera `pao-de-mel-3`.                                                    |
| CA03 | A edição abre com os dados do banco; salvar grava só os campos alterados e mantém slug, ordem e publicação.                                                 |
| CA04 | Na edição, remover uma foto e tornar outra principal recria as linhas na nova ordem e apaga o arquivo removido.                                             |
| CA05 | Falha no envio de uma foto salva o produto e mostra "… 1 foto não foi enviada.".                                                                            |
| CA06 | Durante a gravação aparece "Salvando…" e o formulário fica bloqueado; falha ao gravar mostra o aviso vermelho e mantém os dados.                            |
| CA07 | Arquivo GIF ou acima de 5 MB é ignorado com "Envie fotos JPG, PNG ou WEBP de até 5 MB.".                                                                    |
| CA08 | `{id}` inexistente ou falha na carga redireciona para `/admin/cardapio`; o `select` lista as categorias do banco.                                           |
| CA09 | Cobertura ≥ 90%; testes, build e formatação passam.                                                                                                         |

## Casos de erro

| Caso                                  | Tratamento esperado                                           |
| ------------------------------------- | ------------------------------------------------------------- |
| Sem internet ao salvar                | RN09.                                                         |
| Foto rejeitada pelo Storage           | Contada como não enviada (RN07).                              |
| Falha ao recriar as linhas de imagem  | RN09 (o produto já está salvo; um novo envio refaz as fotos). |
| Slug duplicado por corrida entre abas | Erro de gravação (RN09); um novo envio gera outro sufixo.     |

## Fora de escopo

- Editar `detalhes`, observação de preço e "Bom saber" no painel.
- Reordenar fotos arrastando, recortar ou comprimir imagens.
- Aviso de alterações não salvas.
