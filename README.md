# Doceria da Mary

Landing page responsiva de uma doceria artesanal, implementada a partir dos layouts desktop/mobile exportados do Paper. Inclui apresentação, categorias, cardápio demonstrativo com seis produtos e filtros, modais de detalhes, sobre, encomendas e contato. WhatsApp e Instagram estão ativos com os dados fornecidos pela proprietária. Não há administração, backend ou e-commerce.

## Stack instalada

- Angular, Router, CLI e build: 22.2.2, standalone, OnPush e zoneless.
- TypeScript: 6.0.3, com strict e strictTemplates.
- Tailwind CSS / PostCSS plugin: 4.3.3; PostCSS: 8.5.30.
- daisyUI: 5.7.50, apenas o tema claro `doceria-mary`.
- Lucide: `@lucide/angular` 1.57.0, com importação individual.
- Vitest e cobertura V8: 5.0.4; jsdom: 30.1.2; Playwright: 1.64.1; Prettier: 3.9.10.
- RxJS: 7.8.2; tslib: 2.8.1.

As versões efetivas estão fixadas pelo `package-lock.json`. Foi usado o pacote atual oficial do Lucide porque o legado `lucide-angular` limita seus peers ao Angular 21. TypeScript 7 ainda não é compatível: Angular 22.2 exige TypeScript >=6.0 e <6.1.

## Pré-requisitos

Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm >=11.
Validações recentes executadas com Node 26.5.0 e npm >=11. Os testes em navegador usam Google Chrome instalado.

## Comandos

```sh
npm ci
npm start
npm test -- --watch=false --coverage
npm run test:e2e
npm run format:check
npm run format
npm run build
```

O servidor de desenvolvimento atende em `http://localhost:4200`.
O build padrão é de produção. Os testes unitários usam o builder Angular com Vitest. `npm run test:e2e` inicia a aplicação em `http://127.0.0.1:4201` e executa os testes Playwright no Chrome.
Não há ferramenta de lint instalada; a formatação é verificada com Prettier.

## Estrutura existente

```text
public/                            # logo, fotos WebP, fontes, ícones e referências
specs/                             # spec.md e tasks.md por funcionalidade
tests/browser/                     # regressões Playwright de UI, hover e animações
src/
  app/
    core/config/public-config.ts   # contatos públicos e placeholders restantes
    core/config/contact-links.ts   # links WhatsApp e mensagens por contexto
    features/home/                 # landing page, filtros e seções responsivas
    features/catalog/              # dados, preços, cards e diálogo de detalhes
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

Documentação de progresso em `docs/PROJECT_STATUS.md`, especificações/tarefas por funcionalidade em `specs/`, histórico de entregas em `docs/tasks/` e decisões em `docs/decisions/`. UI compartilhada e administração serão criadas somente quando necessárias.

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

O Paper é a referência oficial. Como o MCP estava limitado, o usuário forneceu PNGs desktop/mobile para a implementação atual. As fotos foram recortadas dessas exportações e salvas em WebP; substituir pelos arquivos originais quando disponíveis. Fontes Cormorant Garamond e DM Sans são locais, com licenças OFL. Todas as referências em `public/design/landing-page/`, incluindo os modais desktop/mobile, ficam fora do build.

Os modais de preço fixo e variável seguem os designs fornecidos, com galeria quando há fotos adicionais, informações opcionais e pedido pelo WhatsApp. Cada produto real ainda possui uma foto; informações comerciais não confirmadas são omitidas. Consulte `AGENTS.md`, `ARCHITECTURE.md` e as especificações em `specs/`.

O padrão visual usa Tailwind para layout, espaçamento, tipografia, responsividade e hover; DaisyUI para botões, modal e estados. CSS específico fica restrito ao tema/fontes, personalizações compartilhadas e animações necessárias.

## Validação da landing page

- `npm run build`: aprovado, com uma rota estática pré-renderizada.
- `npm test -- --watch=false --coverage`: 30 testes aprovados; cobertura global de 99,8% de statements e 100% de linhas.
- `npm run test:e2e`: 21 testes aprovados no Chrome, cobrindo detalhes, teclado/foco, rolagem, hover, animações, toque e movimento reduzido.
- `npm run format:check`: aprovado.
- HTML de produção: seis cards pré-renderizados, modal inicialmente fechado, contatos contextualizados e assets locais; designs excluídos da publicação.
- Layout conferido em 320, 390, 768, 1024 e 1440 px, sem overflow horizontal; página e modais comparados visualmente antes/depois da refatoração.

As evidências por funcionalidade estão nos arquivos `specs/*/tasks.md`. Os registros de outubro de 2026 em `docs/tasks/` descrevem entregas anteriores. Firefox e Safari não foram executados; fotos originais, fotos adicionais e confirmação das informações comerciais permanecem pendentes. Nenhuma publicação em hospedagem foi realizada.
