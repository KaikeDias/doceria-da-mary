# Painel › Criar, editar e excluir categorias

## Objetivo

Liberar na tela `/admin/categorias` as ações "Adicionar categoria", "Editar" e "Excluir", com formulário em modal (nome, imagem, visibilidade e prévia), confirmação de exclusão e gravação no Supabase. A lista passa a mostrar a imagem de cada categoria.

## Contexto

A tela segue `specs/painel-admin-categorias` (layout) e `specs/categorias-admin-supabase` (dados do banco, chave de visibilidade, avisos). Nelas, adicionar, editar e excluir ficaram indisponíveis por falta de design. Os designs agora existem.

Esta especificação **substitui**:

- a RN07/CA05 de `categorias-admin-supabase` e a RN08 de `painel-admin-categorias` (ações indisponíveis) e o ícone fixo da lista;
- em `integracao-supabase-base`/`catalogo-publico-supabase`, o nome curto do chip diferente do rótulo dos cards e as imagens de categoria vindas de assets `images/…`.

O restante daquelas specs continua valendo.

Banco atual:

- `categorias`: `nome` (citext, único — chip da landing), `rotulo` (cards da landing e painel), `slug` (único — id do filtro na landing), `imagem_url` (asset `images/…` ou caminho no bucket `site`), `visivel`, `ordem`.
- `produtos.categoria_id` com `on delete set null`.
- Bucket `site`: público, JPG/PNG/WEBP, escrita só para admin.
- A landing já esconde a imagem do card de categoria quando ela está vazia.

### Referências visuais

| Arquivo em `public/design/categorias/`    | Conteúdo                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `Categorias@1x.png`                       | Lista desktop com miniatura da imagem (ou ícone quando não há imagem).            |
| `Categoria — nova (formulário)@1x.png`    | Modal "Nova categoria" vazio: área de arrastar/escolher imagem, prévia, chave.    |
| `Categoria — editar@1x.png`               | Modal "Editar categoria" com imagem, "Trocar imagem", aviso e "Excluir".          |
| `Categoria — erros de validação@1x.png`   | Nome duplicado e imagem acima de 2 MB.                                            |
| `Categoria — salvando@1x.png`             | Botão "Salvando…" com indicador.                                                  |
| `Categoria — confirmar exclusão@1x.png`   | Diálogo "Excluir a categoria Bolos?".                                             |
| `Categorias — mobile (lista)@1x.png`      | Cards com miniatura, "{n} produtos · Visível", chave e botões "Editar"/"Excluir". |
| `Categorias — mobile (formulário)@1x.png` | Formulário como painel inferior (bottom sheet) com rodapé fixo.                   |

Diferenças intencionais em relação aos designs: a imagem é obrigatória, então somem "(opcional)", "Remover imagem" e "Sem imagem, o site mostra só o nome."

## Regras de negócio

- RN01: **Um nome só por categoria.** O mesmo nome aparece no filtro (chip), nos cards da landing e no painel. Na migração, as categorias existentes ficam com o nome que o painel já mostra (`rotulo`): "Kits" passa a "Kits e presentes" no chip. Daqui em diante `nome` e `rotulo` são sempre gravados com o mesmo valor.
- RN02: **Só imagens cadastradas pela categoria.** As imagens estáticas `images/…` deixam de ser usadas: na migração, `imagem_url` que começa com `images/` vira nulo, e a landing e o painel só montam URL a partir do bucket `site`. Categoria sem imagem aparece na landing só com o nome (comportamento atual) e no painel com o ícone de etiqueta.
- RN03: "Adicionar categoria" abre o modal "Nova categoria" (subtítulo "Crie um grupo para organizar os doces no cardápio."). "Editar" abre "Editar categoria" (subtítulo "As mudanças aparecem no site assim que você salvar.") com os dados da categoria. O modal fecha pelo ×, "Cancelar", Esc ou clique no fundo, exceto durante a gravação, sem gravar nada.
- RN04: **Nome da categoria**: obrigatório, até 30 caracteres, com contador "{n}/30" e a ajuda "Curto e fácil de reconhecer. É o nome do filtro no cardápio.". Espaços nas pontas são ignorados.
- RN05: Erros de nome, mostrados ao salvar abaixo do campo, com o campo em vermelho: vazio → "Informe o nome da categoria."; igual ao de outra categoria (sem diferenciar maiúsculas) → "Já existe uma categoria com esse nome.". Se o banco recusar por nome ou slug duplicado, a mesma mensagem.
- RN06: **Imagem da categoria**: obrigatória, uma só, JPG, PNG ou WEBP de até 2 MB, por arrastar ou "Escolher imagem". Ajuda: "Quadrada, em JPG, PNG ou WEBP, até 2 MB.". Erros, abaixo da área: sem imagem ao salvar → "Escolha uma imagem para a categoria."; acima de 2 MB → "Essa imagem passa de 2 MB. Escolha uma foto menor."; outro tipo → "Envie uma imagem JPG, PNG ou WEBP."; o arquivo inválido é descartado. Com imagem, aparecem a miniatura e "Trocar imagem". Na edição de uma categoria ainda sem imagem, salvar exige escolher uma.
- RN07: Ao salvar com erros, o foco vai para o primeiro campo inválido (nome, depois imagem).
- RN08: **Como aparece no site**: prévia do card com a imagem (ou o ícone de etiqueta enquanto não houver), o nome digitado (ou "Nome da categoria" quando vazio) e "Explorar →", atualizada enquanto se digita.
- RN09: **Mostrar no site**: chave ligada por padrão na criação; na edição, o valor atual. Texto: "Aparece como filtro e no bloco “Encontre seu doce favorito”.".
- RN10: Na edição, com produtos, aparece o aviso "{n} produto(s) nesta categoria. Se você renomear, eles passam a aparecer com o novo nome." ("1 produto" / "{n} produtos").
- RN11: **Criar**: grava `nome` e `rotulo` com o nome digitado, `slug` gerado do nome (mesma regra dos produtos; sufixo `-2`, `-3`… se existir), `visivel` da chave e `ordem` = maior `ordem` + 1. Depois envia a imagem para `site/categorias/<id>/<uuid>.<extensão>` e grava o caminho em `imagem_url`.
- RN12: **Editar**: se o nome mudou, grava `nome` e `rotulo`; `slug` e `ordem` não mudam. Grava `visivel` se mudou. Imagem nova: envia, grava o caminho e apaga o arquivo anterior do bucket. Falha ao apagar arquivo antigo só é registrada no console.
- RN13: Se a gravação dos dados der certo mas o envio da imagem falhar, a categoria fica salva sem a imagem nova e a mensagem de sucesso ganha " A imagem não foi enviada.".
- RN14: Durante a gravação, campos, imagem, chave e botões ficam bloqueados e o botão principal mostra o indicador e "Salvando…".
- RN15: Sucesso: o modal fecha, a lista recarrega do banco e aparece o aviso verde "{nome} foi adicionada às categorias." ou "Alterações em {nome} salvas.". Falha (exceto duplicidade, RN05): o modal continua aberto com os dados, e aparece acima do rodapé o aviso vermelho com a mensagem de gravação da spec base.
- RN16: **Excluir** pelo botão da lista ou por "Excluir categoria" no modal de edição. Produtos ativos são os publicados (`produtos.publicado = true`) daquela categoria, contados a partir dos produtos que o painel já carrega.
- RN17: **Com produtos ativos, a exclusão é bloqueada**: abre o diálogo "Não é possível excluir {nome}" com o texto "Ela tem {n} produto(s) ativo(s) no cardápio. Mude a categoria deles ou oculte-os antes de excluir." e só o botão "Entendi". Nada é gravado.
- RN18: **Sem produtos ativos**, abre a confirmação "Excluir a categoria {nome}?" com o texto "Ela tem {n} produto(s) oculto(s). Os doces continuam salvos, mas ficam sem categoria até você escolher outra para eles." — ou, sem nenhum produto, "Ela não tem produtos. Essa ação não dá para desfazer." — e os botões "Cancelar" e "Sim, excluir" ("Excluindo…" durante a gravação).
- RN19: Confirmada a exclusão: apaga a linha (os produtos ocultos ficam sem categoria pelo banco), apaga a imagem do bucket, fecha os diálogos, recarrega a lista e mostra "{nome} foi excluída.". Falha: o diálogo fecha e aparece o aviso vermelho de gravação; nada muda na lista.
- RN20: **Lista**: cada categoria mostra a miniatura da imagem ou, sem imagem, o ícone de etiqueta atual. No mobile (< 1024 px), o card mostra miniatura, nome, "{contagem} · Visível/Oculta", a chave e os botões "Editar" e "Excluir" com texto, como na referência.
- RN21: Mobile: o formulário abre como painel inferior que sobe da borda de baixo da tela e desce ao fechar, com o fundo escuro aparecendo e sumindo junto (transição de 300 ms; sem transição com "reduzir movimento" e no desktop), com conteúdo rolável e rodapé fixo ("Cancelar" e o botão principal); "Excluir categoria" fica no fim do conteúdo.

## Requisitos funcionais

- RF01: Migration nova: `update categorias set nome = rotulo`; `imagem_url = null` onde começa com `images/`. (RN01, RN02)
- RF02: `categoryImageUrl` passa a montar só a URL do bucket `site` (vazia para nulo); o catálogo público usa `rotulo` também como `name` do chip. (RN01, RN02)
- RF03: `AdminCategory` ganha `image` (URL pública, vazia sem imagem); `listCategories()` lê `imagem_url` da view. (RN20)
- RF04: `AdminMenuRepository.saveCategory(input, existing?)` e `deleteCategory(category)` com as RN11–RN13 e RN19; erro de unicidade (`23505`) vira um erro reconhecível pela tela. Reaproveitar `slugify` e o padrão de `uniqueSlug`/`removeFiles` dos produtos, parametrizados por tabela/bucket. (RN05, RN11–RN13, RN19)
- RF05: `MenuStore` expõe `saveCategory`, `deleteCategory` e a contagem de produtos ativos por categoria; recarrega depois de gravar. (RN15–RN19)
- RF06: Componente do formulário em `<dialog>` (padrão do diálogo de exclusão do cardápio), aberto pela tela `Categorias`, com validação em signals, upload com arrastar/escolher, prévia e chave. (RN03–RN10, RN14, RN15, RN21)
- RF07: Diálogos de bloqueio e de confirmação de exclusão em `Categorias`, acionáveis pela lista e pelo formulário. (RN16–RN19)
- RF08: Lista desktop e cards mobile atualizados. (RN20)

## Requisitos não funcionais

- RNF01: Sem dependências novas; Tailwind/daisyUI e Lucide já instalados. A migration só altera dados, sem mudar tabelas nem views.
- RNF02: Acessibilidade: diálogos com `aria-labelledby`/`aria-describedby`, foco preso no modal e devolvido ao botão que abriu; campos com erro em `aria-invalid` e mensagem ligada por `aria-describedby`; chave com `role="switch"`; alvos ≥ 44 × 44 px no mobile.
- RNF03: URL `blob:` da imagem escolhida revogada ao trocar a imagem ou quando o modal termina de fechar.
- RNF04: Testes unitários com repositório falso; implementação Supabase com `fetch` falso; Playwright com `/rest/v1` e `/storage/v1` simulados. Cobertura ≥ 90% por unidade alterada.
- RNF05: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | "Adicionar categoria" abre o modal vazio com chave ligada e prévia "Nome da categoria"; ×, Cancelar e Esc fecham sem gravar.                                                                                           |
| CA02 | Salvar sem nome mostra "Informe o nome da categoria."; "bolos" com "Bolos" existente mostra "Já existe uma categoria com esse nome."; o contador e o limite de 30 funcionam.                                           |
| CA03 | Salvar sem imagem mostra "Escolha uma imagem para a categoria."; imagem de 3 MB mostra "Essa imagem passa de 2 MB. Escolha uma foto menor."; GIF mostra "Envie uma imagem JPG, PNG ou WEBP.".                          |
| CA04 | Criar "Datas comemorativas" com imagem grava `nome` e `rotulo` iguais, slug `datas-comemorativas`, `ordem` no fim, envia a imagem ao bucket `site` e mostra a categoria com a miniatura e o aviso.                     |
| CA05 | Editar abre com nome, imagem, chave e aviso de produtos; renomear grava `nome` e `rotulo` sem mudar o slug; trocar a imagem apaga o arquivo anterior do bucket.                                                        |
| CA06 | Durante a gravação aparece "Salvando…" e tudo fica bloqueado; falha mantém o modal aberto com os dados e o aviso vermelho; falha no envio da imagem salva o resto e avisa.                                             |
| CA07 | Excluir categoria com produto publicado abre "Não é possível excluir {nome}" com a contagem e não grava nada.                                                                                                          |
| CA08 | Excluir categoria sem produtos publicados mostra a confirmação (com ou sem produtos ocultos); "Sim, excluir" remove, recarrega e mostra "{nome} foi excluída."; Cancelar não muda nada; falha mostra o aviso vermelho. |
| CA09 | A lista mostra a miniatura ou o ícone sem imagem; landing e painel ignoram `images/…`; o chip da landing usa o mesmo nome dos cards.                                                                                   |
| CA10 | Em 390 px os cards seguem a referência mobile e o formulário abre como painel inferior com rodapé fixo; acessibilidade de RNF02 e sem rolagem horizontal (RNF05).                                                      |
| CA11 | Cobertura ≥ 90% por unidade; testes unitários, Playwright, build e formatação passam.                                                                                                                                  |

## Casos de erro

| Caso                                            | Tratamento esperado                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Sem internet ao salvar ou excluir               | Aviso vermelho de gravação (RN15, RN19).                                                       |
| Nome duplicado detectado só pelo banco          | Erro de nome (RN05).                                                                           |
| Storage recusa a imagem                         | Categoria salva sem a imagem nova (RN13).                                                      |
| Falha ao apagar arquivo antigo                  | Só registro no console (RN12).                                                                 |
| Produto publicado em outra aba antes de excluir | Não bloqueado: a verificação usa os produtos carregados na tela. O produto fica sem categoria. |
| Sessão expirada                                 | Tratada como falha de gravação.                                                                |

## Fora de escopo

- Remover a coluna `rotulo` do banco (continua existindo, sempre igual a `nome`).
- Bloqueio de exclusão no banco (trigger); a regra é aplicada pelo painel.
- Reordenar categorias.
- Recortar, redimensionar ou comprimir a imagem.
- Mover produtos para outra categoria ao excluir.
- Aviso de alterações não salvas.
- Apagar os arquivos estáticos `public/images/…` do repositório (continuam usados pelos produtos ou ficam sem uso).
