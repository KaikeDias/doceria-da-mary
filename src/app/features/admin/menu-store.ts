import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  AdminCategory,
  AdminMenuRepository,
  CategoryInput,
  MenuItem,
} from './admin-menu-repository';

export type { AdminCategory, MenuItem };

@Injectable({ providedIn: 'root' })
export class MenuStore {
  private readonly repository = inject(AdminMenuRepository);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  readonly items = signal<readonly MenuItem[]>([]);
  readonly categories = signal<readonly AdminCategory[]>([]);
  // Mensagem de sucesso que a lista exibe ao abrir depois de salvar o formulário.
  readonly flash = signal('');

  // Recarrega do banco a cada entrada nas telas do painel.
  async load(): Promise<boolean> {
    this.state.set('loading');
    try {
      const [items, categories] = await Promise.all([
        this.repository.listProducts(),
        this.repository.listCategories(),
      ]);
      this.items.set(items);
      this.categories.set(categories);
      this.state.set('ready');
      return true;
    } catch {
      this.state.set('error');
      return false;
    }
  }

  find(id: string): MenuItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  categoryLabel(id: string): string {
    return this.categories().find((category) => category.id === id)?.name ?? 'Sem categoria';
  }

  async setPublished(item: MenuItem): Promise<void> {
    await this.repository.setPublished(item.id, !item.published);
    this.items.update((items) =>
      items.map((other) =>
        other.id === item.id ? { ...other, published: !item.published } : other,
      ),
    );
  }

  async setCategoryVisible(category: AdminCategory): Promise<void> {
    await this.repository.setCategoryVisible(category.id, !category.visible);
    this.categories.update((categories) =>
      categories.map((other) =>
        other.id === category.id ? { ...other, visible: !category.visible } : other,
      ),
    );
  }

  // Produtos publicados da categoria; com algum, ela não pode ser excluída.
  activeCount(categoryId: string): number {
    return this.items().filter((item) => item.published && item.categoryId === categoryId).length;
  }

  // Recarrega tudo depois: a contagem e os produtos sem categoria vêm do banco.
  async saveCategory(
    input: CategoryInput,
    existing?: AdminCategory,
  ): Promise<{ imageFailed: boolean }> {
    const result = await this.repository.saveCategory(input, existing);
    await this.load();
    return result;
  }

  async deleteCategory(category: AdminCategory): Promise<void> {
    await this.repository.deleteCategory(category);
    await this.load();
  }

  async delete(item: MenuItem): Promise<void> {
    await this.repository.deleteProduct(item);
    this.items.update((items) => items.filter((other) => other.id !== item.id));
  }
}

// O formulário só abre com produtos e categorias carregados; id inexistente volta para a lista.
export const menuReady: CanActivateFn = async (route) => {
  const store = inject(MenuStore);
  const list = inject(Router).createUrlTree(['/admin/cardapio']);
  const id = route.paramMap.get('id');
  return ((await store.load()) && (!id || !!store.find(id))) || list;
};
