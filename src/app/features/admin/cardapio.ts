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
  LucideCircleAlert,
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
import { formatPrice } from '../catalog/catalog';
import { loadError, saveError } from '../../core/supabase/supabase';
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
    LucideCircleAlert,
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

  protected readonly statuses: readonly { id: StatusFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'publicados', label: 'Publicados' },
    { id: 'ocultos', label: 'Ocultos' },
  ];
  protected readonly store = inject(MenuStore);
  protected readonly loadError = loadError;
  protected readonly state = this.store.state;
  protected readonly items = this.store.items;
  protected readonly categories = this.store.categories;
  protected readonly query = signal('');
  protected readonly category = signal('todas');
  protected readonly status = signal<StatusFilter>('todos');
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());
  protected readonly saving = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly failed = signal(false);
  protected readonly deleting = signal<MenuItem | null>(null);
  protected readonly removing = signal(false);

  protected readonly publishedCount = computed(
    () => this.items().filter((item) => item.published).length,
  );
  protected readonly visible = computed(() =>
    this.items().filter((item) => matches(item, this.query(), this.category(), this.status())),
  );

  protected categoryLabel(id: string): string {
    return this.store.categoryLabel(id);
  }

  constructor() {
    this.store.load();
    const flash = this.store.flash();
    if (flash) {
      this.store.flash.set('');
      this.notify(flash);
    }
  }

  protected amount(item: MenuItem): string {
    return item.price ? formatPrice({ ...item.price, kind: 'fixed' }) : 'Sob consulta';
  }

  protected async toggle(item: MenuItem): Promise<void> {
    this.saving.set(item.id);
    try {
      await this.store.setPublished(item);
      this.notify(
        item.published ? `${item.name} saiu do site.` : `${item.name} agora aparece no site.`,
      );
    } catch {
      this.notify(saveError, true);
    } finally {
      this.saving.set(null);
    }
  }

  protected askDelete(item: MenuItem): void {
    this.deleting.set(item);
    this.confirm().nativeElement.showModal();
  }

  protected async confirmDelete(): Promise<void> {
    const item = this.deleting()!;
    this.removing.set(true);
    try {
      await this.store.delete(item);
      this.notify(`${item.name} foi excluído do cardápio.`);
    } catch {
      this.notify(saveError, true);
    } finally {
      this.removing.set(false);
      this.confirm().nativeElement.close();
    }
  }

  // Fecha ao clicar no fundo escurecido (o próprio <dialog>), exceto durante a exclusão.
  protected confirmClick(event: MouseEvent): void {
    if (event.target === this.confirm().nativeElement && !this.removing())
      this.confirm().nativeElement.close();
  }

  protected notify(text: string, failed = false): void {
    clearTimeout(this.messageTimer);
    this.failed.set(failed);
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
