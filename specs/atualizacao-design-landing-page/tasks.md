# Tarefas — Atualização do design da landing page

## Implementação

- [x] Ajustar cabeçalho e hero para desktop/mobile, incluindo CTA compacto, texto completo e selo mobile; remover a interface do menu que não consta no novo layout. (CA01)
- [x] Atualizar composição das categorias, legenda e nomes completos, preservando seleção e âncora. (CA02)
- [x] Adequar cards, grades, aviso ilustrativo e faixa de filtros; manter descrições e ação completa no mobile. (CA03)
- [x] Ajustar seção sobre, badges e encomendas para textos e composição das referências. (CA04)
- [x] Converter contato em cards clicáveis com ícones, cores e dados reais centralizados. (CA05)
- [x] Adaptar rodapé e larguras intermediárias, preservando semântica, âncoras, foco e navegação. (CA06)

## Testes

- [x] Cobrir conteúdo e estrutura do cabeçalho/hero, categorias, cardápio, sobre e encomendas em testes automatizados. (CA01–CA04)
- [x] Testar seleção de todas as categorias, restauração de Todos, estado acessível e navegação ao cardápio. (CA02–CA03)
- [x] Validar cards de contato, CTAs, destinos/mensagens reais e segurança dos links externos. (CA05)
- [x] Validar âncoras, link de salto, navegação de rodapé e comportamento vazio/contato ausente onde aplicável. (CA06)
- [x] Executar testes e obter cobertura unitária mínima de 90% das unidades implementadas; registrar evidência ou eventual limitação da ferramenta. (CA07)

## Validação

- [ ] Comparar visualmente a página em 1440 e 390 px com os PNGs locais. (CA01–CA05)
- [ ] Verificar ausência de overflow da página em 320, 390, 768, 1024 e 1440 px, filtro rolável e navegação por teclado. (CA06)
- [x] Executar build de produção, conferir HTML estático/assets locais e exclusão dos PNGs de design. (CA07)
- [x] Executar formatação dos arquivos alterados e revisar diff contra esta especificação. (CA07)

## Checklist de conclusão

- [ ] Implementação concluída para os critérios CA01–CA06.
- [ ] Critérios de aceitação cobertos por testes e validação visual apropriada.
- [x] Build, testes e formatação aprovados com evidências.
- [x] Revisão de aderência à especificação e tarefas concluída.
- [x] Limitações de validação explicitadas, se existirem.

## Evidências e revisão — 2026-10-29

- `npm test -- --watch=false --coverage`: 5 arquivos, 17 testes aprovados. Cobertura em `home.ts` e `product-card.ts`: 100% de statements, funções e branches; relatório em `coverage/doceria-da-mary/` (ignorado pelo Git).
- Adicionado `@vitest/coverage-v8` apenas como dependência de desenvolvimento para medir o limite exigido pelo repositório.
- `npm run build`: uma rota estática pré-renderizada; orçamento inicial preservado.
- Conferência automatizada do HTML publicado: seis cards com descrições, dois cards de contato, dez links de WhatsApp, imagens/fontes locais presentes e nenhum PNG de referência copiado.
- Prettier aprovado nos arquivos alterados; `git diff --check` aprovado.
- Revisão por Agente de Revisão: estrutura, conteúdo e interações aderentes aos CA01–CA05, sem falhas funcionais identificadas. Cabeçalho intermediário adapta navegação para segunda linha entre 701 e 900 px; CTAs do hero permitem quebra de linha.
- **Limitação:** inventário de navegadores vazio e navegador `iab` indisponível nesta sessão. Não foi possível comparar a renderização em 1440/390 px nem verificar overflow/teclado em 320, 390, 768, 1024 e 1440 px. A aprovação visual e parte dos CA06–CA07 permanecem pendentes; testes de DOM não comprovam layout.
- O PNG mobile termina no começo do card Instagram. O restante do contato e o rodapé foram preservados conforme especificação.

## Ajustes posteriores solicitados pelo usuário

As evidências anteriores descrevem a implementação antes dos ajustes abaixo; os novos requisitos prevalecem sobre a presença do aviso e os ícones genéricos daquela versão.

- [x] Remover o aviso "Valores ilustrativos para demonstração", sua marcação e estilos exclusivos, sem reservar espaço no desktop ou mobile. (CA03)
- [x] Substituir os dois ícones genéricos pelo ícone do WhatsApp no cabeçalho e no card de contato, preservando nomes acessíveis, links e mensagens. (CA01, CA05)
- [x] Atualizar testes para comprovar ausência do aviso e presença dos ícones decorativos do WhatsApp nos dois locais; executar testes, build e formatação dos arquivos alterados. (CA01, CA03, CA05, CA07)
- [x] Revisar aderência dos ajustes e registrar novas evidências, preservando as limitações de validação visual já documentadas. (CA01, CA03, CA05–CA07)

### Evidências dos ajustes posteriores

- `npm test -- --watch=false --coverage`: 18 testes aprovados em cinco arquivos; cobertura de statements, funções e linhas em 100%.
- `npm run build`: uma rota estática pré-renderizada, sem alerta de orçamento CSS.
- HTML estático conferido: aviso e ícone genérico ausentes; dois usos de `icons/whatsapp.svg`, com arquivo SVG válido presente no build.
- SVG local do Bootstrap Icons, com licença MIT incorporada; nenhuma dependência adicionada.
- Revisão de aderência concluída sem pendências de código. Limitação de conferência visual em navegador permanece.
