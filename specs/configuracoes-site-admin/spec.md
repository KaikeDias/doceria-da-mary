# Painel › Configurações do site

## Objetivo

Liberar a tela `/admin/configuracoes` para a Mary editar e salvar no Supabase as informações do site: identidade, contato, atendimento e conteúdo da landing page.

## Contexto

O item "Configurações" do menu do painel está indisponível ("em breve") por falta de design. Os designs agora existem.

O banco já tem a tabela `configuracoes_site` (linha única `id = 1`, leitura pública, atualização só para admin), criada em `20261030041002_schema_inicial.sql`, com os dados iniciais preenchidos, exceto `whatsapp`, `instagram`, `email_contato`, `endereco`, `logo_path` e `hero_imagem_path`, que estão nulos. Restrições do banco:

- `whatsapp`: só dígitos, DDD + número, 10 ou 11 dígitos (sem o 55).
- `instagram`: só o usuário, `^[A-Za-z0-9._]{1,30}$`.
- `email_contato`: formato de e-mail.
- `hero_titulo`: não vazio.
- Imagens no bucket `site` (público, JPG/PNG/WEBP, até 5 MB, escrita só para admin).

O que a landing passa a ler dessas configurações está em `specs/landing-configuracoes-supabase`. Esta spec trata só da tela do painel e da gravação.

Esta especificação **substitui**, em `painel-admin-cardapio`, o item "Configurações" indisponível do menu.

### Referências visuais

| Arquivo em `public/design/configuracoes/`   | Conteúdo                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Configurações — desktop@1x.png`            | Tela completa, sem alterações pendentes (botão "Salvar alterações" apagado).                      |
| `Configurações — mobile@1x.png`             | 390 px: atalhos das seções em linha rolável, campos em uma coluna, barra inferior fixa.           |
| `Configurações — erros de validação@1x.png` | Aviso "Falta corrigir 4 campos antes de salvar." e erros de WhatsApp, Instagram, e-mail e título. |
| `Configurações — salvando@1x.png`           | Barra inferior com "Salvando alterações…" e botão "Salvando…" com indicador.                      |
| `Configurações — falha ao salvar@1x.png`    | Aviso no topo com "Tentar de novo"; alterações mantidas.                                          |
| `Configurações — salvo com sucesso@1x.png`  | Aviso verde no canto superior direito e "Tudo salvo" na barra inferior.                           |

## Regras de negócio

- RN01: **Acesso**: o item "Configurações" do menu do painel passa a ser um link para `/admin/configuracoes` (título da aba "Configurações | Painel Doceria da Mary"), destacado quando ativo, como os demais.
- RN02: **Cabeçalho**: título "Configurações do site" e subtítulo "Atualize as informações que seus clientes encontram na landing page.".
- RN03: **Atalhos "Nesta página"**: links numerados para as quatro seções (Identidade, Contato, Atendimento, Conteúdo do site). No desktop, coluna fixa à esquerda do formulário; no mobile (< 1024 px), linha de atalhos com rolagem horizontal acima do formulário.
- RN04: **Carregamento**: a tela lê a linha de `configuracoes_site` ao abrir. Enquanto carrega e em caso de falha, segue o mesmo padrão da tela de Categorias (estado de carregamento; mensagem de carregamento da spec base com "Tentar de novo").
- RN05: **Seção 1 — Identidade da doceria** ("Como a sua marca aparece no topo e no rodapé do site."):
  - Logo: miniatura redonda, "Trocar logo", "Remover" e a ajuda "PNG ou JPG quadrado, até 2 MB. Fundo transparente fica melhor.".
  - Nome da doceria (`nome_doceria`).
  - Texto de apresentação (`texto_apresentacao`), ajuda "Frase curta que aparece abaixo do nome, no topo do site.".
  - Descrição sobre a doceria (`descricao`), até 160 caracteres, ajuda "Aparece no rodapé e quando alguém compartilha o link do site. {n}/160".
- RN06: **Seção 2 — Contato** ("Para onde vão os clientes quando tocam nos botões do site."):
  - Número de WhatsApp (`whatsapp`): prefixo fixo "+55" e máscara "(11) 98765-4321"; ajuda "Com DDD. É o número que recebe os pedidos.".
  - Instagram (`instagram`): prefixo fixo "instagram.com/"; ajuda "Pode colar o link inteiro ou só o @ do perfil.".
  - E-mail de contato (`email_contato`), marcado "(opcional)", placeholder "contato@exemplo.com".
  - Mensagem padrão do WhatsApp (`mensagem_whatsapp`), ajuda "Usada nos botões gerais, como “Fazer pedido”. Nos botões de cada doce, o nome do produto entra automaticamente.".
- RN07: **Prévia do WhatsApp**: ao lado da mensagem (abaixo dela no mobile), um cartão com a logo, o nome da doceria, o número formatado "+55 (11) 98765-4321", um balão com a mensagem e "agora", e a legenda "Prévia de como o cliente envia a mensagem.". Atualiza enquanto se digita.
- RN08: **Seção 3 — Informações de atendimento** ("Ajuda o cliente a saber quando e onde você atende."):
  - Horário de atendimento (`horario_atendimento`).
  - Cidade ou região atendida (`regiao_atendida`).
  - Endereço (`endereco`), marcado "(opcional)", placeholder "Rua, número e bairro", ajuda "Deixe em branco se você não recebe clientes no local.".
  - Texto sobre encomendas (`texto_encomendas`), até 300 caracteres, ajuda "Antecedência, retirada, entrega… o que for importante saber antes de pedir. {n}/300".
- RN09: **Seção 4 — Conteúdo da landing page** ("Os textos e a foto principal das seções do site."):
  - Título principal (`hero_titulo`), até 70 caracteres, ajuda "A primeira frase que o cliente lê. {n}/70".
  - Subtítulo (`hero_subtitulo`).
  - Imagem principal (`hero_imagem_path`): prévia, "Trocar imagem", "Remover" e a ajuda "Foto na horizontal, com pelo menos 1600 px de largura. Até 5 MB.".
  - Texto da seção “Sobre nós” (`sobre_texto`).
  - Título da chamada para encomendas (`cta_encomendas_titulo`), ajuda "A faixa rosada que convida para encomendas especiais.".
- RN10: **Campos obrigatórios**: todos os campos de texto, exceto os marcados "(opcional)" (e-mail e endereço). Vazio (após ignorar espaços nas pontas) → "Preencha este campo."; para o título principal, "O título principal não pode ficar vazio.". Campos opcionais vazios são gravados como nulo.
- RN11: **Validações de formato**:
  - WhatsApp: aceita só dígitos (máximo 11); ao colar um número com 12 ou 13 dígitos começando por 55, o 55 é descartado. Com menos de 10 dígitos → "Número incompleto. Use DDD + número, como (11) 99999-9999.". Grava só os dígitos.
  - Instagram: ao validar, remove `https://`, `www.`, `instagram.com/`, `@`, barras e parâmetros, ficando só o usuário. Fora de `^[A-Za-z0-9._]{1,30}$` → "Use só letras, números, ponto ou _, sem espaços.".
  - E-mail, quando preenchido, fora do formato `nome@dominio.ext` → "Confira o e-mail, como nome@exemplo.com.".
  - Os campos com limite (RN05, RN08, RN09) não aceitam digitar além dele.
- RN12: **Imagens**: escolhidas por "Trocar logo" / "Trocar imagem". Logo: PNG ou JPG, até 2 MB. Imagem principal: JPG, PNG ou WEBP, até 5 MB. Erros, abaixo da imagem, com o arquivo descartado: acima do limite → "Essa imagem passa de {2|5} MB. Escolha uma foto menor."; outro tipo → "Envie uma imagem PNG ou JPG." (logo) / "Envie uma imagem JPG, PNG ou WEBP." (principal). A imagem escolhida aparece na prévia na hora, mas só é enviada ao salvar.
- RN13: **Remover imagem**: volta para a imagem padrão do site (`logo.png` / `images/hero.webp`), mostrada na prévia. Quando a imagem já é a padrão, "Remover" não aparece.
- RN14: **Alterações pendentes**: a tela compara os valores atuais com os carregados. A barra inferior fixa mostra:
  - sem diferenças: "Nenhuma alteração pendente" e "Salvar alterações" desabilitado;
  - com diferenças: "● Alterações não salvas · o site ainda mostra a versão anterior" (no mobile, só "● Alterações não salvas") e "Salvar alterações" habilitado;
  - gravando: "Salvando alterações…" (RN16);
  - logo após salvar com sucesso, até a próxima alteração: "✓ Tudo salvo".
  - A barra também tem "Visualizar site", que abre `/` em nova aba (no mobile, só o ícone, com nome acessível "Visualizar site (abre em nova aba)").
- RN15: **Salvar com erros**: nada é gravado; aparece no topo do formulário o aviso "Falta corrigir {n} campos antes de salvar." ("1 campo"), os campos inválidos ficam em vermelho com a mensagem abaixo, e o foco vai para o primeiro campo inválido na ordem da tela. A partir daí, os erros e a contagem são recalculados enquanto se digita; o aviso some quando não houver mais erros.
- RN16: **Gravando**: campos, botões de imagem e "Salvar alterações" ficam bloqueados; o botão mostra o indicador e "Salvando…".
- RN17: **Ordem da gravação**: (1) envia as imagens novas para `site/configuracoes/<logo|hero>-<uuid>.<extensão>`; (2) atualiza a linha `id = 1` com todos os campos (textos sem espaços nas pontas, opcionais vazios como nulo, caminhos das imagens ou nulo quando removidas); (3) apaga do bucket os arquivos anteriores que foram trocados ou removidos. Falha ao apagar arquivo antigo, ou ao apagar um arquivo enviado quando o passo 2 falha, só é registrada no console.
- RN18: **Sucesso**: os valores salvos passam a ser os carregados (sem alterações pendentes), a barra mostra "✓ Tudo salvo" e aparece o aviso verde no canto superior direito "Alterações salvas! O site já mostra as novas informações." com botão × para fechar, no mesmo padrão de aviso das outras telas do painel.
- RN19: **Falha** (passo 1 ou 2): os valores digitados continuam na tela e aparece no topo do formulário o aviso "Não conseguimos salvar agora. Suas alterações continuam aqui. Verifique a internet e tente de novo." com o botão "Tentar de novo", que repete a gravação. O aviso some na próxima tentativa.

## Requisitos funcionais

- RF01: `SiteConfig` (modelo com os campos da tabela, imagens como URL pública ou vazio) e `SiteConfigRepository` com `load()` e `save(config, images)` e implementação Supabase, em `src/app/core/config/`. `load()` também será usado pela landing (`specs/landing-configuracoes-supabase`). (RN04, RN17)
- RF02: Funções puras de normalização e validação (WhatsApp, Instagram, e-mail, obrigatórios, limites) e de formatação do telefone. (RN10, RN11, RN07)
- RF03: Componente `Configuracoes` (`src/app/features/admin/configuracoes.ts/html`) com o formulário em signals, prévia do WhatsApp, imagens, atalhos, barra inferior, avisos e estados. (RN02–RN19)
- RF04: Rota `admin/configuracoes` e link no menu do painel (desktop e gaveta mobile). (RN01)
- RF05: Tipos do banco (`database.types.ts`) conferidos para `configuracoes_site`; sem migration nesta spec.

## Requisitos não funcionais

- RNF01: Sem dependências novas; Tailwind/daisyUI e Lucide já instalados; reaproveitar `check`, `publicUrl`, `saveError`/`loadError` e o padrão de envio/remoção de arquivos do repositório do cardápio.
- RNF02: Acessibilidade: cada campo com `<label>`; erros com `aria-invalid` e mensagem ligada por `aria-describedby`; aviso de erros e de falha em `role="alert"`; aviso de sucesso e texto da barra em `role="status"`; seções com títulos (`h2`) e `aria-labelledby`; alvos ≥ 44 × 44 px no mobile.
- RNF03: URL `blob:` da imagem escolhida revogada ao trocar/remover a imagem e ao sair da tela.
- RNF04: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px; a barra inferior não cobre o último campo.
- RNF05: Testes unitários com repositório falso; implementação Supabase com `fetch` falso; Playwright com `/rest/v1` e `/storage/v1` simulados. Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | O menu do painel leva a `/admin/configuracoes`, destacado como ativo; a tela mostra cabeçalho, atalhos e as quatro seções preenchidas com os valores do banco.                                      |
| CA02 | Carregando e falha na leitura seguem o padrão de Categorias; "Tentar de novo" repete a leitura.                                                                                                     |
| CA03 | Sem alterações, "Nenhuma alteração pendente" e "Salvar alterações" desabilitado; ao editar, aparece "Alterações não salvas…"; desfazer a edição volta ao estado sem alterações.                     |
| CA04 | Contadores de descrição (160), encomendas (300) e título (70) atualizam e bloqueiam o excesso; a prévia do WhatsApp atualiza com nome, número e mensagem.                                           |
| CA05 | Salvar com WhatsApp incompleto, Instagram com espaço, e-mail inválido e título vazio mostra "Falta corrigir 4 campos antes de salvar.", as quatro mensagens, foco no WhatsApp e não grava nada.     |
| CA06 | Campo obrigatório vazio mostra "Preencha este campo."; e-mail e endereço vazios são aceitos e gravados como nulo.                                                                                   |
| CA07 | Colar "https://www.instagram.com/doceriadamary/" grava `doceriadamary`; colar "+55 (11) 98765-4321" grava `11987654321`.                                                                            |
| CA08 | Logo acima de 2 MB, logo WEBP, imagem principal acima de 5 MB e imagem principal GIF mostram as mensagens de RN12 e descartam o arquivo.                                                            |
| CA09 | Trocar logo e imagem principal e salvar envia os arquivos ao bucket `site`, grava os caminhos e apaga os anteriores; "Remover" grava nulo, volta à imagem padrão e apaga o arquivo anterior.        |
| CA10 | Durante a gravação aparecem "Salvando alterações…" e "Salvando…" e tudo fica bloqueado; com sucesso aparecem o aviso verde (fechável) e "✓ Tudo salvo".                                             |
| CA11 | Com falha na gravação, os valores continuam na tela e aparece o aviso com "Tentar de novo", que repete a gravação e, com sucesso, mostra o aviso verde.                                             |
| CA12 | "Visualizar site" abre `/` em nova aba; os atalhos levam às seções.                                                                                                                                 |
| CA13 | Em 390 px a tela segue a referência mobile (atalhos roláveis, uma coluna, prévia abaixo da mensagem, barra inferior fixa com ícone e botão largo); acessibilidade de RNF02; sem rolagem horizontal. |
| CA14 | Cobertura ≥ 90% por unidade; testes unitários, Playwright, build e formatação passam.                                                                                                               |

## Casos de erro

| Caso                                      | Tratamento esperado                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Sem internet ao abrir a tela              | Estado de erro de carregamento (RN04).                                   |
| Sem internet ou sessão expirada ao salvar | Aviso de falha com "Tentar de novo"; nada se perde (RN19).               |
| Storage recusa a imagem                   | Falha de gravação (RN19); a linha não é alterada.                        |
| Banco recusa um valor (check)             | Falha de gravação (RN19). Não deve ocorrer com a validação de RN10/RN11. |
| Falha ao apagar arquivo antigo ou órfão   | Só registro no console (RN17).                                           |
| Linha `id = 1` ausente                    | Tratado como falha de carregamento.                                      |

## Fora de escopo

- Exibir na landing os campos lidos (ver `specs/landing-configuracoes-supabase`).
- Validar largura mínima ou proporção das imagens (a ajuda de 1600 px é só orientação), recortar ou comprimir imagens.
- Arrastar e soltar imagens.
- Aviso de alterações não salvas ao sair da tela.
- Destacar o atalho da seção visível durante a rolagem.
- Trocar a logo do próprio painel (continua `logo.png`).
- Histórico de versões ou desfazer depois de salvar.
