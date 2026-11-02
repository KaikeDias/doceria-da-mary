-- Dados e referências de fotos confirmados juntos, com o mesmo UUID em cada tentativa.
create function public.salvar_produto(
  p_id uuid, p_campos jsonb, p_novo boolean, p_slug text, p_imagens text[]
) returns uuid
language plpgsql security invoker set search_path = public
as $$
declare
  atual public.produtos;
begin
  if not public.is_admin() then
    raise exception 'Administrador necessário' using errcode = '42501';
  end if;
  -- Também serializa duas tentativas de criação antes de existir a linha.
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into atual from public.produtos where id = p_id for update;
  if not found then
    if not p_novo then
      raise exception 'Produto inexistente' using errcode = 'P0002';
    end if;
    insert into public.produtos (id, nome, slug, ordem)
    values (p_id, p_campos->>'nome', p_slug,
      (select coalesce(max(ordem), 0) + 1 from public.produtos));
    select * into atual from public.produtos where id = p_id;
  end if;
  -- Lista fechada: o cliente não pode mudar publicação, slug ou ordem na edição.
  atual := jsonb_populate_record(atual, p_campos - array[
    'id','slug','ordem','publicado','created_at','updated_at','detalhes','informacoes','observacao_preco'
  ]);
  update public.produtos set nome = atual.nome, categoria_id = atual.categoria_id,
    descricao = atual.descricao, preco = atual.preco, preco_a_partir = atual.preco_a_partir
  where id = p_id;
  if p_imagens is not null then
    if cardinality(p_imagens) > 5 or exists (
      select 1 from unnest(p_imagens) caminho
      where caminho is null or caminho !~ ('^(' || p_id::text || '/|seed/)[A-Za-z0-9._-]+$')
    ) then
      raise exception 'Referências de imagens inválidas' using errcode = '22023';
    end if;
    delete from public.produto_imagens where produto_id = p_id;
    insert into public.produto_imagens (produto_id, storage_path, alt, posicao)
    select p_id, caminho, atual.nome, (posicao - 1)::smallint
    from unnest(p_imagens) with ordinality as imagens(caminho, posicao);
  end if;
  return p_id;
end;
$$;

revoke all on function public.salvar_produto(uuid,jsonb,boolean,text,text[]) from public, anon;
grant execute on function public.salvar_produto(uuid,jsonb,boolean,text,text[]) to authenticated;
