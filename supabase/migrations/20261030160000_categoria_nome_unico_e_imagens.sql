-- specs/formulario-categoria-admin
-- RN01: um nome só por categoria (chip, cards e painel). Fica o nome que o painel já mostra.
--       Daqui em diante o painel grava `nome` e `rotulo` sempre iguais.
-- RN02: só imagens enviadas pelo painel (bucket "site"); os assets estáticos deixam de ser usados.

update public.categorias
   set nome = rotulo
 where nome::text <> rotulo;

update public.categorias
   set imagem_url = null
 where imagem_url like 'images/%';
