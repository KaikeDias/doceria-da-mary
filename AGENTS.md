# AGENTS.md — Doceria da Mary

## 1. Propósito

Este arquivo define as instruções para agentes de IA e colaboradores que trabalham no frontend da **Doceria da Mary**. Leia este arquivo antes de alterar código e consulte `ARCHITECTURE.md` para as decisões arquiteturais.

**Produto:** landing page de uma doceria artesanal com cardápio digital. O visitante conhece produtos e inicia uma conversa pelo WhatsApp. **Não é um e-commerce**.

**Estado do design:** os layouts já foram definidos no Paper. Use os designs aprovados como fonte de verdade visual; não redesenhe telas nem altere a identidade da marca por iniciativa própria.

## 2. Stack e convenções

- Angular moderno, com **standalone components**, Angular Router, TypeScript em modo `strict` e `ChangeDetectionStrategy.OnPush`.
- Tailwind CSS v4 e daisyUI v5 com tema customizado `doceria-mary`.
- Ícones com `lucide-angular`, importados individualmente.
- Componentes pequenos, coesos e reutilizáveis, quando houver reuso real.
- `inject()` para injeção de dependências; **Signals** para estado local simples; `computed()` para estado derivado.
- Templates com `@if` / `@for`, usando `track` adequado.
- Preferir recursos nativos do Angular; não adicionar bibliotecas de estado global, UI ou formulários sem necessidade justificada.
- Observar as convenções de nomenclatura e o sistema de testes efetivamente instalados no repositório. Não assumir versões específicas não verificadas.

## 3. Escopo e prioridades

### MVP público — obrigatório

- Landing page responsiva com seções de apresentação, categorias, cardápio, sobre, encomendas e contato.
- Listagem e filtro de produtos por categoria.
- Detalhes de produto por modal ou diálogo acessível, conforme design aprovado.
- CTAs para abrir WhatsApp com mensagem predefinida. Em produtos, incluir seu nome na mensagem.
- Dados de demonstração podem ser locais no início; projetar o acesso aos dados para permitir futura API.

### Fase posterior — opcional

- Área `/admin` com autenticação, CRUD de produtos e categorias e edição das informações públicas da página.
- Não implementar a área administrativa sem demanda explícita.

### Fora do escopo

Carrinho, checkout, pagamentos, cálculo de frete, contas de clientes, controle de estoque, dashboard de vendas e processamento de pedidos dentro do site.

## 4. Regras de execução dos agentes

1. **Entender antes de editar:** inspecionar arquivos, scripts, versões instaladas, rotas, serviços e componentes relevantes.
2. **Consultar o design:** para tarefas visuais, utilizar os layouts fornecidos do Paper e preservar a composição, espaçamentos e identidade; adaptar apenas o necessário para responsividade, acessibilidade ou restrição técnica, sinalizando mudanças relevantes.
3. **Planejar antes de implementar:** consultar o histórico em `docs/`, registrar o plano de tarefas relevantes conforme a seção 13, identificar arquivos a editar e critérios de aceitação; evitar refatorações fora do escopo.
4. **Implementar o mínimo suficiente:** não criar camadas, modelos, serviços, diretórios e abstrações vazias por antecipação.
5. **Validar:** executar comandos disponíveis no projeto para formatação/lint, testes e build; relatar comandos executados e resultados reais, sem alegar sucesso não verificado.
6. **Documentar mudanças estruturais:** atualizar `ARCHITECTURE.md` quando rotas, tecnologias, divisão de módulos, origem dos dados ou decisões relevantes mudarem.
7. **Informar pendências:** registrar limitações, riscos e itens não testados.

## 5. Organização e responsabilidades

Adotar organização **por feature**, sem forçar a existência de diretórios que ainda não são necessários:

```text
src/
  app/
    core/                 # configuração e serviços globais quando necessários
    shared/               # UI/utilitários reutilizados entre features
    features/
      home/               # página pública e seções da landing page
      catalog/            # modelos, componentes e acesso aos produtos
    app.config.ts
    app.routes.ts
  assets/                 # imagens, logo e recursos estáticos, conforme configuração do Angular
  styles.css              # Tailwind, daisyUI e tema global
```

A localização real de assets e os nomes de arquivos devem seguir o workspace gerado pelo Angular e a configuração observada no repositório. Mantenha lógica específica próxima da feature que a utiliza. Não mover conteúdo para `shared/` se for usado por apenas uma feature.

## 6. Design system e identidade visual

**Marca:** Doceria da Mary. Preservar a logo original circular rosa-clara, com monograma dourado `DM`. Não recriar ou distorcer a logo.

| Token daisyUI  | Hex       |
| -------------- | --------- |
| `primary`      | `#a65a6a` |
| `secondary`    | `#f0d2c8` |
| `accent`       | `#9bae8a` |
| `neutral`      | `#5a3a2e` |
| `base-100`     | `#fff8f3` |
| `base-200`     | `#f9ece6` |
| `base-300`     | `#f0d2c8` |
| `base-content` | `#2f2420` |
| `success`      | `#78956c` |
| `warning`      | `#c98a5a` |
| `error`        | `#b84f5f` |

- Centralizar a paleta no tema do daisyUI; preferir classes e tokens semânticos em vez de cores hexadecimais repetidas.
- Garantir contraste também nos tokens `*-content` do tema; conferir contraste real de botões, textos e estados.
- Estética artesanal, leve e elegante; evitar UI infantil, gradientes chamativos e sombras excessivas.
- Tipografia sugerida no design: Playfair Display para títulos e Inter para conteúdo, **se confirmadas nos arquivos do Paper**.
- Desenvolver responsivamente, com foco em mobile, tablet e desktop. Não permitir rolagem horizontal acidental.

## 7. Regras de implementação

### Angular

- Componentes standalone e `OnPush` por padrão.
- Preferir dados tipados e imutabilidade; evitar `any` e efeitos colaterais em templates.
- Preferir `input()` / `output()` quando alinhados à versão instalada do Angular e ao padrão do projeto.
- Para assinaturas reativas, usar recursos apropriados de interoperabilidade Angular/RxJS e limpeza automática; evitar inscrições manuais sem gerenciamento de ciclo de vida.
- Usar `@defer`/lazy loading somente quando trouxer benefício real e não prejudicar conteúdo crítico ou SEO.
- Não acoplar componentes visuais diretamente ao formato de retorno de uma futura API.

### Catálogo

- Manter um contrato `Product`/`Category` tipado e coeso quando a feature for implementada.
- Produtos podem ter preço definido, preço inicial (`a partir de`) ou preço sob consulta.
- Tratar estado de categoria vazia, imagens ausentes e produto indisponível/oculto de forma clara.
- Filtros do cardápio não devem exigir backend para funcionar na primeira versão.

### WhatsApp

- Centralizar o número público e a montagem do link; nunca duplicar número fixo entre componentes.
- Usar formato de número internacional apenas com dígitos (ex.: `55DDDNUMERO`) e URL `https://wa.me/<numero>?text=<mensagem>` com mensagem codificada com `encodeURIComponent`.
- Validar a presença do número antes de gerar links de contato; nunca publicar números fictícios como se fossem reais.
- Não enviar dados sensíveis por query string. Não implementar integração direta com API do WhatsApp sem especificação.

### Formulários e segurança

- Não colocar credenciais, tokens ou segredos em código frontend nem em arquivos de ambiente enviados ao navegador.
- Considerar textos e URLs vindos de dados externos como não confiáveis; não usar HTML arbitrário ou bypass de sanitização.
- Quando `/admin` for implementado, autorização precisa existir também no backend. Guard de rota frontend não substitui controle de acesso no servidor.

## 8. SEO, acessibilidade e desempenho

- Idioma da página: `pt-BR`; título e descrição SEO adequados.
- Preferir pré-renderização/SSG da rota pública **se o workspace e a estratégia de implantação suportarem**; confirmar comportamento no build e publicação.
- Imagens otimizadas, dimensões definidas, `alt` significativo e lazy loading fora do conteúdo crítico.
- Semântica HTML correta, títulos hierárquicos, foco visível, navegação por teclado, labels associados e acessibilidade de modais.
- Garantir alvos de toque confortáveis no mobile e não bloquear conteúdo com botão flutuante do WhatsApp.
- Evitar dependências pesadas sem justificativa e conservar boa experiência em redes móveis.

## 9. Testes e critérios de aceite

Para cada funcionalidade, verificar conforme aplicável:

- Fluxo principal funcionando (cardápio, categorias, detalhes e CTA WhatsApp).
- Responsividade e conformidade com a referência visual.
- Estados de vazio, erro ou indisponibilidade quando pertinentes.
- Acessibilidade básica e navegação por teclado.
- Testes de lógica importante: filtro de produtos, formatação/exibição de preço e construção de URLs do WhatsApp.
- Build de produção concluído e testes executados com resultado informado.

## 10. Critérios para concluir tarefas

Uma tarefa só pode ser declarada concluída quando o comportamento pedido estiver implementado, os arquivos alterados forem coerentes com a arquitetura, a documentação correspondente em `docs/` estiver atualizada, não houver mudança de escopo não autorizada e os resultados de validação forem reportados. Se não houver testes ou ambiente disponível, declarar explicitamente essa limitação.

## 11. Documentos de referência

- `AGENTS.md`: regras operacionais para o trabalho de agentes.
- `ARCHITECTURE.md`: visão arquitetural, limites, fluxos e decisões.
- Designs aprovados no Paper: referência visual para implementação (não incluídos neste documento).
- `docs/tasks/`: planos, progresso e resultados por tarefa.
- `docs/decisions/`: registros de decisões técnicas relevantes.
- `docs/PROJECT_STATUS.md`: estado atual do projeto e próximos passos.

Em caso de conflito entre documentos e código existente, investigar o estado real do projeto, apresentar a divergência e atualizar a documentação após a decisão aprovada.

## 13. Documentação obrigatória e preservação de contexto

**A documentação em Markdown faz parte da entrega, não é uma atividade opcional.** O agente deve manter contexto escrito e recuperável para que outra IA ou outra sessão possa continuar o trabalho sem depender do histórico do chat. Documentar o que foi realmente planejado, implementado e verificado; nunca registrar hipóteses como fatos.

### Estrutura de documentos

```text
docs/
  PROJECT_STATUS.md              # resumo vivo: estado atual, pendências, próximo passo
  tasks/
    YYYY-MM-DD-slug-da-tarefa.md # plano, execução e resultado da tarefa
  decisions/
    ADR-0001-titulo.md          # decisões arquiteturais relevantes
```

- `AGENTS.md`: regras permanentes do agente; atualize se o processo de trabalho mudar.
- `ARCHITECTURE.md`: estrutura e decisões arquiteturais vigentes; atualize quando a arquitetura mudar.
- `docs/PROJECT_STATUS.md`: visão concisa do andamento do projeto, funcionalidades existentes, trabalho em curso, pendências e próxima ação recomendada.
- `docs/tasks/`: **criar um arquivo `.md` para cada tarefa de implementação, correção significativa, integração, refatoração ou setup**, antes de modificar código.
- `docs/decisions/`: criar um ADR para decisões arquiteturais relevantes ou que envolvam trade-offs; não criar ADR para escolhas triviais.

Não criar documentos vazios nem duplicar grandes blocos entre arquivos. Para alterações triviais apenas de texto ou formatação, basta atualizar o documento existente pertinente; não é necessário abrir uma tarefa documental separada.

### Fluxo obrigatório por tarefa

1. **Antes de codificar:** ler `AGENTS.md`, `ARCHITECTURE.md`, `docs/PROJECT_STATUS.md` (se existir) e os registros de tarefas relacionados. Inspecionar também o estado real do código.
2. **Registrar o plano:** criar `docs/tasks/YYYY-MM-DD-slug-da-tarefa.md` com objetivo, contexto, referências do Paper quando aplicáveis, escopo e exclusões, arquivos/componentes previstos, passos de implementação, critérios de aceite, testes planejados e dúvidas/risco.
3. **Durante a implementação:** atualizar o mesmo documento ao concluir etapas, mudar decisões ou descobrir bloqueios. Marcar claramente os estados `Planejado`, `Em andamento`, `Bloqueado` ou `Concluído`. Não presumir que itens planejados foram executados.
4. **Ao concluir:** acrescentar arquivos efetivamente alterados, decisões tomadas, testes e comandos executados com seus resultados, limitações, pendências e próximos passos. Atualizar `docs/PROJECT_STATUS.md`. Se houve mudança estrutural, atualizar também `ARCHITECTURE.md` e, quando cabível, criar ADR.
5. **Em uma nova sessão:** reconstruir o contexto lendo esses documentos e conferindo o repositório antes de continuar. Se documentação e código divergirem, registrar a divergência e privilegiar o estado verificado do código até resolver o conflito.

### Modelo mínimo para documentos em `docs/tasks/`

```markdown
# [Título da tarefa]

- Data: YYYY-MM-DD
- Status: Planejado | Em andamento | Bloqueado | Concluído

## Objetivo e contexto

## Referência do Paper (se aplicável)

## Escopo e fora de escopo

## Plano de implementação

- [ ] Etapa 1
- [ ] Etapa 2

## Arquivos impactados

## Critérios de aceitação

## Validação e resultados

## Decisões, riscos e bloqueios

## Pendências e próximos passos
```

### Regras para ADRs

Cada decisão relevante deve conter: **contexto, alternativas consideradas, decisão, justificativa e consequências**. Use nomes sequenciais como `ADR-0001-estrategia-renderizacao.md`. Não reescrever ADRs aprovados para esconder mudanças: registre nova decisão que substitui a anterior e atualize o estado dos registros.

### Controle de escopo e consistência

- **Documentar não autoriza implementar.** O plano deve conter apenas o escopo solicitado, seguindo as telas existentes no Paper.
- Não inventar requisitos, progresso, testes concluídos ou dados reais de contato.
- Se faltarem informações, registrar a dúvida e aguardar esclarecimento quando a resposta afetar o comportamento.
- Manter documentos curtos, objetivos, versionados com o código e escritos em português brasileiro.
- Antes de encerrar a resposta ao usuário, indicar quais documentos foram criados ou atualizados.
