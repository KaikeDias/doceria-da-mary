import { inject, Injectable } from '@angular/core';
import { TablesUpdate } from '../../core/supabase/database.types';
import {
  check,
  fromPrice,
  Price,
  productImagePath,
  publicUrl,
  Supabase,
  toPrice,
} from '../../core/supabase/supabase';

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  // Vazio = sem categoria.
  readonly categoryId: string;
  readonly description: string;
  // null = "Sob consulta".
  readonly price: Price | null;
  // URLs públicas; a primeira é a principal.
  readonly images: readonly string[];
  readonly published: boolean;
}

export interface AdminCategory {
  readonly id: string;
  readonly name: string;
  readonly visible: boolean;
  readonly productCount: number;
}

export interface ProductInput {
  readonly name: string;
  readonly categoryId: string;
  readonly description: string;
  readonly price: Price | null;
  // URL de uma foto já salva ou arquivo novo, na ordem final (a primeira é a principal).
  readonly images: readonly (string | File)[];
}

@Injectable({ providedIn: 'root', useFactory: () => inject(SupabaseAdminMenuRepository) })
export abstract class AdminMenuRepository {
  abstract listProducts(): Promise<MenuItem[]>;
  abstract listCategories(): Promise<AdminCategory[]>;
  abstract setPublished(id: string, published: boolean): Promise<void>;
  abstract setCategoryVisible(id: string, visible: boolean): Promise<void>;
  abstract deleteProduct(item: MenuItem): Promise<void>;
  abstract saveProduct(
    input: ProductInput,
    existing?: MenuItem,
  ): Promise<{ id: string; failedUploads: number }>;
}

export function slugify(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'produto'
  );
}

@Injectable({ providedIn: 'root' })
export class SupabaseAdminMenuRepository implements AdminMenuRepository {
  private readonly supabase = inject(Supabase);

  async listProducts(): Promise<MenuItem[]> {
    const rows = check(
      await this.supabase.client
        .from('produtos')
        .select(
          'id, nome, descricao, preco, preco_a_partir, publicado, categoria_id, produto_imagens(storage_path, posicao)',
        )
        .order('ordem')
        .order('created_at'),
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.nome,
      categoryId: row.categoria_id ?? '',
      description: row.descricao ?? '',
      price: toPrice(row.preco, row.preco_a_partir),
      images: [...row.produto_imagens]
        .sort((a, b) => a.posicao - b.posicao)
        .map((image) => publicUrl('produtos', image.storage_path)),
      published: row.publicado,
    }));
  }

  async listCategories(): Promise<AdminCategory[]> {
    const rows = check(
      await this.supabase.client
        .from('categorias_com_contagem')
        .select('id, rotulo, visivel, total_produtos')
        .order('ordem'),
    );
    return rows.map((row) => ({
      id: row.id!,
      name: row.rotulo!,
      visible: row.visivel!,
      productCount: row.total_produtos ?? 0,
    }));
  }

  async setPublished(id: string, published: boolean): Promise<void> {
    check(
      await this.supabase.client.from('produtos').update({ publicado: published }).eq('id', id),
    );
  }

  async setCategoryVisible(id: string, visible: boolean): Promise<void> {
    check(await this.supabase.client.from('categorias').update({ visivel: visible }).eq('id', id));
  }

  async deleteProduct(item: MenuItem): Promise<void> {
    // As linhas de produto_imagens saem em cascata; os arquivos ficam no Storage.
    check(await this.supabase.client.from('produtos').delete().eq('id', item.id));
    await this.removeFiles(item.images.map(productImagePath));
  }

  async saveProduct(
    input: ProductInput,
    existing?: MenuItem,
  ): Promise<{ id: string; failedUploads: number }> {
    const db = this.supabase.client;
    const fields = {
      nome: input.name,
      categoria_id: input.categoryId || null,
      descricao: input.description || null,
      ...fromPrice(input.price),
    };
    let id: string;
    if (existing) {
      id = existing.id;
      const before: Record<string, unknown> = {
        nome: existing.name,
        categoria_id: existing.categoryId || null,
        descricao: existing.description || null,
        ...fromPrice(existing.price),
      };
      const changed = Object.entries(fields).filter(([key, value]) => before[key] !== value);
      if (changed.length) {
        const patch: TablesUpdate<'produtos'> = Object.fromEntries(changed);
        check(await db.from('produtos').update(patch).eq('id', id));
      }
    } else {
      const [last] = check(
        await db.from('produtos').select('ordem').order('ordem', { ascending: false }).limit(1),
      );
      const row = check(
        await db
          .from('produtos')
          .insert({
            ...fields,
            slug: await this.uniqueSlug(input.name),
            publicado: true,
            ordem: (last?.ordem ?? 0) + 1,
          })
          .select('id')
          .single(),
      );
      id = row.id;
    }

    const before = existing?.images ?? [];
    const unchanged =
      input.images.length === before.length &&
      input.images.every((image, i) => image === before[i]);
    if (unchanged) return { id, failedUploads: 0 };

    let failedUploads = 0;
    const paths: string[] = [];
    for (const image of input.images) {
      if (typeof image === 'string') {
        paths.push(productImagePath(image));
        continue;
      }
      const path = `${id}/${crypto.randomUUID()}.${image.type.split('/')[1].replace('jpeg', 'jpg')}`;
      const { error } = await db.storage
        .from('produtos')
        .upload(path, image, { contentType: image.type });
      if (error) failedUploads++;
      else paths.push(path);
    }
    // Recria as linhas na ordem final: posição 0 = principal.
    check(await db.from('produto_imagens').delete().eq('produto_id', id));
    if (paths.length) {
      check(
        await db.from('produto_imagens').insert(
          paths.map((storage_path, posicao) => ({
            produto_id: id,
            storage_path,
            alt: input.name,
            posicao,
          })),
        ),
      );
    }
    const removed = before.filter((url) => !input.images.includes(url));
    if (removed.length) await this.removeFiles(removed.map(productImagePath));
    return { id, failedUploads };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const rows = check(
      await this.supabase.client.from('produtos').select('slug').like('slug', `${base}%`),
    );
    const taken = new Set(rows.map((row) => row.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    return slug;
  }

  // Arquivo órfão no Storage não afeta o site; a falha só é registrada.
  private async removeFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await this.supabase.client.storage.from('produtos').remove(paths);
    if (error) console.error('Falha ao remover fotos do Storage', error);
  }
}
