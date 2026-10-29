# Tarefas — Tela de login administrativo

Especificação: `specs/tela-login/spec.md`.

Todas as tarefas abaixo estão pendentes de implementação. Esta etapa criou somente a especificação e as tarefas técnicas.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                    | Critérios  | Testes   |
| ------------- | --------------------------------------------------------------------- | ---------- | -------- |
| I01           | Rota, título, estado inicial, retorno e pré-renderização.             | CA01, CA11 | T01, T11 |
| I02           | Composição desktop e assets existentes.                               | CA02, CA10 | T02, T10 |
| I03           | Composição mobile, breakpoint e adaptação de espaço.                  | CA03, CA04 | T03, T04 |
| I04           | Formulário, normalização e validação com mensagens.                   | CA05, CA09 | T05, T09 |
| I05           | Alternância de visibilidade da senha.                                 | CA06, CA09 | T06, T09 |
| I06           | Carregamento, bloqueio de duplicidade e retorno de indisponibilidade. | CA07, CA08 | T07, T08 |
| I07           | Acessibilidade e estados visuais dos controles.                       | CA09       | T09      |
| I08           | Falha de imagem e proteção dos dados durante a interação.             | CA10       | T10      |
| I09           | Regressão, cobertura e compatibilidade do build estático.             | CA11       | T11      |

## Tarefas de implementação

- [ ] I01 — Criar a funcionalidade em `src/app/features/auth/`, seguindo os componentes standalone/OnPush existentes. Integrar `/login` e seu título em `src/app/app.routes.ts`, incluir a rota em `src/app/app.routes.server.ts`, implementar estado inicial e retorno explícito a `/`. Preservar `/` e não adicionar entrada de login à landing page. (CA01, CA11)
- [ ] I02 — Implementar card desktop, conteúdo, divisor de coração, foto com recorte/moldura/selo, decorações e rodapé administrativo com ano corrente. Reutilizar logo, `hero.webp`, fontes, tema e ícones locais; não usar os PNGs como interface. (CA02, CA10)
- [ ] I03 — Implementar coluna única abaixo de 1024 px, sem foto/selo/divisor, e rodapé mobile. Ajustar margens, crescimento do card e rolagem para campos com erro, viewports baixas e texto ampliado, sem alterar o breakpoint global da landing page. (CA03, CA04)
- [ ] I04 — Implementar campos semânticos, labels, placeholders e preenchimento automático. Aplicar as regras RN03–RN05, incluindo espaços externos do e-mail, preservação da senha, validação por perda de foco/envio, correção durante edição e foco no primeiro inválido. Não iniciar submissão inválida. (CA05, CA09)
- [ ] I05 — Implementar botão de mostrar/ocultar senha, nomes acessíveis e tipo não submetente. Preservar valor ao alternar e restaurar o estado oculto ao entrar novamente na tela. (CA06, CA09)
- [ ] I06 — Implementar o ciclo assíncrono mínimo de RN07–RN08: carregamento testável com operação controlada, bloqueio de duplicidade, retorno de indisponibilidade sem integração e tratamento de falha. Restaurar controles, preservar e-mail, limpar/ocultar senha e evitar efeitos após saída. Não criar endpoint, credenciais, sessão, timer artificial ou fluxo de sucesso fictício. (CA07, CA08)
- [ ] I07 — Associar erros aos campos e implementar anúncios de estado, indicador de ocupado, foco visível, teclado e alvos de toque. Reutilizar o padrão de hover sem alterar os controles existentes; respeitar toque, desabilitação e movimento reduzido. (CA09)
- [ ] I08 — Tratar falha da foto com painel neutro e sem ciclo de erro. Manter os dados apenas em memória, sem envio em URL, armazenamento ou logs. Preservar `apiUrl: null` e a exclusão existente de `public/design/` no build. (CA10)
- [ ] I09 — Integrar os testes à infraestrutura Vitest/Playwright existente e conferir cobertura, regressões e saída estática, sem novas dependências para a interface. (CA11)

## Tarefas de testes

Os caminhos `src/app/features/auth/` e `tests/browser/login.e2e.ts` são destinos propostos para os novos testes, ainda inexistentes. Aproveitar `src/app/app.spec.ts` para os cenários de roteamento quando adequado. Usar operações assíncronas controladas nos testes para manter o carregamento pendente e provocar falhas, sem API ou credenciais reais.

| ID  | Cenários automatizados obrigatórios                                                                                                                                                                                                                                                                                 | Critérios |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| T01 | Abertura direta, recarga, título, valores iniciais, ausência de erros e retorno a `/` sem histórico. Combinar testes de Router com navegador para acesso direto e recarga.                                                                                                                                          | CA01      |
| T02 | Em 1440 × 900, presença e geometria de card/foto/selo/divisor/rodapé, textos e ano; repetir com os dois erros e verificar ausência de sobreposição. Gerar capturas para comparação visual.                                                                                                                          | CA02      |
| T03 | Em 390 × 844, estados inicial e pendente, ocultação de foto/selo/divisor, posição dos elementos, textos e dimensões estáveis do botão. Gerar capturas.                                                                                                                                                              | CA03      |
| T04 | Em 320, 390, 768, 1024 e 1440 px, verificar composição e ausência de overflow; testar também os limites de 1023/1024 px, viewport 667 × 375, conteúdo com erros e zoom de 200%, mantendo ações alcançáveis.                                                                                                         | CA04      |
| T05 | Campos intocados sem erro, perda de foco, envio vazio, `mary@email` com senha vazia, `mary@email.com` válido, mensagens exatas, foco no primeiro inválido, correção e bloqueio da operação inválida. Testar e-mail com espaços externos, senha preservada e ausência de tamanho mínimo inventado.                   | CA05      |
| T06 | Mostrar/ocultar senha por teclado, toque e mouse; tipo e nome acessível corretos, valor preservado, ausência de submissão/validação incidental e estado oculto ao reentrar.                                                                                                                                         | CA06      |
| T07 | Operação pendente: indicador/texto, valores preservados, controles desabilitados e somente uma chamada após cliques/Enter repetidos. Sair pelo retorno e encerrar a operação depois, sem efeitos tardios.                                                                                                           | CA07      |
| T08 | Ausência de integração e rejeição inesperada: mensagem genérica, controles restaurados, e-mail mantido, senha limpa/oculta, nova submissão removendo o aviso e ausência de sessão ou redirecionamento.                                                                                                              | CA08      |
| T09 | Semântica, labels, nomes, `aria-describedby`, `aria-invalid`, região viva e estado ocupado. Em navegador, percorrer por Tab/Shift+Tab, acionar controles, verificar foco, alvos de 44 × 44 px, hover, ausência de hover de ação habilitada durante carregamento, toque e movimento reduzido com indicador estático. | CA09      |
| T10 | Assets locais e ausência de PNGs dos designs no build. Falha da foto sem tentativas infinitas nem bloqueio. Usar credenciais exclusivas de teste para verificar que não aparecem em URL, local/session storage, logs ou HTML estático; confirmar que a configuração de API não foi preenchida com destino fictício. | CA10      |
| T11 | Executar cobertura por unidade e todas as regressões existentes. Conferir HTML gerado de `/` e `/login`, servir a saída estática para testar acesso direto/recarga de `/login` e detectar erros de hidratação; conferir formatação e diff.                                                                          | CA11      |

- [ ] Criar e executar T01, T05–T08 e as verificações de DOM de T09–T10 em testes unitários, incluindo ramos de validação e falha. (CA01, CA05–CA10)
- [ ] Criar e executar T01–T04 e T06–T10 no Playwright conforme os efeitos reais de navegação, layout, teclado, toque e carregamento. Complementar a automação com comparação visual das quatro referências. (CA01–CA10)
- [ ] Executar T11 e comprovar ao menos 90% de cobertura para cada unidade de código implementada, incluindo qualquer unidade existente que receba nova lógica. Corrigir lacunas antes de concluir. (CA11)

## Tarefas de validação

- [ ] V01 — Comparar capturas desktop em 1440 × 900 com as referências inicial e de erros. Conferir recorte da foto, logo, textos, cores, tipografia, alinhamento, bordas, espaçamento e crescimento do card. Registrar evidências e diferenças. (CA02, CA05)
- [ ] V02 — Comparar capturas mobile em 390 × 844 com as referências inicial e carregando. Conferir também erros e indisponibilidade em mobile, derivados das regras da mesma tela. (CA03, CA05, CA07, CA08)
- [ ] V03 — Validar responsividade, zoom, viewport baixa, teclado, toque, foco, anúncios e movimento reduzido em navegador. Registrar limitações de verificação do teclado virtual ou de tecnologias assistivas quando não exercitados. (CA04, CA06, CA09)
- [ ] V04 — Executar `npm test -- --watch=false --coverage`, `npm run test:e2e` e `npm run build`. Registrar resultados, cobertura por unidade, ausência de dependências novas e manutenção das regressões. (CA11)
- [ ] V05 — Inspecionar a saída em `dist/doceria-da-mary/browser/`: HTML de ambas as rotas, assets locais e ausência de `design/`/credenciais. Servir o build estático e verificar acesso direto, recarga e hidratação de `/login`. Não confundir o sucesso do servidor de desenvolvimento com validação da hospedagem estática; registrar hospedagem real como pendente se não disponível. (CA01, CA10, CA11)
- [ ] V06 — Executar Prettier em modo de conferência nos arquivos alterados e `git diff --check`. Revisar somente o diff desta funcionalidade e preservar os designs fornecidos. (CA11)
- [ ] V07 — Registrar revisão de aderência ao `spec.md` e a este `tasks.md`: conformidade, relação CA/testes, evidências, lacunas e sugestões. Diferenciar entrega da interface de autenticação real e não declarar login funcional ou cenários não executados. (CA01–CA11)

## Checklist de conclusão

- [ ] I01–I09 implementadas dentro do escopo da interface.
- [ ] CA01–CA11 cobertos por testes correspondentes, com resultados registrados.
- [ ] Cada unidade implementada possui pelo menos 90% de cobertura unitária comprovada.
- [ ] Quatro referências visuais comparadas com capturas da implementação.
- [ ] Validação, alternância da senha, carregamento e indisponibilidade aprovados.
- [ ] Navegação, responsividade, teclado, foco, toque e movimento reduzido validados.
- [ ] Sem credenciais persistidas/expostas, sessão simulada ou integração fictícia.
- [ ] Regressões, build estático, formatação e diff aprovados.
- [ ] Designs continuam excluídos da publicação e assets existentes são reutilizados.
- [ ] Revisão e limitações registradas; autenticação real e configuração da hospedagem distinguidas das verificações locais.
