# Tarefas — Hospedagem na Vercel

Especificação: `specs/hospedagem-vercel/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                     | Critérios | Testes |
| ------------- | ------------------------------------------------------ | --------- | ------ |
| I01           | `vercel.json` com build, saída, `404.html` e rewrites. | CA01–CA03 | V01    |

## Tarefas de implementação

- [x] I01 — `vercel.json` na raiz. (CA01–CA03)

## Tarefas de testes

Configuração de hospedagem: não há teste automatizado local. A página exibida no 404 é coberta por `specs/pagina-nao-encontrada`.

## Tarefas de validação

- [ ] V01 — **Usuário**: importar o repositório na Vercel (preset Angular; `vercel.json` sobrescreve build e saída), publicar e conferir:
  - `/` carrega a landing;
  - `/login` e `/admin/cardapio` abertos diretamente carregam o app (200);
  - `/caminho-inexistente` responde 404 (DevTools › Network) e mostra "Página não encontrada".
- [ ] V02 — **Usuário**: no Supabase › Authentication › URL Configuration, incluir a URL da Vercel em Site URL/Redirect URLs, se o login usar redirecionamento.

## Checklist de conclusão

- [x] I01 concluída.
- [ ] CA02–CA03 validados na Vercel (V01).
