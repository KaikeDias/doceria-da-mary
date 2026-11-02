import { inject, Injectable } from '@angular/core';
import { TablesUpdate } from '../../core/supabase/database.types';
import {
  categoryImagePath,
  categoryImageUrl,
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
  // URL pública; vazia = sem imagem.
  readonly image: string;
}

export interface CategoryInput {
  readonly name: string;
  readonly visible: boolean;
  // URL da imagem atual ou arquivo novo.
  readonly image: string | File;
}

// O banco recusou o nome (ou o slug gerado dele) por já existir.
export class DuplicateCategory extends Error {}

export interface ProductInput {
  readonly id?: string;
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
  abstract saveCategory(
    input: CategoryInput,
    existing?: AdminCategory,
  ): Promise<{ imageFailed: boolean }>;
  abstract deleteCategory(category: AdminCategory): Promise<void>;
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
        .select('id, rotulo, visivel, total_produtos, imagem_url')
        .order('ordem'),
    );
    return rows.map((row) => ({
      id: row.id!,
      name: row.rotulo!,
      visible: row.visivel!,
      productCount: row.total_produtos ?? 0,
      image: categoryImageUrl(row.imagem_url),
    }));
  }

  async setPublished(id: string, published: boolean): Promise<void> {
    check(
      await this.supabase.client
        .from('produtos')
        .update({ publicado: published })
        .eq('id', id)
        .select('id')
        .single(),
    );
  }

  async setCategoryVisible(id: string, visible: boolean): Promise<void> {
    check(
      await this.supabase.client
        .from('categorias')
        .update({ visivel: visible })
        .eq('id', id)
        .select('id')
        .single(),
    );
  }

  async deleteProduct(item: MenuItem): Promise<void> {
    // As linhas de produto_imagens saem em cascata; os arquivos ficam no Storage.
    check(
      await this.supabase.client.from('produtos').delete().eq('id', item.id).select('id').single(),
    );
    await this.removeFiles('produtos', item.images.map(productImagePath));
  }

  async saveProduct(
    input: ProductInput,
    existing?: MenuItem,
  ): Promise<{ id: string; failedUploads: number }> {
    const db = this.supabase.client;
    const id = existing?.id ?? input.id ?? crypto.randomUUID();
    const fields = {
      nome: input.name,
      categoria_id: input.categoryId || null,
      descricao: input.description || null,
      ...fromPrice(input.price),
    };
    const before = existing?.images ?? [];
    const unchanged =
      input.images.length === before.length &&
      input.images.every((image, i) => image === before[i]);
    let failedUploads = 0;
    const paths: string[] = [];
    if (!unchanged) {
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
    }
    const previous = existing
      ? {
          nome: existing.name,
          categoria_id: existing.categoryId || null,
          descricao: existing.description || null,
          ...fromPrice(existing.price),
        }
      : {};
    const patch = Object.fromEntries(
      Object.entries(fields).filter(
        ([key, value]) => (previous as Record<string, unknown>)[key] !== value,
      ),
    );
    const slug = existing ? '' : await this.uniqueSlug('produtos', input.name);
    check(
      // shortcut: resposta incerta pode deixar uploads órfãos; reconciliar o Storage se o volume crescer.
      await db.rpc('salvar_produto', {
        p_id: id,
        p_campos: patch,
        p_novo: !existing,
        p_slug: slug,
        p_imagens: unchanged ? null : paths,
      }),
    );
    const removed = before.filter((url) => !input.images.includes(url));
    if (removed.length) await this.removeFiles('produtos', removed.map(productImagePath));
    return { id, failedUploads };
  }

  async saveCategory(
    input: CategoryInput,
    existing?: AdminCategory,
  ): Promise<{ imageFailed: boolean }> {
    const db = this.supabase.client;
    let id: string;
    try {
      if (existing) {
        id = existing.id;
        const patch: TablesUpdate<'categorias'> = {};
        // Um nome só: chip, cards e painel.
        if (input.name !== existing.name)
          Object.assign(patch, { nome: input.name, rotulo: input.name });
        if (input.visible !== existing.visible) patch.visivel = input.visible;
        if (Object.keys(patch).length)
          check(await db.from('categorias').update(patch).eq('id', id).select('id').single());
      } else {
        const [last] = check(
          await db.from('categorias').select('ordem').order('ordem', { ascending: false }).limit(1),
        );
        const row = check(
          await db
            .from('categorias')
            .insert({
              nome: input.name,
              rotulo: input.name,
              slug: await this.uniqueSlug('categorias', input.name),
              visivel: input.visible,
              ordem: (last?.ordem ?? 0) + 1,
            })
            .select('id')
            .single(),
        );
        id = row.id;
      }
    } catch (error) {
      throw (error as { code?: string }).code === '23505' ? new DuplicateCategory() : error;
    }

    if (typeof input.image === 'string') return { imageFailed: false };
    const file = input.image;
    const path = `categorias/${id}/${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`;
    const { error } = await db.storage.from('site').upload(path, file, { contentType: file.type });
    if (error) return { imageFailed: true };
    const imageUpdate = db.from('categorias').update({ imagem_url: path }).eq('id', id);
    check(
      await (
        existing?.image
          ? imageUpdate.eq('imagem_url', categoryImagePath(existing.image))
          : imageUpdate.is('imagem_url', null)
      )
        .select('id')
        .single(),
    );
    if (existing?.image) await this.removeFiles('site', [categoryImagePath(existing.image)]);
    return { imageFailed: false };
  }

  async deleteCategory(category: AdminCategory): Promise<void> {
    // Os produtos ficam sem categoria pelo banco (on delete set null).
    check(
      await this.supabase.client
        .from('categorias')
        .delete()
        .eq('id', category.id)
        .select('id')
        .single(),
    );
    if (category.image) await this.removeFiles('site', [categoryImagePath(category.image)]);
  }

  private async uniqueSlug(table: 'produtos' | 'categorias', name: string): Promise<string> {
    const base = slugify(name);
    const rows = check(
      await this.supabase.client.from(table).select('slug').like('slug', `${base}%`),
    );
    const taken = new Set(rows.map((row) => row.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    return slug;
  }

  // Arquivo órfão no Storage não afeta o site; a falha só é registrada.
  private async removeFiles(bucket: 'produtos' | 'site', paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await this.supabase.client.storage.from(bucket).remove(paths);
    if (error) console.error('Falha ao remover fotos do Storage', error);
  }
}
