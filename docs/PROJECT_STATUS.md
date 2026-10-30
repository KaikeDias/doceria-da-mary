# Estado do projeto

Atualizado em 2026-10-29.

Repositório na branch `main`, com entregas separadas por funcionalidade. Os registros em `docs/tasks/` descrevem as primeiras entregas; as especificações e evidências atuais ficam em `specs/`.

## Implementado

- Landing page responsiva em `/`: apresentação, categorias, cardápio, sobre, encomendas, contato e rodapé.
- Seis produtos demonstrativos e filtro por categoria. WhatsApp e Instagram reais preservados, com mensagens contextuais e abertura segura dos links externos.
- Detalhes de produtos com preços fixos/variáveis, descrição complementar, galeria opcional e CTA de WhatsApp. Fechamento por botão, Escape e fundo; foco, fundo inerte e rolagem gerenciados pelo diálogo nativo.
- Hover de ampliação/elevação nos cards, entrada suave dos modais e hover de cor nos controles. Preferência de movimento reduzido, toque e estados indisponíveis respeitados.
- Tailwind para apresentação e responsividade; DaisyUI para botões, modal e estados. CSS de fonte reduzido de 1.468 para 175 linhas, restrito a fontes/tema, padrões compartilhados e animações necessárias.
- Logo, fotos WebP, ícone do WhatsApp e fontes Cormorant Garamond/DM Sans locais. As referências em `public/design/landing-page/` não integram a publicação.
- Angular 22 standalone, OnPush, Signals, TypeScript strict e pré-renderização estática. Sem checkout, administração ou backend.

## Especificações e evidências

- [Atualização do design](../specs/atualizacao-design-landing-page/tasks.md).
- [Modais de detalhes](../specs/modais-detalhes-produtos/tasks.md).
- [Animações dos produtos](../specs/animacoes-produtos/tasks.md).
- [Hover padrão dos botões](../specs/hover-padrao-botoes/tasks.md).
- [Refatoração Tailwind e DaisyUI](../specs/refatoracao-tailwind-daisyui/tasks.md).

## Validação

- Build estático aprovado, com uma rota pré-renderizada, seis produtos e modal inicialmente fechado.
- 30 testes unitários aprovados; cobertura global de 99,8% de statements e 100% de linhas.
- 21 testes Playwright aprovados no Chrome para detalhes, hover, animações, foco, teclado, rolagem, toque e movimento reduzido.
- Página e modais comparados visualmente em 320, 390, 768, 1024 e 1440 px. Grades corretas e ausência de overflow externo verificadas.
- Formatação conferida com Prettier; whitespace conferido com `git diff --check`.
- Node 26.5.0 usado nas validações recentes. Firefox e Safari não foram executados.

## Pendências

- Fornecer fotos originais/adicionais dos produtos e confirmar antecedência de encomenda, conservação e alérgenos antes de cadastrá-los como informações reais.
- E-mail, endereço, localização, horários e API continuam não configurados.
- Hospedagem definida: Vercel (sem domínio próprio). O push do código ao GitHub não constitui publicação em hospedagem.
- Publicar na Vercel e validar rotas e 404 ([hospedagem-vercel](../specs/hospedagem-vercel/tasks.md), V01–V02); validar o JSON-LD e aplicar a migration da região ([seo-landing](../specs/seo-landing/tasks.md), V02–V03).

## Histórico

As primeiras telas e contatos estão registrados em [telas do Paper](tasks/2026-10-14-telas-paper.md), [contatos reais](tasks/2026-10-14-contatos-reais.md) e [commits iniciais](tasks/2026-10-14-commits-push.md). A decisão sobre os recortes e assets locais está em [ADR-0001](decisions/ADR-0001-referencias-exportadas.md).
