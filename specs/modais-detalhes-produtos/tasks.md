# Tarefas — Modais de detalhes dos produtos

## Referência e estado

Especificação: `specs/modais-detalhes-produtos/spec.md`.

As tarefas abaixo pertencem exclusivamente a esta funcionalidade. Implementação e validação concluídas em 2026-10-29, com as alternativas de conteúdo previstas na especificação.

## Tarefas de implementação

- [x] I01 — Estender o modelo local de produto com descrição complementar, fotos adicionais, observação de preço variável e informações opcionais de “Bom saber”, mantendo compatibilidade com os seis produtos e preço em centavos. Usar dados existentes como alternativa e não condicionar galeria/informações ao tipo de preço. (CA01–CA04)
- [x] I02 — Cadastrar as descrições demonstrativas completas do bolo de chocolate e do brownie a partir dos designs, preservando os textos curtos nos cards. Inventariar as fotos disponíveis; utilizar imagem única enquanto não houver fotos adicionais adequadas e registrar essa limitação. Não cadastrar antecedência, conservação ou alérgenos como dados reais sem confirmação. (CA01, CA03–CA06)
- [x] I03 — Adicionar acionadores semânticos na foto e no nome de cada card; integrar seleção/abertura na página e preservar o CTA direto de WhatsApp, filtros e contexto do catálogo. Não aninhar controles interativos. (CA01, CA08, CA10)
- [x] I04 — Criar o diálogo reutilizável com conteúdo do produto, semântica acessível, regras de preço fixo/variável, informações opcionais, tratamento de imagem indisponível e CTA contextual centralizado. (CA02, CA04, CA09–CA10)
- [x] I05 — Implementar galeria: foto inicial, miniaturas, seleção acessível, contador, setas desktop com ciclo e reinício a cada abertura; ocultar controles com uma foto. (CA03–CA04, CA10)
- [x] I06 — Implementar abertura/fechamento por botão, `Escape` e fundo externo, foco inicial e contido, isolamento do fundo, bloqueio/restauração de rolagem e retorno do foco com alternativa no cardápio. Restringir operações do navegador ao ciclo apropriado. (CA08, CA10–CA11)
- [x] I07 — Reproduzir as duas composições desktop com fontes/tokens locais, imagem à esquerda, informações à direita, fundo desfocado e rodapé do CTA fora da área rolável. (CA05, CA10)
- [x] I08 — Implementar painel inferior mobile para ambos os preços, galeria superior, fechamento acessível, conteúdo rolável e rodapé com preço/CTA e área segura. Adaptar larguras intermediárias, viewport baixa e texto ampliado; impedir overflow horizontal externo. (CA06–CA07, CA10)
- [x] I09 — Excluir todo o diretório `public/design/` dos assets de publicação, preservando imagens/fontes/ícones de uso real. Manter pré-renderização com o diálogo fechado e sem dependências novas de aplicação. (CA11)

## Tarefas de testes

Cada critério deve ter ao menos um teste automatizado correspondente. Testes de DOM verificam estrutura e comportamento; medidas, rolagem e foco reais exigem navegador. Usar produtos de teste com múltiplas fotos e informações opcionais sem alterar o catálogo real para simular disponibilidade.

| Tarefa | Cenários automatizados                                                                                                                                                                                                                  | Critérios |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| T01    | Abertura por foto/nome, clique/teclado e correspondência dos dados para os seis produtos; CTA direto mantém destino sem abrir modal.                                                                                                    | CA01      |
| T02    | Preço fixo e inicial em reais, valores do bolo/brownie, observação específica e alternativa de consulta; rótulos corretos no conteúdo e no rodapé mobile.                                                                               | CA02      |
| T03    | Galeria com três fotos, seleção por miniaturas, anterior/próxima, ciclo nos extremos, contador e reinício ao reabrir/trocar produto; acesso mobile às miniaturas.                                                                       | CA03      |
| T04    | Imagem única sem controles, descrição curta como alternativa, “Bom saber” ausente/presente em ambos os tipos de preço e erro de imagem sem ciclo nem bloqueio de ações.                                                                 | CA04      |
| T05    | Em navegador a 1440 × 900, variantes fixa/variável, geometria de duas colunas e conteúdo extenso rolável com CTA e fechamento acessíveis. Complementar com comparação visual dos PNGs.                                                  | CA05      |
| T06    | Em navegador a 390 × 844, painel inferior para os dois preços, ordem da galeria/conteúdo e posição do rodapé durante rolagem, incluindo acesso ao último item.                                                                          | CA06      |
| T07    | Em navegador a 320, 390, 768, 1024 e 1440 px, medir contenção e ausência de overflow externo; testar muitas miniaturas, texto longo, fonte ampliada e viewport baixa em orientação horizontal.                                          | CA07      |
| T08    | Fechar pelos três mecanismos, não fechar por clique interno, manter um diálogo, isolar fundo, conter foco com `Tab`/`Shift+Tab` e restaurar filtro/rolagem/foco; cobrir acionador removido. Validar efeitos reais em navegador.         | CA08      |
| T09    | CTA com ícone/texto/legenda, nome do produto na mensagem, destino configurado, atributos de nova aba; contato ausente e inválido sem navegação e com aviso visível.                                                                     | CA09      |
| T10    | Título do diálogo, nomes acessíveis, texto alternativo, miniatura selecionada e ícones decorativos; em navegador, foco visível, navegação completa por teclado/toque e dimensões mínimas dos controles.                                 | CA10      |
| T11    | Regressão dos seis produtos/filtros/contatos, estado inicial fechado e cobertura de pelo menos 90% por unidade implementada; conferir build estático, ausência de erros de pré-renderização e exclusão dos designs no diretório gerado. | CA11      |

- [x] Executar T01–T04 para dados, abertura, preço, galeria e alternativas. (CA01–CA04)
- [x] Criar e executar os testes em navegador T05–T08 para layout, rolagem, responsividade e ciclo do modal. Usar ferramenta existente se disponível; se não houver infraestrutura, adicionar somente o mínimo necessário em desenvolvimento. (CA05–CA08)
- [x] Executar T09–T10 para pedido e acessibilidade, combinando verificações de DOM e navegador conforme a tabela. (CA09–CA10)
- [x] Executar T11 e medir cobertura por unidade; corrigir lacunas em vez de presumir atendimento ao limite. (CA11)

## Tarefas de validação

- [x] V01 — Comparar visualmente as duas variantes desktop com `modal-detalhes-1.png` e `modal-detalhes-2.png` em 1440 × 900 px. Registrar capturas e diferenças, inclusive a indisponibilidade de fotos extras se persistir. (CA03–CA05)
- [x] V02 — Comparar o preço variável com `modal-detalhes-mobile.png` em 390 × 844 px; conferir a adaptação de preço fixo pelas regras da especificação e a visibilidade contínua do preço/CTA. (CA02, CA06)
- [x] V03 — Conferir em navegador teclado, toque, fechamento, foco, isolamento do fundo, retorno ao catálogo e rolagem nas larguras de 320, 390, 768, 1024 e 1440 px, também com pouco espaço vertical e texto ampliado. (CA07–CA10)
- [x] V04 — Executar `npm test -- --watch=false --coverage`, os testes de navegador adotados e `npm run build`; registrar comandos, resultados e cobertura das unidades alteradas. Inspecionar saída estática e confirmar ausência dos arquivos de `public/design/`. (CA11)
- [x] V05 — Executar Prettier em modo de conferência apenas nos arquivos alterados e `git diff --check`; revisar o diff contra esta especificação, sem incluir alterações preexistentes de outras funcionalidades. (CA11)
- [x] V06 — Registrar relatório de revisão com conformidade ao `spec.md` e a este `tasks.md`, correspondência entre critérios e testes, lacunas e sugestões. Distinguir testes executados de validações ainda pendentes; não concluir a funcionalidade com critérios obrigatórios em aberto. (CA01–CA11)

## Checklist de conclusão

- [x] Tarefas I01–I09 implementadas conforme a especificação, sem escopo adicional.
- [x] Cada critério CA01–CA11 possui teste automatizado correspondente executado.
- [x] Cada unidade implementada atinge ao menos 90% de cobertura unitária.
- [x] Preço fixo e variável validados em desktop e mobile.
- [x] Dados opcionais ausentes e falha de imagem tratados sem conteúdo inventado.
- [x] Teclado, foco, toque e restauração do contexto aprovados em navegador.
- [x] Build estático, regressões e formatação aprovados; designs ausentes da publicação.
- [x] Comparação visual e revisão de aderência registradas com evidências.
- [x] Limitações de assets e eventuais dados comerciais pendentes explicitados.

## Limitações de conteúdo preservadas

- As fotos extras do bolo vistas nas miniaturas não existem como arquivos individuais no repositório. A apresentação de foto única é a alternativa prevista; os testes da galeria usam dados próprios de teste.
- Antecedência, conservação e alérgenos ainda não estão cadastrados/confirmados por produto. A seção permanece ausente para produtos sem essas informações.
- A variante mobile de preço fixo é derivada das regras desta especificação; não há PNG específico fornecido.
- As limitações de conteúdo acima são as alternativas autorizadas no `spec.md`; a galeria e os itens opcionais foram exercitados com dados próprios de teste, sem cadastrar informações fictícias no catálogo.

## Evidências de implementação e validação — 2026-10-29

- `npm test -- --watch=false --coverage`: seis arquivos e 30 testes aprovados. Os testes de DOM incluem abertura de todos os produtos, duas variantes de preço, galeria, informações opcionais, falhas de imagem, WhatsApp ausente/inválido, fechamento e restauração de contexto.
- Cobertura de `product-details.ts`: 98,51% de statements, 100% de branches, 95,65% de funções e 100% de linhas. `catalog.ts`, `product-card.ts` e `home.ts`: 100% de statements, branches e funções. Relatório em `coverage/doceria-da-mary/` (ignorado pelo Git).
- `npm run test:e2e`: dez testes aprovados no Google Chrome, via Playwright. Cobrem os seis produtos por teclado, manutenção do pedido direto, galeria com fotos de teste, falha de imagem, duas composições de preço e larguras de 320, 390, 768, 1024 e 1440 px.
- Os testes em navegador verificam rolagem interna com texto longo, último item acima do rodapé, ausência de overflow externo, alvos de 44 × 44 px, rodapé estável, miniaturas excedentes, foco inicial e nos limites de Tab/Shift+Tab, isolamento do fundo, três formas de fechamento, retorno do foco/filtro/rolagem e alternativa para acionador removido. Também exercitam toque mobile e fonte ampliada com viewports de 667 × 375, 1024 × 320 e 320 × 568 px.
- Capturas das variantes real fixa/variável em cada largura e do conteúdo longo foram geradas em `test-results/` (ignorado pelo Git). As capturas desktop/mobile foram inspecionadas contra os PNGs: painel, hierarquia, fontes, fundo, fechamento e rodapé preservados; a ausência de miniaturas e de “Bom saber” no catálogo real decorre das limitações de dados já previstas.
- `npm run build`: uma rota estática pré-renderizada, sem alerta de orçamento. A saída em `dist/doceria-da-mary/browser/` contém os seis cards, inicia sem diálogo, mantém o ícone local de WhatsApp e não contém `design/` nem PNGs dos modais.
- Prettier em modo de conferência nos arquivos alterados e `git diff --check`: aprovados.
- Comandos executados com Node 26.5.0, disponível no ambiente e compatível com o `engines` do projeto. Para repetir os testes de navegador, executar `npm run test:e2e` com Google Chrome instalado (`channel: 'chrome'` em `playwright.config.ts`). Playwright foi adicionado somente como dependência de desenvolvimento; não houve dependência nova de aplicação.

## Validação de aderência pelo implementador

- **Especificação:** CA01–CA11 atendidos pelos testes unitários, testes de navegador, inspeção visual e conferência do build. O modal reutiliza o catálogo e os links existentes, sem mudar preços, contatos, filtros ou mensagens de pedido.
- **Tarefas:** I01–I09 e T01–T11 executadas; V01–V05 concluídas com as evidências acima. Este registro documenta a validação de aderência solicitada em V06, sem alegar revisão independente por outro agente.
- **Cobertura dos critérios:** `product-details.spec.ts` cobre CA01–CA04 e CA08–CA11; `tests/browser/product-details.e2e.ts` cobre interação e layout de CA01–CA03 e CA05–CA10; os comandos de build, cobertura, formatação e inspeção da saída completam CA11. Os testes existentes continuam cobrindo catálogo, filtros e contatos.
- **Lacunas:** nenhuma pendência de implementação identificada dentro das alternativas de dados autorizadas. Fotos extras e informações comerciais continuam pendentes de fornecimento/confirmação, sem bloquear a apresentação de imagem única e a omissão da seção opcional.
- **Simplicidade:** diálogo nativo fornece fundo inerte e semântica; um tratamento dos limites de Tab evita que o foco vá para a interface do navegador. A galeria fica no mesmo componente, sem serviços ou bibliotecas de aplicação adicionais. Nenhuma alteração foi feita no `spec.md`, nenhum commit/MR foi criado e nenhuma publicação foi realizada.
