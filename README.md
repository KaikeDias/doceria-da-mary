# Doceria da Mary

Landing page responsiva de uma doceria artesanal, implementada a partir dos layouts desktop/mobile exportados do Paper. Inclui apresentação, categorias, cardápio demonstrativo com seis produtos e filtros, sobre, encomendas e contato. WhatsApp e Instagram estão ativos com os dados fornecidos pela proprietária. Não há administração, backend ou e-commerce.

## Stack instalada

- Angular, Router, CLI e build: 22.2.2, standalone, OnPush e zoneless.
- TypeScript: 6.0.3, com strict e strictTemplates.
- Tailwind CSS / PostCSS plugin: 4.3.3; PostCSS: 8.5.30.
- daisyUI: 5.7.50, apenas o tema claro `doceria-mary`.
- Lucide: `@lucide/angular` 1.57.0, com importação individual.
- Vitest: 5.0.4; jsdom: 30.1.2; Prettier: 3.9.10.
- RxJS: 7.8.2; tslib: 2.8.1.

As versões efetivas estão fixadas pelo `package-lock.json`. Foi usado o pacote atual oficial do Lucide porque o legado `lucide-angular` limita seus peers ao Angular 21. TypeScript 7 ainda não é compatível: Angular 22.2 exige TypeScript >=6.0 e <6.1.

## Pré-requisitos

Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm >=11.
Ambiente validado: Node 24.18.0 e npm 11.12.1.

## Comandos

```sh
npm ci
npm start
npm test -- --watch=false
npm run format:check
npm run format
npm run build
```

O servidor de desenvolvimento atende em `http://localhost:4200`.
O build padrão é de produção. Os testes usam o builder unitário do Angular com Vitest.
Não há ferramenta de lint instalada; a formatação é verificada com Prettier.

## Estrutura existente

```text
public/                            # logo, fotos WebP, fontes WOFF2 e referências
src/
  app/
    core/config/public-config.ts   # contatos públicos e placeholders restantes
    core/config/contact-links.ts   # links WhatsApp e mensagens por contexto
    features/home/                 # landing page, menu e seções responsivas
    features/catalog/              # dados tipados, filtro, preços e card reutilizado
    app.ts / app.html              # shell com RouterOutlet
    app.routes.ts                  # rota / com loadComponent
    app.config.ts                  # Router, hidratação e tratamento de erros
    app.routes.server.ts           # prerender de /
    app.config.server.ts           # configuração usada durante SSG
  main.ts
  main.server.ts                   # entrada Angular para geração estática
  index.html                       # pt-BR, título e descrição inicial
  styles.css                       # Tailwind, daisyUI e tokens do tema
```

Documentação de progresso em `docs/PROJECT_STATUS.md`, planos/resultados em `docs/tasks/` e decisões em `docs/decisions/`. UI compartilhada e administração serão criadas somente quando necessárias.

## Publicação estática e SEO

`outputMode: "static"` pré-renderiza a rota `/` no build. Publique o conteúdo de
`dist/doceria-da-mary/browser/` em uma hospedagem estática. Nenhum servidor Node.js
é necessário em produção; os arquivos de renderização Angular são usados no build.
A hospedagem ainda precisa ser escolhida e validada.

O HTML tem idioma pt-BR, viewport, título e descrição inicial. Não foi incluído
favicon porque o asset específico ainda não foi fornecido.

## Contatos e designs

Configurações públicas ficam em `src/app/core/config/public-config.ts`. WhatsApp e Instagram usam os valores fornecidos pelo usuário; e-mail, endereço, localização, horários e API continuam `null`.

`src/app/core/config/contact-links.ts` centraliza validação do número, montagem do link `wa.me` e mensagens: pedido no cabeçalho, apresentação no hero, encomenda especial, dúvidas e interesse em cada produto com seu nome. A mensagem é codificada com `encodeURIComponent`. Sem número internacional válido, não há URL. Links externos abrem em nova aba com `noopener noreferrer`.

O WhatsApp recebe somente um texto preenchido para o visitante revisar e enviar; o site não envia mensagens nem utiliza API externa.

O Paper é a referência oficial. Como o MCP estava limitado, o usuário forneceu PNGs desktop/mobile para a implementação atual. As fotos foram recortadas dessas exportações e salvas em WebP; substituir pelos arquivos originais quando disponíveis. Fontes Cormorant Garamond e DM Sans são locais, com licenças OFL. Os PNGs @4x ficam fora do build.

Não criar telas, funcionalidades ou fluxos além do solicitado e representado nos designs aprovados. Não há modal de produto nas referências fornecidas. Consulte `AGENTS.md` e `ARCHITECTURE.md`.

## Validação da landing page

- `npm run build`: aprovado, com uma rota estática pré-renderizada.
- `npm test -- --watch=false`: nove testes aprovados (shell, rota/cards, configuração, filtro, preços, validação e codificação de links/mensagens).
- `npm run format:check`: aprovado.
- HTML de produção: seis cards pré-renderizados e dez links WhatsApp contextualizados, além dos dois links Instagram. A primeira entrega também verificou fontes/fotos locais e referências PNG excluídas do build.
- Navegador conferido em 320, 390, 768, 1024 e 1440 px sem overflow horizontal; filtros, menu mobile e âncoras funcionando.
- Pequenos textos sobre fundos rosas usam `brand-text`, uma variação mais escura para contraste. Filtros mobile têm alvos de 44 px.

O teste da rota permite 30 segundos para a primeira compilação do pacote de ícones. Validações completas e limitações estão em `docs/tasks/2026-10-14-telas-paper.md`. Nenhuma publicação foi realizada; comparação exata com CSS do Paper e fotos originais permanece pendente.
