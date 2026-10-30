# Hospedagem na Vercel

## Objetivo

Configurar a publicação do build estático na Vercel, com as rotas do app funcionando ao abrir o endereço diretamente e endereços inexistentes respondendo 404.

## Contexto

O build (`outputMode: static`) gera `dist/doceria-da-mary/browser/` com a `/` pré-renderizada (`index.html`) e `index.csr.html` para as rotas renderizadas no cliente. `ARCHITECTURE.md` exige que a hospedagem sirva `index.csr.html` em `/login` e `/admin/**`. A página "não encontrada" (`specs/pagina-nao-encontrada`) existe no app, mas o status HTTP depende da hospedagem. A hospedagem escolhida é a Vercel, sem domínio próprio.

## Regras de negócio

- RN01: `/login`, `/admin` e `/admin/**` respondem 200 com `index.csr.html`.
- RN02: A `/` e os arquivos do build são servidos como estão.
- RN03: Qualquer outro caminho responde **404** com o mesmo app (`404.html`, cópia de `index.csr.html`), que mostra a página "não encontrada".

## Requisitos funcionais

- RF01: `vercel.json` com comando de build, diretório de saída e os `rewrites` de RN01. (RN01, RN02)
- RF02: O comando de build da Vercel copia `index.csr.html` para `404.html`. (RN03)

## Requisitos não funcionais

- RNF01: Sem dependências novas; `npm run build` local continua igual.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------ |
| CA01 | `vercel.json` define build, saída `dist/doceria-da-mary/browser` e rewrites de `/login` e `/admin/**`. |
| CA02 | Na Vercel, abrir `/admin/cardapio` e `/login` diretamente carrega o app (200).                         |
| CA03 | Na Vercel, `/caminho-inexistente` responde 404 e mostra "Página não encontrada".                       |

## Casos de erro

| Caso                        | Tratamento esperado                                      |
| --------------------------- | -------------------------------------------------------- |
| Rota nova adicionada ao app | Precisa de rewrite em `vercel.json`, senão responde 404. |

## Fora de escopo

- Domínio próprio, canonical e sitemap.
- Cabeçalhos de cache e segurança personalizados (os padrões da Vercel já usam HTTPS e compressão).
