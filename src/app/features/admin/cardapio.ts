import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideCake,
  LucideCakeSlice,
  LucideCircleCheck,
  LucideEllipsis,
  LucideGlobe,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideSearchX,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { categories, formatPrice } from '../catalog/catalog';
import { MenuItem, MenuStore } from './menu-store';

export type StatusFilter = 'todos' | 'publicados' | 'ocultos';

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
    RouterLink,
    LucideCake,
    LucideCakeSlice,
    LucideCircleCheck,
    LucideEllipsis,
    LucideGlobe,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideSearchX,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './cardapio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cardapio {
  private readonly confirm = viewChild.required<ElementRef<HTMLDialogElement>>('confirm');
  private messageTimer?: ReturnType<typeof setTimeout>;

  protected readonly categories = categories;
  protected readonly statuses: readonly { id: StatusFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'publicados', label: 'Publicados' },
    { id: 'ocultos', label: 'Ocultos' },
  ];
  private readonly store = inject(MenuStore);
  protected readonly items = this.store.items;
  protected readonly query = signal('');
  protected readonly category = signal('todas');
  protected readonly status = signal<StatusFilter>('todos');
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());
  protected readonly saving = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly deleting = signal<MenuItem | null>(null);

  protected readonly publishedCount = computed(
    () => this.items().filter((item) => item.published).length,
  );
  protected readonly visible = computed(() =>
    this.items().filter((item) => matches(item, this.query(), this.category(), this.status())),
  );

  protected categoryLabel(id: string): string {
    return categories.find((category) => category.id === id)?.label ?? '';
  }

  constructor() {
    const flash = this.store.flash();
    if (flash) {
      this.store.flash.set('');
      this.notify(flash);
    }
  }

  protected amount(item: MenuItem): string {
    return item.price ? formatPrice({ ...item.price, kind: 'fixed' }) : 'Sob consulta';
  }

  protected toggle(item: MenuItem): void {
    this.saving.set(item.id);
    // shortcut: salvamento simulado (sem backend), trocar pela chamada à API quando houver.
    setTimeout(() => {
      this.saving.set(null);
      if (!this.items().some((other) => other.id === item.id)) return;
      this.items.update((items) =>
        items.map((other) =>
          other.id === item.id ? { ...other, published: !other.published } : other,
        ),
      );
      this.notify(
        item.published ? `${item.name} saiu do site.` : `${item.name} agora aparece no site.`,
      );
    }, 600);
  }

  protected askDelete(item: MenuItem): void {
    this.deleting.set(item);
    this.confirm().nativeElement.showModal();
  }

  protected confirmDelete(): void {
    const item = this.deleting()!;
    this.items.update((items) => items.filter((other) => other.id !== item.id));
    this.confirm().nativeElement.close();
    this.notify(`${item.name} foi excluído do cardápio.`);
  }

  // Fecha ao clicar no fundo escurecido (o próprio <dialog>).
  protected confirmClick(event: MouseEvent): void {
    if (event.target === this.confirm().nativeElement) this.confirm().nativeElement.close();
  }

  protected notify(text: string): void {
    clearTimeout(this.messageTimer);
    this.message.set(text);
    this.messageTimer = setTimeout(() => this.message.set(''), 5000);
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
