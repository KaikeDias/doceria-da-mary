# Estado do projeto

Atualizado em 2026-10-29.

Repositório publicado em main no origin (GitHub KaikeDias/doceria-landing-page), com commits separados de assets, aplicação e documentação. Registro operacional em [commits e push](tasks/2026-10-14-commits-push.md).

## Existente

- Landing page responsiva em `/`: apresentação, categorias, cardápio, sobre, encomendas, contato e rodapé.
- Seis produtos demonstrativos reproduzidos da referência, filtro por categoria, CTA de pedido no cabeçalho mobile e navegação por âncoras.
- Logo original em `public/logo.png`; fotos extraídas das exportações e otimizadas em WebP.
- Cormorant Garamond e DM Sans locais em WOFF2, com licenças OFL.
- Angular 22.2.2 standalone OnPush, Signals, TypeScript strict, Tailwind 4, daisyUI 5 e SSG.
- WhatsApp e Instagram ativos com valores fornecidos pelo usuário; mensagens específicas para cabeçalho, hero, encomendas, dúvidas e cada produto. Demais contatos e API permanecem `null`.

## Atualização visual de 2026-10-29

Desktop e mobile adequados às novas referências em `public/design/landing-page`: cabeçalho mobile com CTA Pedir, hero com texto completo e selo, categorias com foto superior no mobile, descrições visíveis nos produtos, sobre completo e contato em cards clicáveis. WhatsApp e Instagram reais preservados.

Especificação e evidências: [especificação](../specs/atualizacao-design-landing-page/spec.md) e [tarefas](../specs/atualizacao-design-landing-page/tasks.md).

Build estático aprovado e 17 testes aprovados; cobertura de 100% nas unidades Home e ProductCard. Validação visual e de overflow em navegador pendente, pois não há navegador disponível nesta sessão. As verificações de navegador descritas abaixo referem-se à entrega anterior.

## Trabalho concluído

Implementação das exportações desktop/mobile fornecidas pelo usuário. O MCP do Paper permaneceu limitado; os PNGs foram usados com autorização do usuário.

Plano e evidências: [tarefa das telas](tasks/2026-10-14-telas-paper.md).
Decisão: [referências e assets](decisions/ADR-0001-referencias-exportadas.md).

## Validação

Build de produção e pré-renderização aprovados; nove testes aprovados; formatação aprovada.
Navegador verificado em 320, 390, 768, 1024 e 1440 px sem overflow horizontal.
Menu mobile, âncoras e filtro conferidos na entrega visual; destinos e mensagens dos CTAs ativos conferidos na tarefa de [contatos reais](tasks/2026-10-14-contatos-reais.md).

## Pendências e próxima ação

Revisar visualmente a página implementada. Quando disponíveis, conferir os valores CSS diretamente no Paper e substituir os recortes por fotos originais. E-mail, endereço, localização, horários e hospedagem ainda não foram fornecidos. Não há administração, modal, backend ou e-commerce.
