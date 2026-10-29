# Painel administrativo — criação e edição de produtos do cardápio

## Objetivo

Permitir criar e editar produtos do cardápio no painel administrativo, com formulário de informações básicas, imagens e prévia do card no site, reproduzindo as referências de `public/design/cardapio/formulario/`.

## Contexto

A tela `/admin/cardapio` (`specs/painel-admin-cardapio` e `specs/estados-tela-cardapio`) lista os produtos a partir de um estado em memória do próprio componente, com publicação, exclusão e estados. "Adicionar produto", "Adicionar primeiro produto" e "Editar" estão indisponíveis.

Não há backend nem banco de dados. Por decisão do usuário, os dados continuam hardcoded: o catálogo demonstrativo de `src/app/features/catalog/catalog.ts` é o ponto de partida e as alterações vivem somente em memória, reiniciando a cada carga da página.

### Referências visuais

| Arquivo em `public/design/cardapio/formulario/` | Viewport      | Conteúdo de referência                                                                                                   |
| ----------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Produto — novo (desktop)@1x.png`               | 1440 × 900 px | Trilha "Cardápio > Adicionar produto", "Novo produto", card "Informações básicas", início de "Imagens", prévia e rodapé. |
| `Produto — editar (desktop)@1x.png`             | 1440 × 900 px | Mesmo formulário preenchido com "Bolo de Chocolate", "A partir de" marcado, prévia com foto e botão "Salvar alterações". |
| `Produto — novo (mobile)@1x.png`                | 390 × 844 px  | Barra com voltar e trilha, formulário em coluna única, rodapé fixo com "Cancelar" e "Salvar produto".                    |
| `Produto — mobile, prévia aberta@1x.png`        | 390 × 844 px  | Formulário mobile preenchido (a prévia em si não aparece na captura).                                                    |

As referências cortam a seção "Imagens" logo após "Arraste as fotos do doce para cá" e não mostram a prévia no mobile. O comportamento dessas partes é definido nas regras abaixo.

### Decisões de escopo

- O estado dos produtos passa do componente `Cardapio` para um serviço em memória compartilhado (`MenuStore`), para que lista e formulário vejam as mesmas alterações durante a navegação.
- As fotos enviadas ficam somente no navegador (URL temporária do arquivo) e somem ao recarregar.
- O produto criado entra publicado, como diz o estado vazio ("ele já aparece no seu site").
- As alterações **não** afetam a landing page nesta entrega.
- No mobile, a barra superior do painel (menu) continua visível; a trilha com o botão voltar fica logo abaixo dela.
- No mobile, a prévia fica num bloco recolhível "Prévia no site" abaixo do formulário, fechado por padrão.

## Regras de negócio

- RN01: Rotas: `/admin/cardapio/novo` (título "Novo produto | Painel Doceria da Mary") e `/admin/cardapio/{id}/editar` (título "Editar produto | Painel Doceria da Mary"). "Cardápio" continua ativo no menu. Um `{id}` inexistente redireciona para `/admin/cardapio`.
- RN02: "Adicionar produto" e "Adicionar primeiro produto" levam a `/admin/cardapio/novo`; "Editar" de cada produto leva à sua edição. Deixam de ser indisponíveis.
- RN03: Cabeçalho: trilha "Cardápio > Adicionar produto" ou "Cardápio > Editar produto" (o primeiro item volta para a lista), título "Novo produto" ou "Editar produto" e subtítulo "Preencha as informações que aparecerão no cardápio.". No mobile, um botão voltar ("Voltar ao cardápio") antecede a trilha.
- RN04: Nome do produto: obrigatório; espaços nas extremidades são descartados; até 80 caracteres. Sem nome, ao salvar, exibe "Informe o nome do produto." e o foco vai para o campo.
- RN05: Categoria: obrigatória, entre as categorias do catálogo, com a opção inicial "Escolha uma categoria". Sem categoria, ao salvar, exibe "Escolha uma categoria." e o foco vai para o campo (se o nome estiver válido).
- RN06: Descrição: opcional, até 300 caracteres, com o contador "{n}/300".
- RN07: Preço em reais: opcional. Aceita números com até 5 dígitos inteiros e até duas casas decimais, com vírgula ou ponto (ex.: "85", "85,5", "85,00"); o máximo é 99.999,99, evitando valores absurdos. Enquanto se digita, o campo descarta letras, dígitos além do 5º inteiro e casas além da 2ª decimal. Vazio significa "Sob consulta". Valor inválido, zero ou acima do máximo exibe "Informe um preço válido de até 99.999,99, como 85,00." ao salvar. Texto de apoio: "Sem preço, o site mostra “Sob consulta”.".
- RN08: "Exibir preço como “A partir de”" (com o texto "Para doces cujo valor muda com tamanho ou sabor.") só fica habilitado quando há preço; sem preço, fica desabilitado e é ignorado.
- RN09: Imagens: até 5 fotos, com o texto "Até 5 fotos. A imagem principal é a que aparece no cardápio.". As fotos entram arrastando para a área "Arraste as fotos do doce para cá" ou pelo botão "Escolher fotos". Apenas arquivos de imagem são aceitos; os demais são ignorados com o aviso "Só dá para enviar imagens.". Acima de 5, as excedentes são ignoradas com o aviso "Você pode enviar até 5 fotos.". A primeira foto é a principal (selo "Principal"); cada foto pode ser removida ou definida como principal. Fotos são opcionais.
- RN10: Prévia no site: card com a foto principal (ou um espaço com ícone de imagem), o rótulo da categoria (ou "Categoria"), o nome (ou "Nome do doce"), a descrição em até duas linhas (ou "A descrição do doce aparece aqui."), o preço ("Sob consulta", "R$ 18,00" ou "A partir de R$ 85,00") e "Pedir no WhatsApp" ilustrativo (não é link). Atualiza enquanto o formulário é preenchido. Texto de apoio: "A prévia atualiza enquanto você preenche. O botão do WhatsApp é ilustrativo.".
- RN11: Rodapé fixo com "Cancelar" e "Salvar produto" (novo) ou "Salvar alterações" (edição). "Cancelar" volta para `/admin/cardapio` sem salvar.
- RN12: Salvar com dados válidos grava no estado em memória e volta para `/admin/cardapio`, exibindo o aviso de sucesso "{nome} foi adicionado ao cardápio." (novo, ao final da lista e publicado) ou "Alterações em {nome} salvas." (edição, mantendo posição e status de publicação).
- RN13: A edição abre com os dados atuais do produto: nome, categoria, descrição, preço, "A partir de" e fotos.
- RN14: Na lista do cardápio, produto sem preço mostra "Sob consulta" no lugar do preço, e produto sem foto usa o fundo neutro já existente.

## Requisitos funcionais

- RF01: Criar `MenuStore` (serviço raiz, signals) com os produtos do painel inicializados do catálogo (mesmo estado inicial de publicação) e uma mensagem pendente para a lista; adaptar `Cardapio` para usá-lo, sem mudar seu comportamento. (RN12, RN14)
- RF02: Criar a página standalone/OnPush `ProdutoForm` atendendo às duas rotas, carregada sob demanda, com pré-renderização de `novo` e das edições dos produtos do catálogo. (RN01, RN13)
- RF03: Implementar o card "Informações básicas" com validação ao salvar, mensagens associadas aos campos e contador. (RN04–RN08)
- RF04: Implementar o card "Imagens" com área de soltar, botão de escolha, miniaturas e ações. (RN09)
- RF05: Implementar a prévia (coluna à direita no desktop, bloco recolhível no mobile). (RN10)
- RF06: Implementar trilha, cabeçalho e rodapé fixo. (RN03, RN11)
- RF07: Ativar os botões da lista (RN02) e exibir "Sob consulta" (RN14).
- RF08: Usar Tailwind/daisyUI, Lucide já instalado e o tema existente; sem CSS puro. Não alterar `catalog.ts` nem a landing page.

## Requisitos não funcionais

- RNF01: Sem novas dependências (inclusive `@angular/forms`); formulário com signals e elementos nativos.
- RNF02: Preservar saída estática e hidratação; nenhuma API de navegador durante o build.
- RNF03: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px; o rodapé fixo não cobre o último campo.
- RNF04: Acessibilidade: um `h1`; `nav` "Trilha" com `aria-current` no item atual; rótulos associados; erros ligados por `aria-describedby` e `aria-invalid`; avisos de imagem em região viva; área de soltar operável pelo botão; miniaturas com nome acessível nas ações; foco visível; alvos ≥ 44 × 44 px no mobile.
- RNF05: Cada critério de aceitação com ao menos um teste automatizado; cada unidade implementada com pelo menos 90% de cobertura unitária (`AGENTS.md`).

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | "Adicionar produto" leva a `/admin/cardapio/novo` com título, trilha e "Novo produto"; "Editar" de "Bolo de Chocolate" leva a `/admin/cardapio/bolo-chocolate/editar`.                                                    |
| CA02 | A edição abre preenchida (nome, categoria "Bolos", descrição, "85,00", "A partir de" marcado, foto) e o botão diz "Salvar alterações"; `{id}` inexistente volta à lista.                                                  |
| CA03 | Salvar sem nome mostra "Informe o nome do produto."; sem categoria mostra "Escolha uma categoria."; preço "0" ou ",5" mostra a mensagem de preço; o campo não aceita mais de 5 dígitos inteiros nem letras; nada é salvo. |
| CA04 | O contador da descrição mostra "{n}/300" e o campo não passa de 300 caracteres; "A partir de" fica desabilitado sem preço.                                                                                                |
| CA05 | A prévia mostra os textos padrão no início e reflete nome, categoria, descrição, preço ("Sob consulta", fixo ou "A partir de") e foto principal enquanto se preenche.                                                     |
| CA06 | Imagens: escolher ou soltar fotos adiciona miniaturas; a primeira é "Principal"; remover e definir como principal funcionam; não imagens e excedentes de 5 geram aviso.                                                   |
| CA07 | Salvar um produto novo volta à lista com ele publicado ao final, indicadores atualizados e o aviso "{nome} foi adicionado ao cardápio."                                                                                   |
| CA08 | Salvar uma edição volta à lista com os dados novos na mesma posição e status, e o aviso "Alterações em {nome} salvas."; "Cancelar" volta sem alterar nada.                                                                |
| CA09 | Produto sem preço aparece como "Sob consulta" na lista; a landing page não muda.                                                                                                                                          |
| CA10 | Em 390 × 844 px, o formulário segue a referência mobile (coluna única, voltar, rodapé fixo, prévia recolhível); sem rolagem horizontal em 320–1440 px; alvos ≥ 44 px.                                                     |
| CA11 | Semântica: `h1`, trilha nomeada, rótulos, `aria-invalid`/`aria-describedby` nos erros, região viva dos avisos de imagem e foco visível.                                                                                   |
| CA12 | Cada CA01–CA11 tem teste; cobertura ≥ 90% por unidade; testes existentes passam; build estático gera `novo` e as edições do catálogo; formatação passa.                                                                   |

## Casos de erro

| Caso                                         | Tratamento esperado                                                         |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| Campos obrigatórios vazios ou preço inválido | Mensagens da RN04, RN05 e RN07; foco no primeiro campo inválido; não salva. |
| Arquivo que não é imagem                     | Ignorado, com aviso (RN09).                                                 |
| Mais de 5 fotos                              | Excedentes ignoradas, com aviso (RN09).                                     |
| Edição de produto inexistente                | Redireciona para `/admin/cardapio` (RN01).                                  |
| Recarregar a página                          | Produtos, fotos enviadas e alterações voltam ao estado inicial.             |

## Fora de escopo

- Backend, banco de dados, arquivos JSON gravados em disco, upload real de imagens e sincronização com a landing page.
- Campos que o formulário de referência não mostra (detalhes, informações adicionais, observação de preço).
- Reordenar fotos por arrastar, recortar ou comprimir imagens.
- Aviso de alterações não salvas ao sair do formulário.
