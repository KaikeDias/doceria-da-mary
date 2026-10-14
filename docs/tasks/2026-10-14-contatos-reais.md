# Contatos reais e mensagens por contexto

- Data: 2026-10-14
- Status: Concluído

## Objetivo e contexto

O usuário forneceu Instagram e WhatsApp reais e autorizou ativar os contatos existentes, com mensagens personalizadas de acordo com o CTA.

## Escopo e plano

- [x] Atualizar configuração central com os valores fornecidos.
- [x] Centralizar geração de links wa.me, validação de número e mensagens.
- [x] Trocar ações desabilitadas por links sem alterar a composição visual.
- [x] Incluir nome do produto nas mensagens dos cards.
- [x] Atualizar testes, README, arquitetura e status; validar build e formatação.

## Arquivos impactados

Configuração e helper em core/config; Home e ProductCard; testes correspondentes; documentação.

## Critérios e validação planejada

Todos os CTAs WhatsApp usam o mesmo número com textos codificados e contextualizados. Instagram aponta ao perfil fornecido. Verificar ausência de números/URLs duplicados, mensagens por origem, caracteres especiais, número ausente/inválido, seis cards, build SSG e testes.

## Limites

Somente links de contato; não enviar mensagens, integrar API, mudar catálogo demonstrativo ou publicar alterações automaticamente.

## Resultado e decisões

Os dez CTAs WhatsApp usam o número centralizado e mensagens distintas: pedido no cabeçalho, apresentação no hero, encomenda especial, dúvidas e seis mensagens incluindo o nome do produto. Os dois links Instagram usam a configuração pública. Número e perfil são exibidos como telefone formatado e @ do perfil, derivados da mesma configuração. Links externos abrem em nova aba com noopener/noreferrer e labels acessíveis.

Sem número válido, o helper retorna null e os links não recebem href. E-mail, endereço, localização, horários e API permanecem null.

## Validação e resultados

- `npm test -- --watch=false`: três arquivos, nove testes aprovados, incluindo número ausente/inválido, codificação de acentos/caracteres reservados, nome do produto e integração dos links na rota.
- `npm run build`: aprovado, uma rota pré-renderizada.
- `npm run format:check` e `git diff --check`: aprovados.
- Assertions no HTML de produção: dez links WhatsApp para o mesmo número, dez mensagens distintas e dois links Instagram corretos.
- Navegador local: destinos/textos de todos os links conferidos pelo DOM e seção Contato revisada visualmente, com telefone e perfil corretos.

Nenhuma mensagem foi enviada. Não foi realizado teste de envio ou autenticação dentro dos aplicativos WhatsApp/Instagram. Documentos atualizados: README, ARCHITECTURE, PROJECT_STATUS e este registro.

## Versionamento solicitado

O usuário solicitou commits e push após a implementação. Plano: revisar diff, criar um commit da implementação com testes e outro de documentação; enviar main sem force push e confirmar sincronização com origin/main. Build e nove testes já aprovados; sem mudança funcional nesta etapa.

Revisão e verificações de whitespace/formatação aprovadas. `git fetch origin` confirmou a base sincronizada antes dos commits. Implementação e testes registrados em `6764005`; README, arquitetura, status e este registro compõem o commit separado de documentação. Push e confirmação dos hashes local/remoto são a última etapa operacional após os commits.
