# Landing lendo as configurações do site

## Objetivo

Fazer a landing page (`/`) exibir as informações salvas em Painel › Configurações (`configuracoes_site`), para que o aviso "O site já mostra as novas informações." seja verdadeiro.

## Contexto

Hoje a landing usa textos fixos no HTML e o contato de `src/app/core/config/public-config.ts` (RN12 de `catalogo-publico-supabase`). A tela de edição está em `specs/configuracoes-site-admin`, que também cria `SiteConfigRepository.load()`.

No banco, `whatsapp` e `instagram` da linha de configurações estão nulos; os valores reais estão só em `public-config.ts` (`5589994259584` e `doceriadamarypl`).

Esta especificação **substitui** a RN12 e o item "Configurações do site vindas do banco" do fora de escopo de `catalogo-publico-supabase`. Layout, animações e o restante daquela spec continuam valendo.

## Regras de negócio

- RN01: A casca da landing continua pré-renderizada. As configurações são buscadas **no navegador** ao abrir a página, junto com o cardápio, mas em leitura separada: falha nas configurações não afeta o cardápio, e vice-versa.
- RN01a: _Substituída em parte por `specs/seo-landing` (RN09): só número, @ e links de contato continuam com skeleton; os demais conteúdos usam os valores padrão enquanto carregam._ **Carregando**: enquanto as configurações não chegam, cada conteúdo vindo delas (RN03, número e @ do contato) aparece como bloco de skeleton com o tamanho aproximado do conteúdo, para o texto não trocar na frente do cliente. Os botões de WhatsApp e Instagram ficam indisponíveis (sem link) até carregar.
- RN02: Se a leitura falhar, os skeletons dão lugar aos valores padrão (os textos e contatos atuais), sem mensagem de erro. Campo nulo no banco também usa o valor padrão.
- RN03: Mapeamento:
  - `nome_doceria` → nome no cabeçalho, no rodapé, no `aria-label` do link de início e na linha "© 2026 {nome}. Feito com carinho.";
  - `texto_apresentacao` → texto pequeno abaixo do nome no cabeçalho;
  - `descricao` → frase da direita no rodapé;
  - `logo_path` → logo do cabeçalho e do rodapé (padrão `logo.png`);
  - `hero_titulo`, `hero_subtitulo` → título e texto do topo;
  - `hero_imagem_path` → foto do topo (padrão `images/hero.webp`), com texto alternativo "Doces da {nome}" quando for uma imagem enviada;
  - `sobre_texto` → primeiro parágrafo da seção "Sobre nós" (o segundo parágrafo e as etiquetas continuam fixos);
  - `cta_encomendas_titulo` → título da faixa de encomendas.
- RN04: Os títulos vindos do banco são exibidos como texto corrido: as quebras de linha fixas (`<br>`) do título do topo e da faixa de encomendas deixam de existir.
- RN05: **WhatsApp**: o banco guarda DDD + número; o link usa `55` + esses dígitos. O número exibido no cartão de contato fica "+55 (89) 99425-9584". Sem número válido, os botões continuam desabilitados como hoje.
- RN06: **Mensagem padrão**: `mensagem_whatsapp` passa a ser o texto de todos os botões gerais ("Fazer pedido"/"Pedir", botão do topo, "Fazer uma encomenda" e cartão de contato). O botão de cada produto mantém a mensagem atual com o nome do produto.
- RN07: **Instagram**: o banco guarda só o usuário; o link é `https://www.instagram.com/{usuario}/` e o texto exibido, `@{usuario}`.
- RN08: Migration de dados: preencher `whatsapp = '89994259584'` e `instagram = 'doceriadamarypl'` na linha `id = 1` somente se estiverem nulos.
- RN09: `public-config.ts` deixa de ser a fonte do contato: os valores padrão passam a ficar junto de `SiteConfig` (mesmo formato do banco), e `contact-links.ts` passa a receber número e mensagem.

## Requisitos funcionais

- RF01: Migration de dados conforme RN08.
- RF02: Valores padrão de `SiteConfig` (iguais aos textos atuais da landing e ao contato de `public-config.ts`, no formato do banco). (RN01, RN02, RN09)
- RF03: `Home` com estado de carregamento das configurações e um signal atualizado por `SiteConfigRepository.load()` em `afterNextRender`, independente do cardápio; skeletons enquanto carrega. (RN01–RN03)
- RF04: `whatsappUrl(phone, message)` monta `wa.me/55…`; `productWhatsappUrl` usa o número das configurações; remover `whatsappMessages` gerais substituídos pela mensagem padrão. (RN05, RN06)
- RF05: Template da landing ligado ao signal (RN03, RN04, RN07). Remover `public-config.ts` se ficar sem uso e ajustar os testes que o usam. (RN09)

## Requisitos não funcionais

- RNF01: Sem chamada ao banco no build; o HTML pré-renderizado mostra os skeletons no lugar dos conteúdos das configurações (o título principal deixa de estar no HTML estático).
- RNF02: Sem dependências novas.
- RNF03: Testes unitários com `SiteConfigRepository` falso; Playwright com `/rest/v1/configuracoes_site` simulado; os testes existentes da landing continuam válidos. Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Com o banco respondendo, nome, apresentação, descrição, logo, título, subtítulo, foto do topo, texto "Sobre nós" e título de encomendas vêm das configurações.                    |
| CA02 | Os botões gerais abrem `wa.me/55{whatsapp}` com `mensagem_whatsapp`; o botão do produto usa o mesmo número com a mensagem do produto; o cartão mostra "+55 (…) …".                |
| CA03 | Instagram leva a `https://www.instagram.com/{usuario}/` e mostra `@{usuario}`.                                                                                                    |
| CA04 | Enquanto carrega, aparecem os skeletons e os botões de contato ficam sem link; com falha na leitura ou campos nulos, aparecem os valores padrão e o cardápio carrega normalmente. |
| CA05 | Logo e foto do topo nulas usam `logo.png` e `images/hero.webp`; enviadas, usam a URL pública do bucket `site`.                                                                    |
| CA06 | A migration preenche WhatsApp e Instagram apenas quando nulos.                                                                                                                    |
| CA07 | Build estático da `/` com os skeletons e sem chamada ao banco; testes unitários e Playwright passam; cobertura ≥ 90%.                                                             |

## Casos de erro

| Caso                               | Tratamento esperado                      |
| ---------------------------------- | ---------------------------------------- |
| Sem internet / Supabase fora do ar | Valores padrão; cardápio segue sua spec. |
| Imagem enviada não carrega         | Comportamento padrão do navegador.       |
| WhatsApp inválido no banco         | Botões desabilitados como hoje (RN05).   |

## Fora de escopo

- Exibir na landing e-mail, horário, região, endereço e texto sobre encomendas (não há lugar para eles no design atual da landing; ficam salvos no banco para uso futuro).
- Meta tags e prévia de compartilhamento com a `descricao` (exigem renderizar com os dados do banco no servidor).
- Alterar layout, animações ou hover existentes.
