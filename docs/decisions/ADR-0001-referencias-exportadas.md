# ADR-0001 — Referências exportadas e assets locais

- Data: 2026-10-14
- Status: Adotada para a implementação atual

## Contexto

O MCP do Paper atingiu o limite semanal e não permitiu obter JSX/CSS. O usuário forneceu os layouts desktop/mobile em PNG e a logo original, autorizando a continuação.

## Alternativas consideradas

Aguardar o MCP, inventar uma composição, ou reproduzir as exportações fornecidas com assets locais.

## Decisão

Usar as exportações como referência visual, preservar a logo e extrair as fotos nelas representadas para WebP. Usar Cormorant Garamond e DM Sans locais em WOFF2 com licenças. Excluir os PNGs de referência do build estático, mantendo-os no workspace.

## Justificativa

Permite concluir o escopo visual autorizado sem novas telas, fotos inventadas ou serviços externos em tempo de execução.

## Consequências

O CSS aproxima as exportações e precisa ser conferido quando os valores do Paper estiverem acessíveis. Os recortes não substituem as fotos originais. Contatos continuam nulos e CTAs desabilitados. Nenhuma biblioteca de aplicação foi adicionada.
