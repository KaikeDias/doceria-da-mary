# Painel administrativo — estados da tela de cardápio

## Objetivo

Implementar os estados da tela "Gerenciar cardápio" (`/admin/cardapio`) desenhados nas novas referências: confirmação de exclusão, cardápio vazio, pesquisa sem resultados, salvamento em andamento e mensagem de sucesso.

## Contexto

A tela foi criada em `specs/painel-admin-cardapio`. Ela lista os produtos do catálogo demonstrativo com estado de publicação em memória, filtros, chave de publicação imediata (RN07 daquela spec), estado vazio genérico (RN09) e o menu "…" indisponível (RN08). Não existe backend: tudo vive em memória e reinicia a cada carga da página.

Esta especificação **substitui**, na spec de cardápio, a RN07 (a alternância passa a ter estado de salvamento), a RN09 (estado vazio) e a parte da RN08 referente ao "…" (passa a excluir). As demais regras continuam valendo.

### Referências visuais

| Arquivo em `public/design/cardapio/estados/` | Viewport      | Conteúdo de referência                                                                                            |
| -------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Estado — confirmação de exclusão@1x.png`    | 1440 × 900 px | Modal sobre a tela escurecida: ícone de lixeira, "Excluir Brownie Recheado?", texto, "Cancelar" e "Sim, excluir". |
| `Estado — lista vazia@1x.png`                | 1440 × 900 px | Indicadores "0" e "0 de 0", caixa tracejada com ícone de bolo, "Seu cardápio ainda está vazio" e botão.           |
| `Estado — pesquisa sem resultados@1x.png`    | 1440 × 900 px | Busca "pudim", ícone de lupa com ×, "Nenhum doce encontrado para “pudim”", texto e "Limpar filtros" contornado.   |
| `Estado — salvamento em andamento@1x.png`    | 1440 × 900 px | Chave do produto com indicador girando e "Salvando…"; aviso no canto inferior direito "Salvando alterações…".     |
| `Estado — mensagem de sucesso@1x.png`        | 1440 × 900 px | Aviso verde no canto inferior direito "Caixa de Docinhos agora aparece no site." com botão de fechar.             |

O texto "crie os testes dessa pagina" e o bloco de texto à direita da referência de lista vazia são ruído do arquivo de design e **não** devem ser reproduzidos.

### Decisões de escopo

- Não há referência de menu para o "…". Como excluir é a única ação disponível, o "…" abre diretamente a confirmação de exclusão. Quando houver outras ações, um menu substituirá esse atalho.
- Sem backend, o salvamento é simulado com uma espera curta antes de aplicar a mudança, para exibir o estado de salvamento. Marcado no código como `shortcut`.
- A exclusão é aplicada ao confirmar, sem estado de salvamento (não há referência para isso).
- Não há referências mobile dos estados; no mobile os mesmos estados seguem os padrões já existentes (cards, largura total).

## Regras de negócio

- RN01: O botão "…" de cada produto (tabela e card) abre um modal de confirmação com o título "Excluir {nome}?", o texto "Ele sai do cardápio e do site, e não dá para desfazer. Se quiser só tirar do site por um tempo, use o botão de status para ocultar." e os botões "Cancelar" e "Sim, excluir".
- RN02: "Cancelar", a tecla `Esc` e o clique no fundo escurecido fecham o modal sem excluir. "Sim, excluir" remove o produto da lista, fecha o modal, atualiza os indicadores e exibe a mensagem de sucesso "{nome} foi excluído do cardápio.".
- RN03: Cardápio vazio: quando não há nenhum produto (independente de filtros), exibir caixa tracejada com "Seu cardápio ainda está vazio", "Adicione o primeiro doce e ele já aparece no seu site para os clientes verem." e o botão "Adicionar primeiro produto", indisponível como "Adicionar produto" (RN08 da spec de cardápio). Indicadores mostram "0" e "0 de 0"; busca e filtros continuam visíveis.
- RN04: Pesquisa sem resultados: quando há produtos mas nenhum passa pelos filtros, exibir "Nenhum doce encontrado para “{busca}”" (busca sem espaços nas extremidades) e "Confira se o nome está escrito certinho ou limpe os filtros.". Sem texto de busca, o título é "Nenhum doce encontrado" e o texto "Ajuste os filtros para ver outros doces.". O botão contornado "Limpar filtros" restaura busca, categoria e status.
- RN05: Salvamento: ao alternar a chave de publicação, o produto entra em salvamento: a chave mostra um indicador girando, o rótulo vira "Salvando…" e aparece o aviso "Salvando alterações…". Durante o salvamento as chaves de publicação ficam desabilitadas. Ao terminar, o status, os indicadores e os filtros refletem a mudança (como a RN07 da spec de cardápio).
- RN06: Sucesso: ao terminar um salvamento, exibir o aviso verde "{nome} agora aparece no site." (publicado) ou "{nome} saiu do site." (oculto). O aviso fecha pelo botão × ou sozinho após 5 segundos. Uma nova mensagem substitui a anterior.

## Requisitos funcionais

- RF01: Implementar o modal de confirmação com `<dialog>` modal nativo, conforme a referência (ícone `LucideTrash2`, título em Cormorant Garamond, botões arredondados). (RN01, RN02)
- RF02: Trocar o "…" indisponível por um botão ativo com nome acessível "Excluir {nome}". (RN01)
- RF03: Implementar os estados de cardápio vazio (ícone `LucideCake`) e de pesquisa sem resultados (ícone `LucideSearchX`), substituindo o estado vazio atual. (RN03, RN04)
- RF04: Implementar o estado de salvamento na chave e o aviso "Salvando alterações…" com o `loading` do daisyUI. (RN05)
- RF05: Implementar o aviso de sucesso com `toast`/`alert` do daisyUI, ícone `LucideCircleCheck` e botão de fechar (`LucideX`). (RN02, RN06)
- RF06: Manter tudo em signals no componente `Cardapio`, sem alterar `catalog.ts`, a landing page ou outras telas do painel.

## Requisitos não funcionais

- RNF01: Sem novas dependências; apenas Angular, Tailwind/daisyUI e Lucide já instalados, sem CSS puro.
- RNF02: Preservar saída estática e hidratação; nenhum temporizador ou API de navegador executado durante o build.
- RNF03: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px, inclusive com modal e avisos abertos.
- RNF04: Acessibilidade: modal com nome (título) e descrição, foco inicial em "Cancelar" e retorno do foco ao fechar; avisos anunciados em região viva (`role="status"`); botão de fechar do aviso com nome; chave em salvamento com `aria-busy`; ícones decorativos ocultos; alvos ≥ 44 × 44 px no mobile.
- RNF05: Cada critério de aceitação com ao menos um teste automatizado; cada unidade implementada com pelo menos 90% de cobertura unitária (`AGENTS.md`).

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA01 | Clicar no "…" de "Brownie Recheado" abre o modal "Excluir Brownie Recheado?" com o texto da RN01, "Cancelar" focado e "Sim, excluir".                                          |
| CA02 | "Cancelar" e `Esc` fecham o modal sem remover o produto.                                                                                                                       |
| CA03 | "Sim, excluir" remove o produto, fecha o modal, atualiza "Total de produtos" e "Publicados no site" e exibe "Brownie Recheado foi excluído do cardápio.".                      |
| CA04 | Excluir todos os produtos exibe "Seu cardápio ainda está vazio", o texto da RN03, "Adicionar primeiro produto" indisponível e indicadores "0" e "0 de 0".                      |
| CA05 | Buscar "pudim" exibe "Nenhum doce encontrado para “pudim”" e o texto da RN04; sem busca e com filtro sem resultado, exibe "Nenhum doce encontrado"; "Limpar filtros" restaura. |
| CA06 | Alternar uma chave exibe "Salvando…" na chave, `aria-busy`, chaves desabilitadas e o aviso "Salvando alterações…"; o status só muda ao terminar.                               |
| CA07 | Ao terminar, aparece "{nome} agora aparece no site." ou "{nome} saiu do site."; o aviso fecha pelo × e sozinho após 5 segundos.                                                |
| CA08 | Em 320 e 1440 px, modal e avisos não causam rolagem horizontal; alvos têm ≥ 44 × 44 px no mobile.                                                                              |
| CA09 | Cada CA01–CA08 tem teste automatizado; cobertura ≥ 90% por unidade; testes existentes continuam passando; build estático e formatação passam.                                  |

## Casos de erro

| Caso                                          | Tratamento esperado                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Alternar outra chave durante um salvamento    | Impedido: chaves desabilitadas até o fim do salvamento (RN05).              |
| Fechar o modal sem confirmar                  | Nada é excluído (RN02).                                                     |
| Excluir um produto que está filtrado na lista | Removido da lista e dos indicadores; se a lista ficar sem resultados, RN04. |
| Recarregar a página                           | Produtos e publicação voltam ao estado inicial (sem persistência).          |

## Fora de escopo

- Menu "…" com várias ações, edição e criação de produtos.
- Desfazer exclusão, lixeira, persistência, backend e sincronização com a landing page.
- Estado de erro de salvamento (não há referência nem backend que possa falhar).
- Referências mobile específicas dos estados.
