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
import { CategoriaForm } from './categoria-form';
import { AdminCategory, MenuStore } from './menu-store';

@Component({
  selector: 'app-categorias',
  imports: [
    NgTemplateOutlet,
    CategoriaForm,
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
  protected readonly deleting = signal<AdminCategory | null>(null);
  protected readonly removing = signal(false);
  // Produtos publicados de quem vai ser excluída; com algum, a exclusão é bloqueada.
  protected readonly active = computed(() => {
    const item = this.deleting();
    return item ? this.store.activeCount(item.id) : 0;
  });
  protected readonly form = viewChild.required(CategoriaForm);
  private readonly confirm = viewChild.required<ElementRef<HTMLDialogElement>>('confirm');
  private messageTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.store.load();
  }

  protected productCount({ productCount: count }: AdminCategory): string {
    if (count === 0) return 'Nenhum produto';
    return `${count} ${count === 1 ? 'produto' : 'produtos'}`;
  }

  protected status(item: AdminCategory): string {
    return this.saving() === item.id ? 'Salvando…' : item.visible ? 'Visível' : 'Oculta';
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

  protected askDelete(item: AdminCategory): void {
    this.deleting.set(item);
    this.confirm().nativeElement.showModal();
  }

  protected async confirmDelete(): Promise<void> {
    const item = this.deleting()!;
    this.removing.set(true);
    try {
      await this.store.deleteCategory(item);
      this.form().close();
      this.notify(`${item.name} foi excluída.`);
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
}
