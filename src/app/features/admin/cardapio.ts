import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideCakeSlice,
  LucideEllipsis,
  LucideGlobe,
  LucidePencil,
  LucidePlus,
  LucideSearch,
} from '@lucide/angular';
import { Product, categories, formatPrice, products } from '../catalog/catalog';

export type StatusFilter = 'todos' | 'publicados' | 'ocultos';

// shortcut: publicação só em memória (sem backend), trocar pelo estado salvo quando houver API.
const hiddenByDefault = new Set(['caixa-docinhos']);

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function matches(
  item: { name: string; categoryId: string; published: boolean },
  query: string,
  category: string,
  status: StatusFilter,
): boolean {
  return (
    normalize(item.name).includes(normalize(query)) &&
    (category === 'todas' || item.categoryId === category) &&
    (status === 'todos' || item.published === (status === 'publicados'))
  );
}

@Component({
  selector: 'app-cardapio',
  imports: [
    NgTemplateOutlet,
    LucideCakeSlice,
    LucideEllipsis,
    LucideGlobe,
    LucidePencil,
    LucidePlus,
    LucideSearch,
  ],
  templateUrl: './cardapio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cardapio {
  protected readonly categories = categories;
  protected readonly statuses: readonly { id: StatusFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'publicados', label: 'Publicados' },
    { id: 'ocultos', label: 'Ocultos' },
  ];
  protected readonly items = signal(
    products.map((product) => ({ ...product, published: !hiddenByDefault.has(product.id) })),
  );
  protected readonly query = signal('');
  protected readonly category = signal('todas');
  protected readonly status = signal<StatusFilter>('todos');
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());

  protected readonly publishedCount = computed(
    () => this.items().filter((item) => item.published).length,
  );
  protected readonly visible = computed(() =>
    this.items().filter((item) => matches(item, this.query(), this.category(), this.status())),
  );

  protected categoryLabel(id: string): string {
    return categories.find((category) => category.id === id)?.label ?? '';
  }

  protected amount(product: Product): string {
    return formatPrice({ ...product.price, kind: 'fixed' });
  }

  protected toggle(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, published: !item.published } : item)),
    );
  }

  protected clearFilters(): void {
    this.query.set('');
    this.category.set('todas');
    this.status.set('todos');
  }

  protected imageFailed(id: string): void {
    this.failedImages.update((ids) => new Set([...ids, id]));
  }
}
