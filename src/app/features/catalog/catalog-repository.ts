import { inject, Injectable } from '@angular/core';
import {
  categoryImageUrl,
  check,
  publicUrl,
  Supabase,
  toPrice,
} from '../../core/supabase/supabase';
import { Category, Product } from './catalog';

export interface Catalog {
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
}

@Injectable({ providedIn: 'root', useFactory: () => inject(SupabaseCatalogRepository) })
export abstract class CatalogRepository {
  abstract load(): Promise<Catalog>;
}

@Injectable({ providedIn: 'root' })
export class SupabaseCatalogRepository implements CatalogRepository {
  private readonly supabase = inject(Supabase);

  async load(): Promise<Catalog> {
    const db = this.supabase.client;
    const [categoryRows, productRows] = await Promise.all([
      // Filtro explícito: com sessão de admin o RLS também libera as ocultas.
      db
        .from('categorias')
        .select('slug, rotulo, imagem_url')
        .eq('visivel', true)
        .order('ordem')
        .then(check),
      db.from('cardapio_publico').select('*').order('ordem').then(check),
    ]);
    const ids = productRows.map((row) => row.id!);
    const imageRows = ids.length
      ? check(
          await db
            .from('produto_imagens')
            .select('produto_id, storage_path')
            .in('produto_id', ids)
            .order('posicao'),
        )
      : [];

    return {
      categories: categoryRows.map((row) => ({
        id: row.slug,
        // Um nome só por categoria: o chip usa o mesmo nome dos cards.
        name: row.rotulo,
        label: row.rotulo,
        image: categoryImageUrl(row.imagem_url),
      })),
      products: productRows.map((row) => {
        const [image = '', ...more] = imageRows
          .filter((img) => img.produto_id === row.id)
          .map((img) => publicUrl('produtos', img.storage_path));
        const name = row.nome!;
        return {
          id: row.slug!,
          name,
          description: row.descricao ?? '',
          details: row.detalhes ?? undefined,
          priceNote: row.observacao_preco ?? undefined,
          // Formato garantido pela check informacoes_validas() do banco.
          information: (row.informacoes ?? []) as unknown as Product['information'],
          categoryId: row.categoria_slug ?? '',
          categoryLabel: row.categoria_rotulo ?? '',
          image,
          additionalImages: more.map((src, i) => ({ src, alt: `${name} — foto ${i + 2}` })),
          price: toPrice(row.preco, row.preco_a_partir ?? false),
        };
      }),
    };
  }
}
