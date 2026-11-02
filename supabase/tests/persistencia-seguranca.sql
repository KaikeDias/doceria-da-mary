begin;
select '1..1';

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin-local@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'usuario-local@example.test');
insert into public.administradores(user_id) values ('11111111-1111-1111-1111-111111111111');
insert into public.categorias(id,nome,rotulo,slug,visivel) values
  ('33333333-3333-3333-3333-333333333333','Teste oculto','Teste oculto','teste-oculto',false);
insert into public.produtos(id,nome,slug,categoria_id) values
  ('44444444-4444-4444-4444-444444444444','Oculto pela categoria','teste-produto-oculto','33333333-3333-3333-3333-333333333333');
insert into public.produto_imagens(produto_id,storage_path,posicao) values
  ('44444444-4444-4444-4444-444444444444','seed/antiga.webp',0);

set local role anon;
do $$ begin
  assert not exists(select 1 from public.produtos where slug='teste-produto-oculto'), 'anon leu produto oculto';
  assert not exists(select 1 from public.produto_imagens where storage_path='seed/antiga.webp'), 'anon leu imagem oculta';
  begin
    insert into public.produtos(nome,slug) values ('Ataque','ataque-anon');
    raise exception 'anon inseriu produto';
  exception when insufficient_privilege then null; end;
  begin
    perform public.salvar_produto('44444444-4444-4444-4444-444444444444','{}',false,'',null);
    raise exception 'anon gravou';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',true);
do $$ declare afetadas integer; begin
  assert not exists(select 1 from public.produtos where slug='teste-produto-oculto'), 'usuario comum leu produto oculto';
  assert not exists(select 1 from public.produto_imagens where storage_path='seed/antiga.webp'), 'usuario comum leu imagem oculta';
  update public.configuracoes_site set nome_doceria='Ataque' where id=1;
  get diagnostics afetadas = row_count;
  assert afetadas=0, 'usuario comum atualizou configuracoes';
  delete from public.produtos where id='44444444-4444-4444-4444-444444444444';
  get diagnostics afetadas = row_count;
  assert afetadas=0, 'usuario comum excluiu produto';
  begin
    insert into public.produtos(nome,slug) values ('Ataque','ataque-usuario');
    raise exception 'usuario comum inseriu produto';
  exception when insufficient_privilege then null; end;
  begin
    perform public.salvar_produto('44444444-4444-4444-4444-444444444444','{}',false,'',null);
    raise exception 'usuario comum gravou';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
do $$ declare repeticao integer; begin
  assert exists(select 1 from public.produtos where slug='teste-produto-oculto'), 'admin nao leu oculto';
  assert exists(select 1 from public.produto_imagens where storage_path='seed/antiga.webp'), 'admin nao leu imagem oculta';
  -- Falha depois de remover as referências deve restaurar toda a transação da RPC.
  begin
    perform public.salvar_produto('44444444-4444-4444-4444-444444444444', '{"nome":"Nao salvar"}',false,'',
      array['seed/1.webp','seed/2.webp']);
  exception when others then raise; end;
  assert (select count(*)=2 from public.produto_imagens where produto_id='44444444-4444-4444-4444-444444444444');
  begin
    perform public.salvar_produto('44444444-4444-4444-4444-444444444444','{"nome":"Falha"}',false,'',array['https://externo/foto']);
    raise exception 'aceitou caminho externo';
  exception when invalid_parameter_value then null; end;
  assert (select nome='Nao salvar' from public.produtos where id='44444444-4444-4444-4444-444444444444');
  assert (select count(*)=2 from public.produto_imagens where produto_id='44444444-4444-4444-4444-444444444444');
  begin
    perform public.salvar_produto('55555555-5555-5555-5555-555555555555','{"nome":"Novo"}',true,'teste-falha',array_fill('seed/a.webp'::text,array[6]));
    raise exception 'aceitou seis imagens';
  exception when invalid_parameter_value then null; end;
  assert not exists(select 1 from public.produtos where slug='teste-falha'), 'criou produto parcial';
  begin
    perform public.salvar_produto('55555555-5555-5555-5555-555555555555','{}',false,'',null);
    raise exception 'aceitou edicao inexistente';
  exception when no_data_found then null; end;
  for repeticao in 1..2 loop
    perform public.salvar_produto('55555555-5555-5555-5555-555555555555','{"nome":"Novo"}',true,'teste-idempotente',array['seed/a.webp']);
  end loop;
  assert (select count(*)=1 from public.produtos where id='55555555-5555-5555-5555-555555555555');
  assert (select count(*)=1 from public.produto_imagens where produto_id='55555555-5555-5555-5555-555555555555');
end $$;

-- O segundo editor usa o estado original: nenhum registro deve casar depois do primeiro salvar.
do $$ declare antigo text; afetadas integer; begin
  select nome_doceria into antigo from public.configuracoes_site where id=1;
  update public.configuracoes_site set nome_doceria='Primeira aba' where id=1 and nome_doceria=antigo;
  update public.configuracoes_site set nome_doceria='Segunda aba' where id=1 and nome_doceria=antigo;
  get diagnostics afetadas = row_count;
  assert afetadas=0, 'segunda aba sobrescreveu dados';
  assert (select nome_doceria='Primeira aba' from public.configuracoes_site where id=1);
end $$;

-- Injeta falha real no INSERT, depois do DELETE das referências, para testar rollback.
reset role;
create function pg_temp.recusar_imagem() returns trigger language plpgsql as $$
begin raise exception 'falha de teste' using errcode='23514'; end $$;
create trigger falha_de_teste before insert on public.produto_imagens
for each row execute function pg_temp.recusar_imagem();
set local role authenticated;
do $$ begin
  begin
    perform public.salvar_produto('44444444-4444-4444-4444-444444444444','{"nome":"Nao persistir"}',false,'',array['seed/nova.webp']);
    raise exception 'nao houve falha';
  exception when check_violation then null; end;
  assert (select nome='Nao salvar' from public.produtos where id='44444444-4444-4444-4444-444444444444');
  assert (select count(*)=2 from public.produto_imagens where produto_id='44444444-4444-4444-4444-444444444444'), 'perdeu fotos';
end $$;
reset role;
select 'ok 1 - RLS, autorizacao, transacao e repeticao de produto';
rollback;
