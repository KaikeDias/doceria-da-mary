# Implementação das telas do Paper

- Data: 2026-10-14
- Status: Concluído

## Objetivo e contexto

Substituir a página técnica pelas telas existentes no projeto Doceria da Mary no Paper, preservando a logo, composição e placeholders. O usuário forneceu a logo e depois as exportações PNG para permitir a continuação apesar do limite semanal do MCP.

## Referência do Paper

[Doceria da mary — Page 1](https://app.paper.design/file/01M4XR5FJ1E4384A36NWAVTDV8/p-1-0).
Artboards confirmados nos metadados: desktop 1440 × 4303 e mobile 390 × 5740.
Fontes: Cormorant Garamond e DM Sans. Referências locais:
`public/Landing page — Desktop 1440@4x.png` e `public/Landing page — Mobile 390@4x.png`.

## Escopo e fora de escopo

Implementadas apresentação, categorias, catálogo de seis produtos, sobre, encomendas, contato e rodapé. Filtro local por categoria, menu mobile e âncoras.
Sem modal de produto, novas telas, administração, e-commerce, integrações ou contatos reais.

## Plano de implementação

- [x] Inspecionar regras, arquitetura e setup.
- [x] Localizar arquivo e artboards do Paper.
- [x] Conferir logo original.
- [x] Inspecionar exportações desktop/mobile fornecidas.
- [x] Implementar layouts responsivos, catálogo tipado e card reutilizado.
- [x] Validar navegação, filtro, teclado e ausência de overflow.
- [x] Executar build, testes e formatação; atualizar documentação.

## Arquivos impactados

- `src/app/features/home/home.ts`, `home.html`, `home.css`.
- `src/app/features/catalog/catalog.ts`, `catalog.spec.ts`, `product-card.ts`, `product-card.css`.
- `src/app/app.spec.ts`, `src/styles.css`, `angular.json`.
- `public/images/*.webp`, `public/fonts/*.woff2` e licenças.
- README, ARCHITECTURE e documentos em docs.

## Critérios de aceitação

Composição desktop/mobile reproduzida, logo original, interações representadas funcionando, contatos seguros e centralizados, geração estática mantida, build e testes aprovados.

## Validação e resultados

- `npm run build`: aprovado, uma rota pré-renderizada, sem warnings no build final.
- `npm test -- --watch=false`: dois arquivos, cinco testes aprovados; shell, rota/cards, filtro, preços e contatos nulos.
- `npm run format:check`: aprovado.
- Assertions no HTML gerado: seis cards, conteúdo pré-renderizado, sem destinos wa.me, fontes e fotos locais presentes, referências @4x excluídas da publicação.
- Navegador em 320, 390, 768, 1024 e 1440 px: largura de conteúdo não excede viewport; uma, duas ou três colunas conforme largura.
- Filtro Bolos mostrou somente os dois bolos; Todos restaurou seis produtos.
- Menu mobile abriu, fechou ao navegar e respondeu a Escape; âncoras e foco visível verificados.
- Revisão visual de hero, categorias, cardápio, sobre, encomendas, contato e rodapé: hierarquia e alinhamento preservados.
- Pequenos textos sobre superfícies rosas usam o token mais escuro `brand-text` para contraste; filtros mobile têm alvos de 44 px.
- Ao recarregar diretamente em #sobre, Angular em desenvolvimento avisou que a foto lazy foi LCP. Na entrada inicial a foto principal tem prioridade alta; imagens abaixo da dobra continuam lazy.

## Decisões, riscos e bloqueios

O bloqueio do MCP foi resolvido para esta implementação pelas exportações fornecidas pelo usuário. Sem CSS/protótipos exportados, valores visuais são aproximações das imagens, não medidas verificadas no Paper. Fotos são recortes de imagens já renderizadas, sem resolução/composição dos arquivos originais.

Fontes foram obtidas do repositório oficial Google Fonts, convertidas para WOFF2 com subconjunto latino e licenças preservadas. Nenhuma dependência de aplicação adicionada.
O Tailwind escaneia somente src para evitar classes de ferramentas locais. Budget de CSS por componente ajustado de 4/8 kB para 10/12 kB porque a folha de uma página com sete seções usa cerca de 9,3 kB; orçamento inicial permanece 500 kB/1 MB.

## Pendências e próximos passos

Revisão do usuário, conferência dos estilos quando Paper estiver disponível, fotos originais, contatos e hospedagem. Nenhuma publicação foi realizada.
