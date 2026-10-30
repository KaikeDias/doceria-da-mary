-- specs/seo-landing
-- RN08: região atendida exibida na landing e usada nas metas; preenche só se ainda estiver nula.

update public.configuracoes_site
   set regiao_atendida = 'Paes Landim, Piauí'
 where id = 1
   and regiao_atendida is null;
