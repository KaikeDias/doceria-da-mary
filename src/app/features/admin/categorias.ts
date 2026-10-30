import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideInfo,
  LucidePencil,
  LucidePlus,
  LucideTags,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { loadError, saveError } from '../../core/supabase/supabase';
import { AdminCategory, MenuStore } from './menu-store';

@Component({
  selector: 'app-categorias',
  imports: [
    NgTemplateOutlet,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideInfo,
    LucidePencil,
    LucidePlus,
    LucideTags,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './categorias.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categorias {
  protected readonly store = inject(MenuStore);
  protected readonly loadError = loadError;
  protected readonly state = this.store.state;
  protected readonly items = this.store.categories;
  protected readonly saving = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly failed = signal(false);
  private messageTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.store.load();
  }

  protected productCount({ productCount: count }: AdminCategory): string {
    if (count === 0) return 'Nenhum produto';
    return `${count} ${count === 1 ? 'produto' : 'produtos'}`;
  }

  protected async toggle(item: AdminCategory): Promise<void> {
    this.saving.set(item.id);
    try {
      await this.store.setCategoryVisible(item);
      this.notify(
        item.visible ? `${item.name} saiu do site.` : `${item.name} agora aparece no site.`,
      );
    } catch {
      this.notify(saveError, true);
    } finally {
      this.saving.set(null);
    }
  }

  private notify(text: string, failed = false): void {
    clearTimeout(this.messageTimer);
    this.failed.set(failed);
    this.message.set(text);
    this.messageTimer = setTimeout(() => this.message.set(''), 5000);
  }
}
