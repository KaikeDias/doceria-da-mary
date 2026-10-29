# Tela de login administrativo

## Objetivo

Implementar a interface responsiva de login administrativo da Doceria da Mary, reproduzindo as referências desktop e mobile, incluindo validação do formulário e estado de carregamento.

## Contexto

O projeto possui uma landing page Angular standalone, Router, renderização estática, Tailwind CSS, daisyUI, Lucide, testes unitários com Vitest e testes em navegador com Playwright. Atualmente, somente a rota `/` está definida; não existem tela de login, backend de autenticação, sessão ou painel administrativo, e `publicConfig.apiUrl` permanece `null`.

As quatro imagens em `public/design/login/` representam variantes da mesma funcionalidade. Devem ser implementadas em uma única tela responsiva, sem criar rotas específicas para erro ou carregamento.

### Referências visuais

| Arquivo em `public/design/login/`            | Viewport      | Estado e elementos de referência                                                                       |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `Login — desktop@1x.png`                     | 1440 × 900 px | Retorno ao site, formulário à esquerda, foto à direita, selo sobre a foto e rodapé administrativo.     |
| `Login — desktop, erros de validação@1x.png` | 1440 × 900 px | E-mail inválido e senha ausente, bordas e mensagens de erro; card cresce para acomodar as mensagens.   |
| `Login — mobile@1x.png`                      | 390 × 844 px  | Card em coluna única, retorno no topo, rodapé abaixo; sem painel fotográfico e sem divisor de coração. |
| `Login — mobile, carregando@1x.png`          | 390 × 844 px  | Campos preenchidos, senha mascarada e botão com indicador e texto “Entrando...”.                       |

As imagens são a referência para composição, tipografia, cores, espaçamento, ícones e hierarquia. O design não determina comportamento assíncrono, destino após autenticação ou regras de sessão; essas lacunas são tratadas pelas decisões de escopo abaixo.

### Assets e decisões de escopo

- Reutilizar `public/logo.png`, `public/images/hero.webp` e as fontes locais Cormorant Garamond e DM Sans. A foto existente corresponde à composição de doces da referência desktop; adequar o recorte com CSS, sem extrair uma nova foto do PNG.
- Os PNGs são referências, não elementos da interface. A exclusão de `design/**` já existe em `angular.json` e deve ser preservada.
- Esta entrega contempla a interface, sua validação e o ciclo de submissão. Autenticação real depende de contrato de API, política de sessão e destino após login, ainda não fornecidos. Não inventar endpoint, usuários, credenciais válidas ou painel.
- Sem integração disponível, uma submissão válida deve terminar com a mensagem de indisponibilidade definida em RN08. O carregamento deve poder ser exercitado nos testes com uma operação assíncrona controlada, sem credenciais de demonstração, serviço externo ou atraso artificial em produção.
- A rota `/login`, a transição entre composições em 1024 px e os comportamentos de validação abaixo são decisões desta especificação para tornar a interface implementável e testável; não foram inferidos como regras do backend.

## Regras de negócio

- RN01: Disponibilizar a tela em `/login`, acessível diretamente, e manter a landing page em `/`. “Voltar ao site” navega para `/` na mesma aba, inclusive quando o usuário abriu `/login` diretamente; não depender do histórico do navegador. Não adicionar entrada de login ao cabeçalho ou rodapé da landing page nesta entrega.
- RN02: Iniciar com e-mail e senha vazios, senha oculta, nenhuma mensagem de erro e botão “Entrar” habilitado para permitir a validação por submissão. Não preencher os exemplos vistos nos designs como dados reais.
- RN03: E-mail e senha são obrigatórios. Remover somente espaços nas extremidades do e-mail antes de validar e encaminhar a submissão; exigir parte local, um único `@` e domínio com pelo menos um ponto, sem espaços e com sufixo não vazio, sem restringir a um provedor específico. O exemplo `mary@email` do design é inválido; `mary@email.com` é válido. Essa validação de formato não verifica a existência do endereço. Preservar a senha exatamente como digitada e exigir apenas que não seja vazia, sem inventar tamanho mínimo ou política de criação de senha.
- RN04: Exibir erro de um campo inválido após ele perder o foco ou após uma tentativa de envio. No envio inválido, exibir todos os erros e focar o primeiro campo inválido na ordem e-mail/senha. Após um erro ficar visível, revalidar esse campo durante a edição e remover a mensagem quando corrigido. Não iniciar submissão com formulário inválido.
- RN05: Usar “Informe seu e-mail para continuar.” para e-mail vazio, “Digite um e-mail válido, como nome@email.com.” para formato inválido e “Informe sua senha para continuar.” para senha vazia. Exibir a mensagem logo abaixo do campo, com ícone e borda de erro, sem depender somente da cor. Os dois erros podem aparecer simultaneamente, como na referência desktop.
- RN06: O controle de olho alterna a senha entre oculta e visível sem alterar seu valor nem enviar o formulário. Seu nome acessível alterna entre “Mostrar senha” e “Ocultar senha”. A senha começa oculta a cada entrada na tela.
- RN07: Uma submissão válida inicia uma única operação assíncrona. Enquanto pendente, exibir indicador e “Entrando...”, desabilitar campos, alternância da senha e botão de envio, e impedir novos envios por clique ou `Enter`. Preservar os valores e não deslocar ou redimensionar o botão. “Voltar ao site” continua disponível; sair da tela não pode causar navegação posterior ou atualização de uma tela destruída.
- RN08: Na ausência de integração, encerrar a submissão com “Login indisponível no momento. Tente novamente mais tarde.”. Uma falha inesperada da operação usa a mesma mensagem, sem detalhes técnicos. Exibir o aviso junto ao formulário, restaurar os controles e “Entrar”, manter o e-mail e limpar/ocultar a senha. Uma nova submissão válida remove o aviso anterior. Não criar sessão, persistir credenciais, sinalizar sucesso ou redirecionar para uma área administrativa nesta etapa.
- RN09: A indicação “Acesso restrito à administração da doceria” é conteúdo informativo da tela. Ela não representa proteção de rotas ou autorização real; não disponibilizar dados ou funcionalidades administrativas com base apenas na validação local do formulário.

## Requisitos funcionais

- RF01: Criar a funcionalidade de login como componente standalone carregado pela rota `/login`, com título de página “Login | Doceria da Mary”. Integrar a rota à renderização estática para que seu HTML seja gerado no build e a tela funcione ao abrir ou recarregar a URL. Preservar a rota e o título existentes da landing page. (RN01)
- RF02: Apresentar logo, título “Bem-vinda de volta!”, subtítulo “Acesse o painel para gerenciar sua doceria”, campos “E-mail” e “Senha”, botão “Entrar” e aviso de acesso restrito, com a grafia dos designs. Usar os placeholders “seuemail@exemplo.com” e “Digite sua senha”. Ícones de envelope, cadeado, olho, seta e escudo devem seguir a identidade das referências. (RN02, RN06, RN09)
- RF03: A partir de 1024 px, usar duas áreas: formulário à esquerda e painel fotográfico à direita. Em 1440 × 900 px, o card branco tem aproximadamente 440 px de largura, padding de 40 px, borda rosa fina, cantos arredondados e sombra suave. A foto ocupa aproximadamente 660 × 860 px, com margem externa de 20 px, moldura rosa e cantos arredondados; ajustar a distribuição em larguras menores sem cortar o formulário. Centralizar o card verticalmente na área disponível, permitindo seu crescimento nos erros.
- RF04: No desktop, incluir o divisor com coração abaixo do subtítulo e o selo sobre a base esquerda da foto com “Feito à mão” e “COM TODO CARINHO”, acompanhado de coração. Reproduzir os círculos decorativos do fundo em CSS. Exibir “Voltar ao site” no topo esquerdo e o rodapé “© {ano atual} Doceria da Mary · Painel administrativo” na base da área esquerda, sem sobrepor o formulário.
- RF05: Abaixo de 1024 px, usar coluna única sem painel fotográfico, selo ou divisor de coração. Em 390 × 844 px, o card tem aproximadamente 350 px de largura, margens laterais de 20 px e padding de 24 px; retorno no topo, logo centralizada, conteúdo do formulário e rodapé “© {ano atual} Doceria da Mary” abaixo do card. Preservar os círculos decorativos nas posições mobile de referência. Não impor altura fixa ao card ou posicionamento que corte conteúdo com erros, teclado virtual ou pouca altura.
- RF06: Usar Cormorant Garamond nos títulos e DM Sans no texto e nos controles. O título principal tem aproximadamente 36 px no desktop e 32 px no mobile; os campos, cerca de 50 px de altura; o botão principal, cerca de 52 px e cantos de cápsula. Manter cores de fundo creme, card branco, texto marrom e ação rosa do tema existente. Usar altura automática e fluxo normal para as mensagens de validação e de indisponibilidade.
- RF07: Implementar formulário semântico com envio por “Entrar” ou `Enter`, tipo e teclado adequados ao e-mail e preenchimento automático `username`/`current-password`. O controle de senha deve ser um botão que não submete o formulário. Implementar validação, alternância, carregamento e retorno de erro conforme RN03–RN08; não depender do balão de validação nativo como única apresentação dos erros.

## Requisitos não funcionais

- RNF01: Reutilizar Angular standalone, OnPush, o tema Tailwind/daisyUI e ícones Lucide locais já instalados. Não adicionar dependências, fontes remotas ou serviços externos para esta interface. Não alterar globalmente o breakpoint ou os estilos da landing page para acomodar o login.
- RNF02: Preservar a saída estática, pré-renderização e hidratação sem acesso indevido a APIs exclusivas do navegador durante o build. Gerar o ano do rodapé a partir do ano corrente da renderização, sem fixar “2026” no componente. A hospedagem deve servir o HTML estático gerado para `/login`; registrar como pendência operacional se isso não puder ser verificado localmente.
- RNF03: Evitar rolagem horizontal em 320, 390, 768, 1024 e 1440 px. Permitir rolagem vertical quando necessária, mantendo todos os controles e mensagens alcançáveis também em viewport baixa, orientação horizontal e zoom de 200%. Recortar decorações, não conteúdo funcional.
- RNF04: Usar um título principal, região principal e labels associados aos campos. Associar erros por `aria-describedby` e indicar `aria-invalid` quando o erro for apresentado. Anunciar carregamento e falha por região viva apropriada e indicar formulário ocupado. Garantir teclado completo, ordem de foco lógica, foco visível, contraste legível e alvos interativos de pelo menos 44 × 44 px. Ícones decorativos, foto lateral e círculos não devem poluir a leitura assistiva; identificar a marca na logo.
- RNF05: Aplicar ao login o padrão existente de hover e foco, com mudança de cor sem alteração de dimensões. Campos/controles desabilitados não aparentam disponibilidade. Respeitar toque e movimento reduzido; neste último, substituir a rotação do indicador por uma indicação estática, preservando o texto de carregamento. Manter o tratamento específico do estado de carregamento sem regressão dos controles existentes.
- RNF06: Não colocar e-mail ou senha na URL, armazenamento local/de sessão, logs ou arquivos estáticos. Manter os valores apenas na memória necessária à interação e descartá-los ao sair. Não usar credenciais ou tokens fixos, nem alterar `publicConfig.apiUrl` para um destino fictício.
- RNF07: Falha de carregamento da foto lateral deve manter formulário e navegação funcionais, com fundo neutro no painel e sem repetição infinita da tentativa. A ausência de foto não deve causar overflow ou mudanças que impeçam o envio.
- RNF08: Cada critério de aceitação deve ter pelo menos um teste automatizado correspondente. Cada unidade de código implementada deve atingir pelo menos 90% de cobertura unitária conforme `AGENTS.md`. Complementar verificações de DOM com testes e inspeção visual em navegador para responsividade, foco e fidelidade aos PNGs.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Abrir ou recarregar `/login` apresenta a tela com título de página correto, campos vazios, senha oculta, “Entrar” habilitado e nenhum erro. “Voltar ao site” leva a `/` na mesma aba, inclusive sem histórico prévio.                                                                                                                                                           |
| CA02 | Em 1440 × 900 px, a composição desktop apresenta card à esquerda, foto/moldura/selo à direita, divisor de coração, decorações, textos e rodapé administrativo conforme a referência. O card acomoda os erros sem sobreposição.                                                                                                                                                  |
| CA03 | Em 390 × 844 px, os estados inicial e carregando seguem as referências mobile: card central com margens, retorno e rodapé, sem foto, selo ou divisor de coração; o botão conserva suas dimensões ao carregar.                                                                                                                                                                   |
| CA04 | Em 320, 390, 768, 1024 e 1440 px, a composição aplica o limite de 1024 px e não gera rolagem horizontal. Em 667 × 375 px e zoom de 200%, erros, campos, retorno e botão continuam alcançáveis por rolagem e teclado.                                                                                                                                                            |
| CA05 | Perder o foco em campo inválido mostra seu erro; enviar vazio mostra ambos e foca o e-mail. `mary@email` com senha vazia reproduz as mensagens do design; `mary@email.com` atende ao formato esperado. Corrigir os campos remove seus erros. Não há submissão inválida; espaços externos do e-mail são removidos e a senha é preservada, sem política de comprimento adicional. |
| CA06 | Acionar o olho por mouse, toque ou teclado alterna tipo e nome acessível sem alterar a senha, disparar envio ou criar erros. Reabrir a tela restaura a senha oculta.                                                                                                                                                                                                            |
| CA07 | Durante operação controlada pendente, há indicador e “Entrando...”, valores preservados, controles de formulário desabilitados e somente uma submissão mesmo com cliques ou `Enter` repetidos. A navegação de retorno continua disponível e sair não provoca efeitos tardios.                                                                                                   |
| CA08 | Sem integração ou quando a operação falha, exibir a mensagem de indisponibilidade, restaurar controles, preservar e-mail e limpar/ocultar senha. A próxima submissão válida limpa o aviso; nenhuma tentativa cria sessão ou redireciona para um painel fictício.                                                                                                                |
| CA09 | Labels, nomes acessíveis, associação/anúncio de erros e carregamento e estado ocupado estão corretos. Em navegador, toda interação funciona por teclado/toque, foco permanece visível e alvos têm pelo menos 44 × 44 px. Hover e movimento reduzido obedecem RNF05, inclusive no botão desabilitado.                                                                            |
| CA10 | A interface reutiliza os assets locais e não publica os designs. Falhar a foto mantém o formulário utilizável sem repetição de erro. Submissões não expõem credenciais em URL, armazenamento, logs ou HTML gerado; `apiUrl` continua sem destino fictício.                                                                                                                      |
| CA11 | Cada CA01–CA10 possui teste correspondente; as unidades implementadas têm pelo menos 90% de cobertura. Testes existentes de landing page, catálogo, modais, animações e hover continuam passando. Build estático gera `/` e `/login` sem erro de hidratação nos testes em navegador; formatação e conferência do diff passam.                                                   |

## Casos de erro

| Caso                                                 | Tratamento esperado                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| E-mail vazio ou somente espaços                      | Mostrar a mensagem de obrigatoriedade quando aplicável, impedir envio e priorizar o foco no e-mail ao submeter. |
| E-mail com formato inválido                          | Mostrar a mensagem de formato definida em RN05; não iniciar a operação.                                         |
| Senha vazia                                          | Mostrar a mensagem de obrigatoriedade; não iniciar a operação.                                                  |
| Ambos inválidos                                      | Exibir as duas mensagens sem encobrir o botão ou o aviso de acesso restrito.                                    |
| Repetição de envio enquanto pendente                 | Ignorar tentativas adicionais até o encerramento da operação.                                                   |
| Integração ausente ou falha inesperada               | Aplicar RN08, sem mostrar exceção, credenciais ou resposta técnica ao usuário.                                  |
| Saída da tela durante carregamento                   | Navegar normalmente e impedir alterações ou redirecionamentos tardios.                                          |
| Foto lateral indisponível                            | Manter painel neutro, formulário e retorno funcionais, conforme RNF07.                                          |
| Viewport reduzida, texto ampliado ou teclado virtual | Permitir rolagem vertical e preservar acesso ao campo ativo, erros e ações.                                     |

## Fora de escopo

- Implementar backend, endpoint de autenticação, transporte de credenciais ou configurar uma API ainda não fornecida.
- Definir credenciais válidas, resultado autenticado, destino pós-login, cookies/tokens, persistência de sessão, logout, autorização ou guards de área administrativa.
- Implementar o painel administrativo, cadastro, recuperação/troca de senha, “lembrar de mim”, login social, autenticação em dois fatores ou CAPTCHA; não há referências fornecidas para esses fluxos.
- Alterar conteúdo, navegação ou comportamento da landing page além de preservar sua convivência com a nova rota.
- Criar rotas separadas para os estados visuais, novas imagens, dependências, commits, MR ou publicação.

## Dependências para autenticação real

Antes de ampliar esta especificação para autenticação funcional, definir o contrato da API e seus erros, mecanismo de sessão, política de segurança, usuários autorizados e destino após sucesso. Essas definições não bloqueiam a implementação da interface descrita; o resultado autorizado desta etapa é a tela com os estados testáveis e o retorno explícito de indisponibilidade.
