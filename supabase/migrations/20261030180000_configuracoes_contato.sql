-- specs/landing-configuracoes-supabase
-- RN08: a landing passa a ler o contato do banco; preenche com os valores que estavam fixos no
--       front, só se ainda estiverem nulos.

update public.configuracoes_site
   set whatsapp = coalesce(whatsapp, '89994259584'),
       instagram = coalesce(instagram, 'doceriadamarypl')
 where id = 1
   and (whatsapp is null or instagram is null);
