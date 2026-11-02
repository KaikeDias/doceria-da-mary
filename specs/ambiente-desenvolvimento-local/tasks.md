# Tarefas

- [x] I01 (CA01): trocar environment development e documentar comandos locais.
- [x] T01 (CA01): verificar separacao dos hosts.
- [x] T02 (CA02): atualizar mock e executar Playwright.
- [x] V01: validar build e registrar resultados.

## Evidencias

- CA01: teste unitario do endpoint local passou; environment de producao preservado.
- CA02: 71 testes Playwright passaram no Edge com endpoint local simulado.
- Build e verificacao de formato passaram.
- Docker local desligado: nao foi iniciado o Supabase local completo. Migrations e politicas foram exercitadas em Postgres isolado com Auth/Storage minimos.
